import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from '@services';
import * as mime from 'mime-types';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService {
  private readonly minio: Client;
  private readonly context = MinioService.name;
  private readonly logger = new Logger(this.context);
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly log: Services.LogService,
  ) {
    this.minio = new Client({
      endPoint: this.config.get<string>('MINIO_HOST'),
      port: parseInt(this.config.get<string>('MINIO_PORT'), 10),
      useSSL: false,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY'),
    });

    this.bucket = this.config.get<string>('MINIO_BUCKET');
    this.ensureBucket().catch((err) => {
      const errMsg = `❌ Ошибка при проверке/создании бакета "${this.bucket}": ${err.message}`;
      this.logger.error(errMsg, err.stack, this.context);
      void this.log.error(errMsg, this.context, { bucket: this.bucket });
    });
  }

  private async ensureBucket() {
    const exists = await this.minio
      .bucketExists(this.bucket)
      .catch(() => false);

    if (!exists) {
      await this.minio.makeBucket(this.bucket);
      const msg = `✅ Создан бакет "${this.bucket}"`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { bucket: this.bucket });
    }
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
    pathPrefix = '',
  ): Promise<string> {
    const filename = `${uuidv4()}_${originalName}`;
    const key = pathPrefix ? `${pathPrefix}/${filename}` : filename;
    const resolvedMime =
      mimeType || mime.lookup(originalName) || 'application/octet-stream';

    try {
      await this.minio.putObject(this.bucket, key, buffer, buffer.length, {
        'Content-Type': resolvedMime,
      });
      const msg = `✅ Загружен файл из буфера: ${originalName} → key=${key}`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { originalName, key });
      return key;
    } catch (error: any) {
      const errMsg = `❌ Ошибка при загрузке файла "${originalName}": ${error.message}`;
      this.logger.error(errMsg, error.stack, this.context);
      void this.log.error(errMsg, this.context, { originalName, key });
      throw error;
    }
  }

  async uploadFile(
    localPath: string,
    filename: string,
    pathPrefix = '',
  ): Promise<string> {
    const key = pathPrefix ? `${pathPrefix}/${filename}` : filename;

    try {
      await this.minio.fPutObject(this.bucket, key, localPath);
      const msg = `✅ Загружен локальный файл: ${localPath} → key=${key}`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { localPath, key });
      return key;
    } catch (error: any) {
      const errMsg = `❌ Ошибка при загрузке локального файла "${localPath}": ${error.message}`;
      this.logger.error(errMsg, error.stack, this.context);
      void this.log.error(errMsg, this.context, { localPath, key });
      throw error;
    }
  }

  async getFileStream(key: string) {
    try {
      const stream = await this.minio.getObject(this.bucket, key);
      const msg = `📤 Получен стрим файла key=${key}`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { key });
      return stream;
    } catch (error: any) {
      const errMsg = `❌ Ошибка при получении стрима файла key=${key}: ${error.message}`;
      this.logger.error(errMsg, error.stack, this.context);
      void this.log.error(errMsg, this.context, { key });
      throw error;
    }
  }

  async deleteFile(key: string) {
    try {
      await this.minio.removeObject(this.bucket, key);
      const msg = `🗑 Файл удалён key=${key}`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { key });
    } catch (error: any) {
      const errMsg = `❌ Ошибка при удалении файла key=${key}: ${error.message}`;
      this.logger.error(errMsg, error.stack, this.context);
      void this.log.error(errMsg, this.context, { key });
      throw error;
    }
  }

  getPublicUrl(key: string): string {
    const host = this.config.get<string>('MINIO_HOST');
    const port = this.config.get<string>('MINIO_PORT');
    const url = `${host}:${port}/${this.bucket}/${key}`;
    const msg = `🔗 Public URL для key=${key}: ${url}`;
    this.logger.log(msg, this.context);
    void this.log.info(msg, this.context, { key, url });
    return url;
  }
}
