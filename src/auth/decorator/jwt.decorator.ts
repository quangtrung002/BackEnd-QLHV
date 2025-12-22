import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const UserAuth = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export const IS_PUBLIC_KEY = 'skip-auth';
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true);
