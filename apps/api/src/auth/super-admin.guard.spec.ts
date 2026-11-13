import { describe, it, expect } from 'vitest';
import { SuperAdminGuard } from './super-admin.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';

function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('SuperAdminGuard', () => {
  const guard = new SuperAdminGuard();

  it('allows access when user is SUPER_ADMIN', () => {
    const context = createMockContext({ id: 'admin-1', role: 'SUPER_ADMIN' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks access with ForbiddenException when user is DEPT_OFFICER (Employee)', () => {
    const context = createMockContext({ id: 'officer-1', role: 'DEPT_OFFICER' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('blocks access with ForbiddenException when user is unauthenticated', () => {
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('blocks access with ForbiddenException when user role is unknown or empty', () => {
    const context = createMockContext({ id: 'user-1', role: 'CITIZEN' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
