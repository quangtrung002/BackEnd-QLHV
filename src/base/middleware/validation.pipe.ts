import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  async transform(value: { filter: any }, metadata: ArgumentMetadata) {
    if (value.filter === null || value.filter === undefined) {
      return super.transform(value, metadata);
    }
    if (metadata.type === 'query' && typeof value?.filter === 'string')
      try {
        value.filter = JSON.parse(value?.filter);
      } catch (e) {
        /* empty */
      }
    return super.transform(value, metadata);
  }
}

export const exceptionFactory = (errors) => {
  return new HttpException(
    {
      success: false,
      msg: Object.values(errors[0].constraints)[0],
    },
    HttpStatus.BAD_REQUEST,
  );
};
