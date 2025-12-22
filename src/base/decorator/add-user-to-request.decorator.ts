/* eslint-disable no-param-reassign */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';
import { Request } from 'express';

export interface IAddParamsToBodyArgs {
  paramSource?: string;
  paramDest?: string;
  injectDataTo?: string;
}

function modifyRequest(req: Request, args: IAddParamsToBodyArgs) {
  const user = req.user;
  const { paramSource, paramDest, injectDataTo = 'body' } = args;

  const setValue = !paramSource ? user : _.get(user, paramSource, null);
  const setKey = paramDest
    ? paramDest
    : paramSource
      ? paramSource
      : 'user';
  _.set(req[injectDataTo], setKey, setValue);
  return req[injectDataTo];
}

export const AddUserToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return modifyRequest(req, args);
});

export const AddUserToParam = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.injectDataTo = 'params';
  return modifyRequest(req, args);
});

export const AddUserIdToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args = Object.assign({}, args, {
    paramSource: 'id',
    paramDest: 'user_id',
  });
  return modifyRequest(req, args);
});

export const AddCreatedByIdToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args = Object.assign({}, args, {
    paramSource: 'id',
    paramDest: 'createdById',
  });
  return modifyRequest(req, args);
});

export const AddUpdatedByIdToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args = Object.assign({}, args, {
    paramSource: 'id',
    paramDest: 'updatedById',
  });
  return modifyRequest(req, args);
});

export const AddUserIdToQuery = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args = Object.assign({}, args, {
    paramSource: 'id',
    paramDest: 'user_id',
    injectDataTo: 'query',
  });
  return modifyRequest(req, args);
});

export const AddUserIdToQueryFilter = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args = Object.assign({}, args, {
    paramSource: 'id',
    paramDest: 'filter.user_id',
    injectDataTo: 'query',
  });

  if (typeof req.query.filter === 'string')
    try { req.query.filter = JSON.parse(req.query.filter); } catch (e) { return req.query; }

  return modifyRequest(req, args);
});

export const AddMultiUserToBody = createParamDecorator((multiArgs: IAddParamsToBodyArgs[], ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  
  multiArgs.map(args => {
    req.body = modifyRequest(req, args);
  });
  
  return req.body;
});
