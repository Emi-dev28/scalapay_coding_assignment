import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ConnectionError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import { ErrorMessages } from '../utils/validation-messages';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: ErrorMessages.VALIDATION_FAILED,
        errors: exception.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof UniqueConstraintError) {
      return response.status(HttpStatus.CONFLICT).json({
        message: ErrorMessages.RESOURCE_ALREADY_EXISTS,
        errors: exception.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof ConnectionError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: ErrorMessages.DATABASE_CONNECTION_FAILED,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : 'message' in exceptionResponse
            ? exceptionResponse.message
            : ErrorMessages.AN_ERROR_OCCURRED;

      return response.status(exception.getStatus()).json({
        error: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
