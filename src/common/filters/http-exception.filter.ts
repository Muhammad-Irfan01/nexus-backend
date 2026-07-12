import {
 ExceptionFilter,
 Catch,
 ArgumentsHost,
 HttpException,
 HttpStatus,
 Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter
 implements ExceptionFilter
{
 private readonly logger = new Logger(HttpExceptionFilter.name);

 catch(
  exception: unknown,
  host: ArgumentsHost,
 ) {
  const ctx = host.switchToHttp();

  const response = ctx.getResponse();

  const status =
   exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;

  const message =
   exception instanceof HttpException
    ? exception.getResponse()
    : 'Internal Server Error';

  // Without this, every uncaught error in the app is silently swallowed —
  // the client gets a generic 500 and nothing shows up anywhere in the logs.
  if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
   this.logger.error(
    exception instanceof Error ? exception.stack : exception,
   );
  }

  response.status(status).json({
   success: false,
   statusCode: status,
   message,
  });
 }
}