import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { ConflictException } from '../../application/common/exceptions/conflict.exception';
import { NotFoundException } from '../../application/common/exceptions/not-found.exception';
import { UnauthorizedAccessException } from '../../application/common/exceptions/unauthorized-access.exception';
import { ValidationException } from '../../application/common/exceptions/validation.exception';

interface ErrorResponse {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

@Catch()
export class ExceptionHandlingFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionHandlingFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse = this.handleException(exception);
    response.status(errorResponse.status).json(errorResponse);
  }

  private handleException(exception: unknown): ErrorResponse {
    if (exception instanceof ValidationException) {
      return { status: HttpStatus.BAD_REQUEST, title: 'Validation Failed', errors: exception.errors };
    }
    if (exception instanceof NotFoundException) {
      return { status: HttpStatus.NOT_FOUND, title: 'Resource Not Found', detail: exception.message };
    }
    if (exception instanceof ConflictException) {
      return { status: HttpStatus.CONFLICT, title: 'Conflict', detail: exception.message };
    }
    if (exception instanceof UnauthorizedAccessException) {
      return { status: HttpStatus.UNAUTHORIZED, title: 'Unauthorized', detail: exception.message };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
      return {
        status,
        title: STATUS_CODES[status] ?? 'Error',
        detail: Array.isArray(message) ? message.join(' ') : (message ?? exception.message),
      };
    }

    this.logger.error('An unhandled exception occurred during request execution.', (exception as Error)?.stack);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      title: 'Internal Server Error',
      detail: 'An unexpected error occurred. Please try again later.',
    };
  }
}
