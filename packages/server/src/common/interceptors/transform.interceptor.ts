import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式
 * {
 *   code: number,    // 状态码，200表示成功
 *   data: any,       // 数据，没有数据时为 null
 *   msg: string      // 消息，成功时通常为空字符串
 * }
 */
export interface Response<T> {
  code: number;
  data: T;
  msg: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data: data ?? null, // 确保 null 被正确返回
        msg: '',
      })),
    );
  }
}
