import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Payload, defaultPayload } from '../swagger/pagination.schema';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponesTransformInterceptor<T>
  implements NestInterceptor<T, Payload<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Payload<T>> {
    return next
      .handle()
      .pipe(
        map((data) =>
          data?.data
            ? { ...defaultPayload, data: data.data }
            : { ...defaultPayload, data: data ?? [] },
        ),
      );
  }
}
