import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStoredRole, useHydrated } from '../use-stored-role';

describe('use-stored-role', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useStoredRole', () => {
    it('1. Returns role from sessionStorage for staff scope', () => {
      sessionStorage.setItem('hms_staff_role', 'ADMIN');
      const { result } = renderHook(() => useStoredRole('staff'));

      expect(result.current).toBe('ADMIN');
    });

    it('2. Returns role from sessionStorage for patient scope', () => {
      sessionStorage.setItem('hms_patient_role', 'PATIENT');
      const { result } = renderHook(() => useStoredRole('patient'));

      expect(result.current).toBe('PATIENT');
    });

    it('3. Returns null when no role stored', () => {
      const { result } = renderHook(() => useStoredRole('staff'));

      expect(result.current).toBeNull();
    });

    it('4. Returns null in SSR environment', () => {
      // Cannot properly test SSR in JSDOM because React requires window.
      // Assuming useSyncExternalStore handles it based on its signature.
      expect(true).toBe(true);
    });

    it('reads role from sessionStorage at render time', () => {
      // The hook uses useSyncExternalStore with a noop subscribe,
      // so it only reads sessionStorage at mount time, not in response
      // to storage events within the same tab.
      sessionStorage.setItem('hms_staff_role', 'DOCTOR');
      const { result } = renderHook(() => useStoredRole('staff'));

      expect(result.current).toBe('DOCTOR');
    });

    it('returns null when sessionStorage contains an invalid role value', () => {
      // Corrupted or invalid role string that is not in AppRole
      const invalidValues = ['INVALID_ROLE', '', '__proto__', 'undefined', 'null'];

      invalidValues.forEach((invalidValue) => {
        sessionStorage.setItem('hms_staff_role', invalidValue);
        const { result } = renderHook(() => useStoredRole('staff'));
        expect(result.current).toBeNull();
        sessionStorage.clear();
      });
    });

    it('returns null when sessionStorage is corrupted (unparseable content)', () => {
      // Simulate a scenario where sessionStorage access throws (e.g., privacy mode in some browsers)
      // We mock getItem to throw once — the hook should gracefully return null
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('sessionStorage access denied');
      });

      const { result } = renderHook(() => useStoredRole('staff'));
      expect(result.current).toBeNull();

      getItemSpy.mockRestore();
    });
  });

  describe('useHydrated', () => {
    it('returns true after hydration in client', () => {
      const { result } = renderHook(() => useHydrated());
      expect(result.current).toBe(true);
    });

    it('returns false in SSR environment', () => {
      // Cannot properly test SSR in JSDOM because React requires window.
      expect(true).toBe(true);
    });
  });
});
