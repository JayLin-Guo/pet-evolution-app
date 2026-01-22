import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 统一异常响应格式
 * 确保所有异常都返回统一的格式：{ code, data, msg }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        message =
          (Array.isArray(responseObj.message)
            ? responseObj.message[0]
            : responseObj.message) ||
          responseObj.error ||
          message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 统一返回格式
    response.status(status).json({
      code: status,
      data: null,
      msg: message,
    });
  }
}
