"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import type {
  AuthScope,
  AuthSession,
  AuthStatus,
  LoginResponsePayload,
  PatientClaimPayload,
  TokenPairPayload
} from "./auth.types";
import {
  ApiClientError,
  buildApiUrl,
  parseApiEnvelope,
  toApiClientError
} from "./hms-api";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  readonly body?: BodyInit | Record<string, unknown> | null;
  readonly skipAuth?: boolean;
  readonly retryOnUnauthorized?: boolean;
  readonly scope?: AuthScope;
};

type AuthContextValue = {
  readonly apiFetch: <T>(path: string, options?: ApiFetchOptions) => Promise<T>;
  readonly bootstrap: (scope?: AuthScope) => Promise<AuthSession | null>;
  readonly bootstrapped: boolean;
  readonly claimPatient: (payload: PatientClaimPayload) => Promise<AuthSession>;
  readonly login: (
    email: string,
    password: string,
    scope?: AuthScope
  ) => Promise<AuthSession>;
  readonly logout: (scope?: AuthScope) => Promise<void>;
  readonly session: AuthSession | null;
  readonly status: AuthStatus;
};

type JwtClaims = {
  readonly exp: number;
  readonly name: string;
  readonly role: AuthSession["role"];
  readonly sub: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [bootstrapped, setBootstrapped] = useState(false);
  const bootstrapPromiseRef = useRef<
    Partial<Record<AuthScope, Promise<AuthSession | null>>>
  >({});
  const sessionRef = useRef<AuthSession | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  async function requestPublic<T>(path: string, options?: ApiFetchOptions): Promise<T> {
    const response = await fetch(buildApiUrl(path), createRequestInit(options));
    const envelope = await parseApiEnvelope<T>(response);

    if (!response.ok || !envelope?.success) {
      throw toApiClientError(response, envelope, "Request failed");
    }

    return envelope.data;
  }

  function applySession(accessToken: string, scope: AuthScope) {
    const claims = parseJwtClaims(accessToken);
    const nextSession = {
      accessToken,
      expiresAt: claims.exp * 1000,
      fullName: claims.name,
      role: claims.role,
      scope,
      userId: claims.sub
    } satisfies AuthSession;

    sessionRef.current = nextSession;
    setSession(nextSession);
    setStatus("authenticated");
    setBootstrapped(true);
    return nextSession;
  }

  function clearSession() {
    sessionRef.current = null;
    setSession(null);
    setStatus("unauthenticated");
    setBootstrapped(true);
  }

  async function refreshSession(scope: AuthScope) {
    try {
      const tokens = await requestPublic<TokenPairPayload>(authPath(scope, "refresh"), {
        method: "POST"
      });
      return applySession(tokens.accessToken, scope);
    } catch {
      clearSession();
      return null;
    }
  }

  async function ensureAccessToken(scope: AuthScope) {
    const currentSession = sessionRef.current;
    if (
      currentSession &&
      currentSession.scope === scope &&
      currentSession.expiresAt > Date.now() + 30_000
    ) {
      return currentSession.accessToken;
    }

    const refreshedSession = await refreshSession(scope);
    if (!refreshedSession) {
      throw new ApiClientError(401, "Authentication is required", "unauthorized");
    }

    return refreshedSession.accessToken;
  }

  async function bootstrap(scope: AuthScope = "staff") {
    const currentPromise = bootstrapPromiseRef.current[scope];
    if (currentPromise) {
      return currentPromise;
    }

    if (
      sessionRef.current &&
      sessionRef.current.scope === scope &&
      sessionRef.current.expiresAt > Date.now() + 30_000
    ) {
      setStatus("authenticated");
      setBootstrapped(true);
      return sessionRef.current;
    }

    setStatus("loading");
    const promise = refreshSession(scope).finally(() => {
      delete bootstrapPromiseRef.current[scope];
    });
    bootstrapPromiseRef.current[scope] = promise;
    return promise;
  }

  async function login(
    email: string,
    password: string,
    scope: AuthScope = "staff"
  ) {
    setStatus("loading");

    try {
      const payload = await requestPublic<LoginResponsePayload>(authPath(scope, "login"), {
        body: { email, password },
        method: "POST"
      });
      return applySession(payload.tokens.accessToken, scope);
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function claimPatient(payload: PatientClaimPayload) {
    setStatus("loading");

    try {
      const response = await requestPublic<LoginResponsePayload>("/patient-auth/claim", {
        body: payload,
        method: "POST"
      });
      return applySession(response.tokens.accessToken, "patient");
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function logout(scope: AuthScope = sessionRef.current?.scope ?? "staff") {
    try {
      await requestPublic<string>(authPath(scope, "logout"), {
        method: "POST",
        skipAuth: true
      });
    } catch {
      // Clear the local in-memory session even if backend logout fails.
    }

    clearSession();
  }

  async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
    const scope = options?.scope ?? "staff";

    async function performRequest(accessToken: string | null, retryOnUnauthorized: boolean): Promise<T> {
      const requestOptions = createRequestInit(options);
      const headers = new Headers(requestOptions.headers);

      if (accessToken && !options?.skipAuth) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const response = await fetch(buildApiUrl(path), {
        ...requestOptions,
        headers
      });

      if (response.status === 401 && retryOnUnauthorized && !options?.skipAuth) {
        const refreshedSession = await refreshSession(scope);
        if (refreshedSession) {
          return performRequest(refreshedSession.accessToken, false);
        }
      }

      const envelope = await parseApiEnvelope<T>(response);
      if (!response.ok || !envelope?.success) {
        throw toApiClientError(response, envelope, "Request failed");
      }

      return envelope.data;
    }

    const accessToken = options?.skipAuth ? null : await ensureAccessToken(scope);
    return performRequest(accessToken, options?.retryOnUnauthorized !== false);
  }

  return (
    <AuthContext.Provider
      value={{
        apiFetch,
        bootstrap,
        bootstrapped,
        claimPatient,
        login,
        logout,
        session,
        status
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

function createRequestInit(options?: ApiFetchOptions): RequestInit {
  const { scope: _scope, ...requestOptions } = options ?? {};
  const headers = new Headers(options?.headers);
  const normalizedBody = normalizeBody(options?.body);

  if (normalizedBody && !(normalizedBody instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return {
    ...requestOptions,
    body: normalizedBody,
    cache: "no-store",
    credentials: "include",
    headers
  };
}

function authPath(scope: AuthScope, action: "login" | "refresh" | "logout") {
  if (scope === "patient") {
    return `/patient-auth/${action}`;
  }

  return `/auth/${action}`;
}

function normalizeBody(body?: ApiFetchOptions["body"]) {
  if (body == null) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  return JSON.stringify(body);
}

function parseJwtClaims(token: string): JwtClaims {
  const [, payload] = token.split(".");
  if (!payload) {
    throw new ApiClientError(401, "Access token is malformed", "unauthorized");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const claims = JSON.parse(new TextDecoder().decode(bytes)) as Partial<JwtClaims>;

  if (!claims.exp || !claims.name || !claims.role || !claims.sub) {
    throw new ApiClientError(401, "Access token is malformed", "unauthorized");
  }

  return claims as JwtClaims;
}
