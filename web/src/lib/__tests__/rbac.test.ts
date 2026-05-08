import { describe, it, expect } from 'vitest';
import { getRouteDecision, filterNavigationLinks, toAppRole, AppRole } from '../rbac';

describe('rbac', () => {
  describe('getRouteDecision', () => {
    it('1. public routes always allowed (home, departments, doctors, news)', () => {
      const publicRoutes = ['/', '/departments', '/doctors', '/news'];
      publicRoutes.forEach(route => {
        expect(getRouteDecision(route, null)).toEqual({ allowed: true });
        expect(getRouteDecision(route, 'PATIENT')).toEqual({ allowed: true });
      });
    });

    it('2. /staff/login and /portal/login bypass auth', () => {
      expect(getRouteDecision('/staff/login', null)).toEqual({ allowed: true });
      expect(getRouteDecision('/portal/login', null)).toEqual({ allowed: true });
    });

    it('3. /portal/claim bypasses auth', () => {
      expect(getRouteDecision('/portal/claim', null)).toEqual({ allowed: true });
    });

    it('4. DOCTOR can access /staff/medical-records/*', () => {
      expect(getRouteDecision('/staff/medical-records', 'DOCTOR')).toEqual({ allowed: true });
      expect(getRouteDecision('/staff/medical-records/123/edit', 'DOCTOR')).toEqual({ allowed: true });
    });

    it('5. NURSE cannot access /staff/medical-records/*', () => {
      expect(getRouteDecision('/staff/medical-records/123', 'NURSE')).toEqual({
        allowed: false,
        reason: 'forbidden',
        redirectTo: '/forbidden',
      });
    });

    it('6. PHARMACIST can access /staff/inventory', () => {
      expect(getRouteDecision('/staff/inventory', 'PHARMACIST')).toEqual({ allowed: true });
    });

    it('7. RECEPTIONIST cannot access /staff/inventory', () => {
      expect(getRouteDecision('/staff/inventory', 'RECEPTIONIST')).toEqual({
        allowed: false,
        reason: 'forbidden',
        redirectTo: '/forbidden',
      });
    });

    it('8. ACCOUNTANT can access /admin/audit-logs', () => {
      expect(getRouteDecision('/admin/audit-logs', 'ACCOUNTANT')).toEqual({ allowed: true });
    });

    it('9. ACCOUNTANT cannot access /admin/users', () => {
      // /admin/users is under the /admin prefix, which is ADMIN only
      expect(getRouteDecision('/admin/users', 'ACCOUNTANT')).toEqual({
        allowed: false,
        reason: 'forbidden',
        redirectTo: '/forbidden',
      });
    });

    it('10. DOCTOR can access /staff/schedule', () => {
      expect(getRouteDecision('/staff/schedule', 'DOCTOR')).toEqual({ allowed: true });
    });

    it('11. all staff roles can access /staff/dashboard', () => {
      const staffRoles: AppRole[] = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ACCOUNTANT'];
      staffRoles.forEach(role => {
        expect(getRouteDecision('/staff/dashboard', role)).toEqual({ allowed: true });
      });
    });

    it('12. all staff roles can access /staff/support', () => {
      const staffRoles: AppRole[] = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ACCOUNTANT'];
      staffRoles.forEach(role => {
        expect(getRouteDecision('/staff/support', role)).toEqual({ allowed: true });
      });
    });

    it('13. PATIENT cannot access any /staff/* route', () => {
      const staffRoutes = ['/staff/dashboard', '/staff/inventory', '/staff/queue'];
      staffRoutes.forEach(route => {
        expect(getRouteDecision(route, 'PATIENT')).toEqual({
          allowed: false,
          reason: 'forbidden',
          redirectTo: '/forbidden',
        });
      });
    });

    it('14. trailing slash normalization', () => {
      expect(getRouteDecision('/staff/dashboard/', 'NURSE')).toEqual({ allowed: true });
      expect(getRouteDecision('/staff/medical-records/', 'NURSE')).toEqual({
        allowed: false,
        reason: 'forbidden',
        redirectTo: '/forbidden',
      });
    });
  });

  describe('toAppRole', () => {
    it('15. maps valid string to AppRole', () => {
      expect(toAppRole('ADMIN')).toBe('ADMIN');
      expect(toAppRole('DOCTOR')).toBe('DOCTOR');
      expect(toAppRole('PATIENT')).toBe('PATIENT');
    });

    it('16. returns null for invalid string', () => {
      expect(toAppRole('INVALID_ROLE')).toBeNull();
      expect(toAppRole('admin')).toBeNull(); // case sensitive
    });

    it('17. returns null for null/undefined', () => {
      expect(toAppRole(null)).toBeNull();
      expect(toAppRole(undefined)).toBeNull();
      expect(toAppRole('')).toBeNull();
    });
  });

  describe('filterNavigationLinks', () => {
    it('18. returns empty for null role or filters properly', () => {
      const links = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/staff/dashboard' },
        { label: 'Inventory', href: '/staff/inventory' },
      ];
      
      const filteredForNull = filterNavigationLinks(links, null);
      // for null role, /staff/dashboard and /staff/inventory should return { allowed: false, reason: "unauthenticated" }
      expect(filteredForNull).toEqual([{ label: 'Home', href: '/' }]);

      const filteredForNurse = filterNavigationLinks(links, 'NURSE');
      // NURSE can access dashboard, but not inventory
      expect(filteredForNurse).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/staff/dashboard' }
      ]);
    });
  });
});
