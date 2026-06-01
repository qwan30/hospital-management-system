import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiRequest,
  getApiBaseUrl,
  persistSession,
  clearSessions,
  getStoredRole,
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

    const mockSuccessResponse = (body: unknown = {}) => {
      fetchMock().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(body)),
      } as Response);
    };

    const mockErrorResponse = (status: number, body: unknown) => {
      fetchMock().mockResolvedValueOnce({
        ok: false,
        status,
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

    it('4. throws ApiClientError on 4xx with error envelope', async () => {
      mockErrorResponse(400, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
        }
      });

      await expect(apiRequest('/bad-request')).rejects.toMatchObject({
        name: 'ApiClientError',
        message: 'Invalid input',
        status: 400,
        code: 'VALIDATION_ERROR'
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
  });
});
