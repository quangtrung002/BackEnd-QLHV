import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { status, json } = AllExceptionFilter.prepareException(exception);
    let msg: string = '';
    let success: boolean = false;
    if (json['message']) {
      msg =
        typeof json['message'] === 'object'
          ? json['message'][0].toUpperCase()
          : json['message'].toUpperCase();
    }
    if (json['success']) {
      success = json['success'];
    }

    response.status(status).send({
      success,
      msg,
      data: [],
    });
  }

  static prepareException(exc: any): { status: number; json: object } {
    const error =
      exc instanceof HttpException
        ? exc
        : new InternalServerErrorException(exc.message);
    const status = error.getStatus();
    const response = error.getResponse();
    const json = typeof response === 'string' ? { error: response } : response;

    return { status, json };
  }
}
