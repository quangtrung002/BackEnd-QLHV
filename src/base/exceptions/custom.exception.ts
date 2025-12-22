import { HttpException } from '@nestjs/common';
import { HttpStatusCode } from 'axios';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not found') {
    super({ success: false, message }, HttpStatusCode.NotFound);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super({ success: false, message }, HttpStatusCode.BadRequest);
  }
}

export class SuccessException extends HttpException {
  constructor(message: string = 'Successfully') {
    super({ success: true, message }, HttpStatusCode.Ok);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super({ success: false, message }, HttpStatusCode.Conflict);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super({ success: false, message }, HttpStatusCode.Forbidden);
  }
}

export class Unauthorized extends HttpException {
  constructor(message: string = 'Authorized') {
    super({ success: false, message }, HttpStatusCode.Unauthorized);
  }
}

export class MethodNotAllowed extends HttpException {
  constructor(message: string = 'Method Not Allowed') {
    super({ success: false, message }, HttpStatusCode.MethodNotAllowed);
  }
}

export class NotAcceptable extends HttpException {
  constructor(message: string = 'Not Acceptable') {
    super({ success: false, message }, HttpStatusCode.NotAcceptable);
  }
}

export class TooManyRequests extends HttpException {
  constructor(message: string = 'Too Many Requests') {
    super({ success: false, message }, HttpStatusCode.TooManyRequests);
  }
}
