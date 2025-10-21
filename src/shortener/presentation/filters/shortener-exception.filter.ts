import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationException } from '../../application/exceptions/validation.exception';
import { ConflictException } from '../../application/exceptions/conflict.exception';
import { ErrorResponseDto } from '../../application/dtos/error-response.dto';

@Catch()
export class ShortenerExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let error: string;

    if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Bad Request';
    } else if (exception instanceof ConflictException) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
      error = 'Conflict';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as { message?: string }).message ||
            'Internal server error';
      error = exception.constructor.name;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    const errorResponse: ErrorResponseDto = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
