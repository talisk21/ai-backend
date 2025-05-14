import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from './log.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly log: LogService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, headers } = req;
    const start = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - start;
      const status = res.statusCode;

      await this.log.info(
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