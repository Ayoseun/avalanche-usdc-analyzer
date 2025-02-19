import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * A filter that catches any uncaught HttpExceptions and returns a JSON response with the error details.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * The logger instance.
   */
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Catch any uncaught HttpExceptions and return a JSON response with the error details.
   * @param exception The exception that was thrown.
   * @param host The ArgumentsHost instance.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /**
     * Log the exception with the logger.
     */
    this.logger.error(`HTTP Error: ${exception.message}`, exception.stack);

    /**
     * Return a JSON response with the error details.
     */
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}

