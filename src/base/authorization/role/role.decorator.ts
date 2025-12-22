import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Role } from './role.enum';
import { ApiForbiddenResponse } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[] | Role[][]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles.flat()),
    ApiForbiddenResponse({
      description:
        'Access role: ' +
        (roles.length ? roles.flat().toString() : 'Block all'),
    }),
  );
