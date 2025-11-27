/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('before Route handler');
    return next.handle().pipe(
      map((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...otherData } = data;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...otherData };
      }),
    );
  }
}
