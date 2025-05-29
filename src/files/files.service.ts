import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from '@services';
import * as crypto from 'crypto';
import { Client } from 'minio';

@Injectable()
export class FilesService {
  private minio: Client;
  private bucket: string;

  constructor(
    private readonly prisma: Services.PrismaService,
    private readonly config: ConfigService,
  ) {
    this.minio = new Client({
      endPoint: this.config.get<string>('MINIO_HOST'),
      port: parseInt(this.config.get<string>('MINIO_PORT'), 10),
      useSSL: false,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });

    this.bucket = this.config.get<string>('MINIO_BUCKET');
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async upload(
    buffer: Buffer,
    name: string,
    mimeType: string,
    meta: { executionId?: string; stepId?: string },
  ) {
    const id = crypto.randomUUID();
    const filename = `${id}_${name}`;

    await this.minio.putObject(this.bucket, filename, buffer);

    const host = this.config.get<string>('MINIO_HOST');
    const port = this.config.get<string>('MINIO_PORT');
    const url = `${host}:${port}/${this.bucket}/${filename}`;

    return this.prisma.file.create({
      data: {
        id,
        name,
        url,
        size: buffer.length,
        mimeType,
        executionId: meta.executionId,
        stepId: meta.stepId,
      },
    });
  }

  async getUrl(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    return file?.url;
  }
}
