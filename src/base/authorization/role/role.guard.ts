import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { RoleGroup } from './role.enum';
import { BadRequestException, ForbiddenException } from 'src/base/exceptions/custom.exception';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (user.role === RoleGroup.SuperAdmin) {
      return true;
    }
    if (!RoleGuard.matchRoles(roles, user?.role)) {
      throw new ForbiddenException('Role not access');
    }

    return true;
  }

  private static matchRoles(roles: Array<any>, userRole: string) {
    return roles.some((role) => role === userRole);
  }
}
