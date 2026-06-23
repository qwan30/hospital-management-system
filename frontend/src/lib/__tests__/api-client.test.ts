import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiRequest,
  getApiBaseUrl,
  persistSession,
  clearSessions,
  getStoredRole,
  type ApiRequestMetric,
} from '../api-client';

describe('api-client', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    global.fetch = vi.fn<typeof fetch>();
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    vi.restoreAllMocks();
  });

  describe('getApiBaseUrl', () => {
    it('7. returns env variable when set', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'http://custom-url/api/v1';
      expect(getApiBaseUrl()).toBe('http://custom-url/api/v1');
    });

    it('8. falls back to localhost:8081', () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      expect(getApiBaseUrl()).toBe('http://localhost:8081/api/v1');
    });
  });

  describe('persistSession', () => {
    it('9. stores token, expiry, and role in sessionStorage', () => {
      persistSession('staff', { accessToken: 'token123', expiresInSeconds: 3600 }, 'DOCTOR');

      expect(sessionStorage.getItem('hms_staff_access_token')).toBe('token123');
      expect(sessionStorage.getItem('hms_staff_access_token_expires_in')).toBe('3600');
      expect(sessionStorage.getItem('hms_staff_role')).toBe('DOCTOR');
    });

    it('10. is no-op when accessToken is missing', () => {
      persistSession('staff', { accessToken: '', expiresInSeconds: 3600 }, 'DOCTOR');

      expect(sessionStorage.getItem('hms_staff_access_token')).toBeNull();
      expect(sessionStorage.getItem('hms_staff_role')).toBeNull();
    });
  });

  describe('clearSessions', () => {
    it('11. removes all 6 session keys', () => {
      sessionStorage.setItem('hms_staff_access_token', 'token');
      sessionStorage.setItem('hms_staff_access_token_expires_in', '3600');
      sessionStorage.setItem('hms_staff_role', 'DOCTOR');
      sessionStorage.setItem('hms_patient_access_token', 'token');
      sessionStorage.setItem('hms_patient_access_token_expires_in', '3600');
      sessionStorage.setItem('hms_patient_role', 'PATIENT');

      clearSessions();

      expect(sessionStorage.getItem('hms_staff_access_token')).toBeNull();
      expect(sessionStorage.getItem('hms_staff_access_token_expires_in')).toBeNull();
      expect(sessionStorage.getItem('hms_staff_role')).toBeNull();
      expect(sessionStorage.getItem('hms_patient_access_token')).toBeNull();
      expect(sessionStorage.getItem('hms_patient_access_token_expires_in')).toBeNull();
      expect(sessionStorage.getItem('hms_patient_role')).toBeNull();
    });
  });

  describe('getStoredRole', () => {
    it('12. returns stored role from session', () => {
      sessionStorage.setItem('hms_staff_role', 'ADMIN');
      expect(getStoredRole('staff')).toBe('ADMIN');
    });

    it('returns null if no role is stored', () => {
      expect(getStoredRole('patient')).toBeNull();
    });

    // We can't perfectly test SSR environment because vitest jsdom defines window,
    // but the logic relies on `typeof window === "undefined"`. We assume it works
    // based on reading the code. We'll skip strict SSR testing here.
  });

  describe('apiRequest', () => {
    const fetchMock = () => vi.mocked(global.fetch);

    const mockSuccessResponse = (body: unknown = {}, requestId?: string) => {
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(requestId ? { 'X-Request-Id': requestId } : {}),
        text: () => Promise.resolve(JSON.stringify(body)),
      } as Response);
    };

    const mockErrorResponse = (status: number, body: unknown, requestId?: string) => {
      fetchMock().mockResolvedValueOnce({
        ok: false,
        status,
        headers: new Headers(requestId ? { 'X-Request-Id': requestId } : {}),
        text: () => Promise.resolve(JSON.stringify(body)),
      } as Response);
    };

    it('1. GET request builds correct URL', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL; // Force default
      mockSuccessResponse({ data: 'ok' });

      await apiRequest('/test-path');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8081/api/v1/test-path', expect.objectContaining({
        credentials: 'include',
      }));
    });

    it('2. POST sends JSON body + Content-Type header', async () => {
      mockSuccessResponse({ success: true });

      const body = JSON.stringify({ name: 'test' });
      await apiRequest('/submit', {
        method: 'POST',
        body,
      });

      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        method: 'POST',
        body,
      }));

      const calledInit = fetchMock().mock.calls[0][1] as RequestInit;
      const headers = calledInit.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('3. attaches patient bearer token for authScope: "patient"', async () => {
      sessionStorage.setItem('hms_patient_access_token', 'pat-token-123');
      mockSuccessResponse();

      await apiRequest('/secure', {}, { authScope: 'patient' });

      const calledInit = fetchMock().mock.calls[0][1] as RequestInit;
      const headers = calledInit.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer pat-token-123');
    });

    it('sends X-Request-Id and records sanitized request timing metadata', async () => {
      const metrics: ApiRequestMetric[] = [];
      const handler = (event: Event) => {
        metrics.push((event as CustomEvent<ApiRequestMetric>).detail);
      };
      window.addEventListener('hms:api-request', handler);
      mockSuccessResponse({ data: 'ok' }, 'backend-request-001');

      await apiRequest(
        '/patients/550e8400-e29b-41d4-a716-446655440000?accessToken=secret',
        {},
        { requestId: 'frontend-request-001' },
      );

      const calledInit = fetchMock().mock.calls[0][1] as RequestInit;
      const headers = calledInit.headers as Headers;
      expect(headers.get('X-Request-Id')).toBe('frontend-request-001');
      expect(metrics).toMatchObject([
        {
          path: '/patients/{id}',
          method: 'GET',
          status: 200,
          ok: true,
          requestId: 'backend-request-001',
        },
      ]);
      expect(metrics[0].durationMs).toBeGreaterThanOrEqual(0);
      window.removeEventListener('hms:api-request', handler);
    });

    it('4. throws ApiClientError on 4xx with error envelope', async () => {
      mockErrorResponse(400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
        }
      }, 'backend-error-001');

      await expect(apiRequest('/bad-request')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Invalid input',
        status: 400,
        code: 'VALIDATION_ERROR',
        requestId: 'backend-error-001',
      });
    });

    it('5. throws ApiClientError on 5xx with fallback message', async () => {
      mockErrorResponse(500, {}); // Empty body

      await expect(apiRequest('/server-error')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Request failed',
        status: 500,
        code: undefined
      });
    });

    it('throws a friendly ApiClientError when the server cannot be reached', async () => {
      fetchMock().mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiRequest('/offline')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Unable to reach the hospital server. Check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR',
        requestId: expect.any(String),
        durationMs: expect.any(Number),
      });
    });

    it('6. handles empty response body gracefully', async () => {
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      } as Response);

      const response = await apiRequest('/empty');
      expect(response).toEqual({});
    });

    it('handles 429 rate limit response', async () => {
      mockErrorResponse(429, {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before retrying.',
        },
      });

      await expect(apiRequest('/rate-limited')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Too many requests. Please wait before retrying.',
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        requestId: expect.any(String),
        durationMs: expect.any(Number),
      });
    });

    it('handles response with unexpected content type (non-JSON body)', async () => {
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/html' }),
        text: () => Promise.resolve('<html><body>Server error</body></html>'),
      } as Response);

      // The api-client reads text() then JSON.parse() - this should throw a JSON parse error
      await expect(apiRequest('/bad-content-type')).rejects.toThrow();
    });

    it('handles 503 service unavailable gracefully', async () => {
      mockErrorResponse(503, {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable. Please try again later.',
        },
      });

      await expect(apiRequest('/unavailable')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Service temporarily unavailable. Please try again later.',
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        requestId: expect.any(String),
        durationMs: expect.any(Number),
      });
    });

    it('propagates non-Error rejection from fetch correctly', async () => {
      fetchMock().mockRejectedValueOnce('string rejection');

      await expect(apiRequest('/fail')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Unable to reach the hospital server. Check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR',
        requestId: expect.any(String),
        durationMs: expect.any(Number),
      });
    });

    it('handles very large response body without crashing', async () => {
      const largeData = { data: 'x'.repeat(100000) };
      mockSuccessResponse(largeData);

      const response = await apiRequest('/large-response');
      expect(response.data).toBe(largeData.data);
    });

    it('attempts to refresh token and retries request on 401 response', async () => {
      // 1st request fails with 401
      fetchMock().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({}),
        text: () => Promise.resolve(JSON.stringify({ error: { message: 'Access token has expired' } })),
      } as Response);

      // 2nd request (token refresh) succeeds
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        text: () => Promise.resolve(JSON.stringify({ data: { accessToken: 'new-token-999', expiresInSeconds: 900 } })),
      } as Response);

      // 3rd request (retried original) succeeds
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({}),
        text: () => Promise.resolve(JSON.stringify({ data: 'retry-success' })),
      } as Response);

      const result = await apiRequest('/needs-auth', {}, { authScope: 'staff' });

      // Verify final result
      expect(result.data).toBe('retry-success');

      // Verify refresh token storage
      expect(sessionStorage.getItem('hms_staff_access_token')).toBe('new-token-999');

      // Verify fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Call 1: Original request
      expect(fetchMock().mock.calls[0][0]).toContain('/needs-auth');
      
      // Call 2: Token refresh request
      expect(fetchMock().mock.calls[1][0]).toContain('/auth/refresh');
      
      // Call 3: Retried original request
      expect(fetchMock().mock.calls[2][0]).toContain('/needs-auth');
      const retryInit = fetchMock().mock.calls[2][1] as RequestInit;
      const headers = retryInit.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer new-token-999');
    });

    it('clears session storage and redirects to login when token refresh fails on 401 response', async () => {
      // 1st request fails with 401
      fetchMock().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({}),
        text: () => Promise.resolve(JSON.stringify({ error: { message: 'Access token has expired' } })),
      } as Response);

      // 2nd request (token refresh) fails with 401
      fetchMock().mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({}),
        text: () => Promise.resolve(JSON.stringify({ error: { message: 'Refresh token has expired' } })),
      } as Response);

      const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        href: '/staff/queue',
      } as Location);
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, href: '' },
      });

      sessionStorage.setItem('hms_staff_access_token', 'token123');
      sessionStorage.setItem('hms_staff_role', 'DOCTOR');

      await expect(apiRequest('/needs-auth', {}, { authScope: 'staff' })).rejects.toThrow();

      expect(sessionStorage.getItem('hms_staff_access_token')).toBeNull();
      expect(sessionStorage.getItem('hms_staff_role')).toBeNull();
      expect(window.location.href).toContain('/staff/login');

      locationSpy.mockRestore();
    });
  });
});
