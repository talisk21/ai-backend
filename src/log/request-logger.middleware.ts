import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as Services from '@services';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  constructor(private readonly log: Services.LogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, headers } = req;
    const start = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - start;
      const status = res.statusCode;

      this.logger.log(
        `HTTP ${method} ${originalUrl} - ${status} (${duration}ms)`,
        'HttpRequest',
        {
          method,
          url: originalUrl,
          status,
          duration,
          body,
          query,
          headers: {
            'user-agent': headers['user-agent'],
            referer: headers.referer,
            host: headers.host,
          },
        },
      );
      void this.log.info(
        `HTTP ${method} ${originalUrl} - ${status} (${duration}ms)`,
        'HttpRequest',
        {
          method,
          url: originalUrl,
          status,
          duration,
          body,
          query,
          headers: {
            'user-agent': headers['user-agent'],
            referer: headers.referer,
            host: headers.host,
          },
        },
      );
    });

    next();
  }
}
