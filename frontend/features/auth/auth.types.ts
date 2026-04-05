export type StaffRole = "DOCTOR" | "NURSE" | "ACCOUNTANT" | "ADMIN";
export type PrincipalRole = StaffRole | "PATIENT";
export type AuthScope = "staff" | "patient";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export type AuthSession = {
  readonly accessToken: string;
  readonly expiresAt: number;
  readonly fullName: string;
  readonly role: PrincipalRole;
  readonly scope: AuthScope;
  readonly userId: string;
};

export type TokenPairPayload = {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresInSeconds: number;
};

export type LoginResponsePayload = {
  readonly userId: string;
  readonly fullName: string;
  readonly role: PrincipalRole;
  readonly tokens: TokenPairPayload;
};

export type PatientClaimPayload = {
  readonly fullName: string;
  readonly email: string;
  readonly cccd: string;
  readonly dateOfBirth: string;
  readonly password: string;
};
