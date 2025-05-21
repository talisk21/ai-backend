import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { v4 as uuidv4 } from "uuid";
import * as mime from "mime-types";

@Injectable()
export class MinioService {
  private readonly minio: Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.minio = new Client({
      endPoint: this.config.get<string>("MINIO_HOST") || "localhost",
      port: parseInt(this.config.get<string>("MINIO_PORT") || "9000", 10),
      useSSL: false,
      accessKey: this.config.get<string>("MINIO_ACCESS_KEY") || "minioadmin",
      secretKey: this.config.get<string>("MINIO_SECRET_KEY") || "minioadmin"
    });

    this.bucket = this.config.get<string>("MINIO_BUCKET") || "executions";
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.minio.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
      this.logger.log(`✅ Создан бакет "${this.bucket}"`);
    }
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
    pathPrefix = ""
  ): Promise<string> {
    const filename = `${uuidv4()}_${originalName}`;
    const key = pathPrefix ? `${pathPrefix}/${filename}` : filename;

    const resolvedMime = mimeType || mime.lookup(originalName) || "application/octet-stream";

    try {
      await this.minio.putObject(
        this.bucket,
        key,
        buffer,
        buffer.length, // важно: это аргумент size
        { "Content-Type": resolvedMime } // мета-данные
      );
      return key;
    } catch (error) {
      this.logger.error(`Ошибка при загрузке файла "${originalName}": ${error.message}`);
      throw error;
    }
  }

  async uploadFile(localPath: string, filename: string, pathPrefix = ""): Promise<string> {
    const key = pathPrefix ? `${pathPrefix}/${filename}` : filename;

    try {
      await this.minio.fPutObject(this.bucket, key, localPath);
      return key;
    } catch (error) {
      this.logger.error(`Ошибка при загрузке файла с пути "${localPath}": ${error.message}`);
      throw error;
    }
  }

  async getFileStream(key: string) {
    return this.minio.getObject(this.bucket, key);
  }

  async deleteFile(key: string) {
    return this.minio.removeObject(this.bucket, key);
  }

  getPublicUrl(key: string): string {
    const endpoint = this.config.get<string>("MINIO_ENDPOINT") || "http://localhost:9000";
    return `${endpoint}/${this.bucket}/${key}`;
  }
}