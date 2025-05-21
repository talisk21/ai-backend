import { Injectable } from "@nestjs/common";
import { Client } from "minio";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config"; // 🔹 импортируем
import * as crypto from "crypto";

@Injectable()
export class FilesService {
  private minio: Client;
  private bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService // ✅ добавили
  ) {
    this.minio = new Client({
      endPoint: this.config.get<string>("MINIO_HOST") ?? "localhost",
      port: parseInt(this.config.get<string>("MINIO_PORT") ?? "9000", 10),
      useSSL: false,
      accessKey: this.config.get<string>("MINIO_ACCESS_KEY") ?? "minioadmin",
      secretKey: this.config.get<string>("MINIO_SECRET_KEY") ?? "minioadmin"
    });

    this.bucket = this.config.get<string>("MINIO_BUCKET") ?? "files";
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket, "us-east-1");
    }
  }

  async upload(
    buffer: Buffer,
    name: string,
    mimeType: string,
    meta: { executionId?: string; stepId?: string }
  ) {
    const id = crypto.randomUUID();
    const filename = `${id}_${name}`;

    await this.minio.putObject(this.bucket, filename, buffer);

    const endpoint = this.config.get<string>("MINIO_ENDPOINT"); // например: http://localhost:9000
    const url = `${endpoint}/${this.bucket}/${filename}`;

    return this.prisma.file.create({
      data: {
        id,
        name,
        url,
        size: buffer.length,
        mimeType,
        executionId: meta.executionId,
        stepId: meta.stepId
      }
    });
  }

  async getUrl(id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    return file?.url;
  }
}