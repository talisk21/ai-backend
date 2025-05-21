import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { AgentGatewayService } from "../agents/agent-gateway.service";
import { MinioService } from "../files/minio.service";
import { ConvertedFile, FileConverterService } from "../files/file-converter.service";
import { ChatMessage } from "../agents/agent.interface";
import fetch from "node-fetch";
import * as crypto from "crypto";

const TelegramBot = require("node-telegram-bot-api");

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@Injectable()
export class TelegramService {
  private bot: typeof TelegramBot;
  private logger = new Logger("TelegramService");

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly agentGateway: AgentGatewayService,
    private readonly minio: MinioService,
    private readonly fileConverter: FileConverterService
  ) {
    const token = this.config.get<string>("TELEGRAM_TOKEN");
    if (!token) throw new Error("TELEGRAM_TOKEN not set");

    this.bot = new TelegramBot(token, { polling: true });
    this.bot.on("message", (msg) => this.onMessage(msg));
    this.logger.log("✅ Telegram бот запущен");
  }

  private async onMessage(msg: typeof TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const userId = `tg:${chatId}`;

    const execution = await this.getOrCreateExecution(userId);
    if (!execution) {
      await this.bot.sendMessage(chatId, "❌ Не удалось создать сессию");
      return;
    }

    if (msg.document) {
      await this.handleFileUpload(chatId, userId, execution.id, msg.document.file_id, msg.document.file_name,
        msg.document.mime_type || "application/octet-stream", msg.caption);
      return;
    }

    if (msg.photo && msg.photo.length > 0) {
      const bestPhoto = msg.photo[msg.photo.length - 1];
      const fileId = bestPhoto.file_id;
      const filename = `photo_${fileId}.jpg`;
      await this.handleFileUpload(chatId, userId, execution.id, fileId, filename, "image/jpeg", msg.caption);
      return;
    }

    if (!text) return;
    this.logger.log(`📩 Сообщение от ${userId}: ${text}`);

    const step = await this.prisma.step.create({
      data: {
        type: "agent",
        input: { question: text, model: "openai/gpt-4o" },
        source: "telegram",
        userId,
        execution: { connect: { id: execution.id } }
      }
    });

    try {
      const historySteps = await this.prisma.step.findMany({
        where: { executionId: execution.id },
        orderBy: { createdAt: "asc" }
      });

      const messages: ChatMessage[] = [];

      for (const s of historySteps) {
        const input = s.input as any;
        const output = s.output as any;

        if (s.type === "agent" && input?.question) {
          messages.push({ role: "user", content: input.question });
        }
        if (output?.result) {
          messages.push({ role: "assistant", content: output.result });
        }
      }

      messages.push({
        role: "user",
        content: text
      });

      await sleep(2000);

      await this.bot.sendChatAction(chatId, "typing");

      const result = await this.agentGateway.chat({
        model: "openai/gpt-4o",
        messages
      }, "llm-tool-decision-agent");

      const delay = Math.min(result.length * 25, 5000);
      await sleep(delay);

      await this.bot.sendMessage(chatId, result);

      await this.prisma.step.update({
        where: { id: step.id },
        data: { output: { result } }
      });
    } catch (error: any) {
      this.logger.error(`❌ Ошибка обработки текста: ${error.message}`);
      await this.bot.sendMessage(chatId, "⚠️ Ошибка при обработке текста");
      await this.prisma.step.update({
        where: { id: step.id },
        data: { error: error.message }
      });
    }
  }

  private async handleFileUpload(
    chatId: number,
    userId: string,
    executionId: string,
    fileId: string,
    filename: string,
    mimeType: string,
    caption?: string
  ) {
    const step = await this.prisma.step.create({
      data: {
        type: "upload",
        input: { fileId, filename, mimeType },
        source: "telegram",
        userId,
        execution: { connect: { id: executionId } }
      }
    });

    try {
      const fileLink = await this.bot.getFileLink(fileId);
      const res = await fetch(fileLink);
      const buffer = Buffer.from(await res.arrayBuffer());

      const originalFilename = await this.minio.uploadFileFromBuffer(buffer, filename);
      const originalUrl = this.minio.getPublicUrl(originalFilename);
      const fileIdDb = crypto.randomUUID();

      await this.prisma.file.create({
        data: {
          id: fileIdDb,
          name: filename,
          url: originalUrl,
          size: buffer.length,
          mimeType,
          stepId: step.id,
          executionId,
          isConverted: false
        }
      });

      const converted: ConvertedFile | null = await this.fileConverter.convert(buffer, filename);

      let finalFilename = filename;
      let finalMime = mimeType;
      let finalBase64 = buffer;
      let convertedUrl = originalUrl;

      if (converted) {
        const convertedFilename = await this.minio.uploadFileFromBuffer(converted.buffer, converted.name);
        convertedUrl = this.minio.getPublicUrl(convertedFilename);

        await this.prisma.file.create({
          data: {
            id: crypto.randomUUID(),
            name: converted.name,
            url: convertedUrl,
            size: converted.buffer.length,
            mimeType: converted.mimeType,
            stepId: step.id,
            executionId,
            isConverted: true
          }
        });

        finalFilename = converted.name;
        finalMime = converted.mimeType;
        finalBase64 = converted.buffer;
      }

      await this.bot.sendMessage(chatId, `📎 Файл получен и сохранён:\n${originalUrl}`);

      const result = await this.agentGateway.chat(
        {
          model: "openai/gpt-4o",
          messages: [
            {
              role: "user",
              content: caption || "Пожалуйста, проанализируй этот файл",
              file: {
                name: finalFilename,
                mimeType: finalMime,
                base64: finalBase64.toString("base64")
              }
            }
          ]
        },
        "llm-tool-decision-agent"
      );

      await this.bot.sendMessage(chatId, `🤖 Ответ агента:\n${result}`);

      await this.prisma.step.update({
        where: { id: step.id },
        data: { output: { result } }
      });
    } catch (error: any) {
      this.logger.error(`❌ Ошибка при загрузке файла: ${error.message}`);
      await this.bot.sendMessage(chatId, "❌ Не удалось загрузить файл");
    }
  }

  private async getOrCreateExecution(userId: string) {
    const recent = await this.prisma.execution.findFirst({
      where: { userId },
      orderBy: { startedAt: "desc" }
    });

    if (recent && !recent.finishedAt && this.isRecent(recent.startedAt)) return recent;

    if (recent && !recent.finishedAt) {
      await this.prisma.execution.update({
        where: { id: recent.id },
        data: { finishedAt: new Date(), status: "done" }
      });
    }

    return this.prisma.execution.create({
      data: {
        userId,
        status: "active"
      }
    });
  }

  private isRecent(date: Date): boolean {
    const delta = Date.now() - new Date(date).getTime();
    return delta < 5 * 60 * 1000;
  }
}