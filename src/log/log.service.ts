import { Injectable } from '@nestjs/common';
import * as Services from '@services';

@Injectable()
export class LogService {
  constructor(private prisma: Services.PrismaService) {}

  async log(level: string, message: string, context?: string, metadata?: any) {
    return this.prisma.log.create({
      data: {
        level,
        message,
        context,
        metadata,
      },
    });
  }

  async info(message: string, context?: string, metadata?: any) {
    return this.log('info', message, context, metadata);
  }

  async warn(message: string, context?: string, metadata?: any) {
    return this.log('info', message, context, metadata);
  }

  async error(message: string, context?: string, metadata?: any) {
    return this.log('error', message, context, metadata);
  }

  async debug(message: string, context?: string, metadata?: any) {
    return this.log('debug', message, context, metadata);
  }

  /**
   * Специальный логгер для HTTP-запросов
   */
  async logRequest(data: {
    method: string;
    url: string;
    status: number;
    duration: number;
    body?: any;
    query?: any;
    headers?: any;
  }) {
    return this.info(
      `HTTP ${data.method} ${data.url} - ${data.status} (${data.duration}ms)`,
      'HttpRequest',
      {
        status: data.status,
        duration: data.duration,
        body: data.body,
        query: data.query,
        headers: {
          'user-agent': data.headers?.['user-agent'],
          'x-forwarded-for': data.headers?.['x-forwarded-for'],
          host: data.headers?.host,
        },
      },
    );
  }
}
