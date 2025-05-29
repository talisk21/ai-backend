import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from '@services';
import * as Utils from '@utils';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import { ChatMessage } from '../agents/agent.interface';

const TelegramBot = require('node-telegram-bot-api');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class TelegramService {
  private readonly context = TelegramService.name;
  private readonly logger = new Logger(this.context);
  private bot: InstanceType<typeof TelegramBot>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: Services.PrismaService,
    private readonly agentGateway: Services.AgentGatewayService,
    private readonly minio: Services.MinioService,
    private readonly log: Services.LogService,
  ) {
    const token = this.config.get<string>('TELEGRAM_TOKEN');
    if (!token) throw new Error('❌ TELEGRAM_TOKEN not set');

    this.bot = new TelegramBot(token, { polling: true });
    this.bot.on('message', (msg) => this.onMessage(msg));

    const startMsg = '✅ Telegram бот запущен';
    this.logger.log(startMsg, this.context);
    void this.log.info(startMsg, this.context);
  }

  private async onMessage(msg: typeof TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const userId = `tg:${chatId}`;

    // 1️⃣ Получаем или создаём Execution
    const execMsg = `Ищем/создаём execution для пользователя ${userId}`;
    this.logger.log(execMsg, this.context);
    void this.log.info(execMsg, this.context, { userId });

    const execution = await this.getOrCreateExecution(userId);
    if (!execution) {
      const errExec = '❌ Не удалось создать сессию';
      this.logger.error(errExec, '', this.context);
      void this.log.error(errExec, this.context);
      await this.bot.sendMessage(chatId, errExec);
      return;
    }

    // 2️⃣ Обработка документа или фотографии
    if (msg.document || (msg.photo && msg.photo.length)) {
      return this.handleFileUpload(
        chatId,
        userId,
        execution.id,
        msg.document
          ? msg.document.file_id
          : msg.photo![msg.photo!.length - 1].file_id,
        msg.document ? msg.document.file_name! : `photo.jpg`,
        msg.document ? msg.document.mime_type! : 'image/jpeg',
        msg.caption,
      );
    }

    // 3️⃣ Обработка простого текста
    if (!text) return;

    const recvMsg = `📩 Сообщение от ${userId}: "${text}"`;
    this.logger.log(recvMsg, this.context);
    void this.log.info(recvMsg, this.context, { userId, text });

    // 4️⃣ Создаём Step
    const step = await this.prisma.step.create({
      data: {
        type: 'agent',
        input: { question: text, model: 'openai/gpt-4o' },
        source: 'telegram',
        userId,
        execution: { connect: { id: execution.id } },
      },
    });
    const createStepMsg = `💾 Создан step.id=${step.id}`;
    this.logger.log(createStepMsg, this.context);
    void this.log.info(createStepMsg, this.context, { stepId: step.id });

    try {
      // 5️⃣ Собираем историю сообщений
      const history = await this.prisma.step.findMany({
        where: { executionId: execution.id },
        orderBy: { createdAt: 'asc' },
      });
      const messages: ChatMessage[] = [];
      for (const s of history) {
        const inp: any = s.input;
        const outp: any = s.output;
        if (s.type === 'agent' && inp.question) {
          messages.push({ role: 'user', content: inp.question });
        }
        if (outp?.result) {
          messages.push({ role: 'assistant', content: outp.result });
        }
      }
      messages.push({ role: 'user', content: text });

      // 6️⃣ Имитация печати
      await sleep(2000);
      await this.bot.sendChatAction(chatId, 'typing');

      // 7️⃣ Вызов агента
      const agentCallMsg = `🤖 Отправляем ${messages.length} сообщений агенту llm-tool-decision-agent`;
      this.logger.log(agentCallMsg, this.context);
      void this.log.info(agentCallMsg, this.context, { stepId: step.id });

      const result: string = await this.agentGateway.chat(
        { model: 'openai/gpt-4o', messages },
        'llm-tool-decision-agent',
      );

      // 8️⃣ Задержка перед отправкой
      const delay = Math.min(result.length * 25, 5000);
      await sleep(delay);

      // 9️⃣ Отправляем ответ пользователю
      await this.bot.sendMessage(chatId, result || 'ℹ️ Ответ отсутствует');
      const sentMsg = `✅ Отправлен ответ: "${result}"`;
      this.logger.log(sentMsg, this.context);
      void this.log.info(sentMsg, this.context, { stepId: step.id });

      // 🔟 Обновляем Step в БД
      await this.prisma.step.update({
        where: { id: step.id },
        data: { output: { result } },
      });
      const saveMsg = `💾 Сохранён результат для step.id=${step.id}`;
      this.logger.log(saveMsg, this.context);
      void this.log.info(saveMsg, this.context, { stepId: step.id });
    } catch (err: any) {
      const errMsg = `❌ Ошибка обработки текста: ${err.message}`;
      this.logger.error(errMsg, err.stack, this.context);
      void this.log.error(errMsg, this.context, {
        stepId: step.id,
        error: err.stack,
      });
      await this.bot.sendMessage(chatId, '⚠️ Ошибка при обработке текста');

      await this.prisma.step.update({
        where: { id: step.id },
        data: { error: err.message },
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
    caption?: string,
  ) {
    // 1️⃣ Создаём Step для загрузки
    const step = await this.prisma.step.create({
      data: {
        type: 'upload',
        input: { fileId, filename, mimeType },
        source: 'telegram',
        userId,
        execution: { connect: { id: executionId } },
      },
    });
    const createMsg = `💾 Step.upload создан (id=${step.id})`;
    this.logger.log(createMsg, this.context);
    void this.log.info(createMsg, this.context, { stepId: step.id });

    try {
      // 2️⃣ Скачиваем файл
      const link = await this.bot.getFileLink(fileId);
      const res = await fetch(link);
      const buffer = Buffer.from(await res.arrayBuffer());
      const dlMsg = `⬇️ Файл загружен в память (${buffer.length} байт)`;
      this.logger.log(dlMsg, this.context);
      void this.log.info(dlMsg, this.context, {
        stepId: step.id,
        size: buffer.length,
      });

      // 3️⃣ Сохраняем оригинал в Minio
      const origKey = await this.minio.uploadFileFromBuffer(buffer, filename);
      const origUrl = this.minio.getPublicUrl(origKey);
      await this.prisma.file.create({
        data: {
          id: crypto.randomUUID(),
          name: filename,
          url: origUrl,
          size: buffer.length,
          mimeType,
          stepId: step.id,
          executionId,
          isConverted: false,
        },
      });
      const saveOrigMsg = `💾 Оригинал сохранён: ${origUrl}`;
      this.logger.log(saveOrigMsg, this.context);
      void this.log.info(saveOrigMsg, this.context, { stepId: step.id });

      // 4️⃣ Конвертим (если надо)
      const converted: Utils.ConvertedFile | null = await Utils.convertFile(
        buffer,
        filename,
      );
      let finalBuffer = buffer,
        finalName = filename,
        finalMime = mimeType,
        finalUrl = origUrl;

      if (converted) {
        const convKey = await this.minio.uploadFileFromBuffer(
          converted.buffer,
          converted.name,
        );
        finalUrl = this.minio.getPublicUrl(convKey);
        await this.prisma.file.create({
          data: {
            id: crypto.randomUUID(),
            name: converted.name,
            url: finalUrl,
            size: converted.buffer.length,
            mimeType: converted.mimeType,
            stepId: step.id,
            executionId,
            isConverted: true,
          },
        });
        finalBuffer = converted.buffer;
        finalName = converted.name;
        finalMime = converted.mimeType;
        const convMsg = `🔄 Файл конвертирован и сохранён: ${finalUrl}`;
        this.logger.log(convMsg, this.context);
        void this.log.info(convMsg, this.context, { stepId: step.id });
      }

      // 5️⃣ Уведомляем пользователя
      await this.bot.sendMessage(chatId, `📎 Файл сохранён: ${finalUrl}`);

      // 6️⃣ Отправляем в агент
      const msgForAgent: ChatMessage = {
        role: 'user',
        content: caption || 'Пожалуйста, проанализируй этот файл',
        file: {
          name: finalName,
          mimeType: finalMime,
          base64: finalBuffer.toString('base64'),
        },
      };
      const filesMsg = `📎 Передаём файл агента (${finalName})`;
      this.logger.log(filesMsg, this.context);
      void this.log.info(filesMsg, this.context, {
        stepId: step.id,
        file: finalName,
      });

      const result = await this.agentGateway.chat(
        { model: 'openai/gpt-4o', messages: [msgForAgent] },
        'llm-tool-decision-agent',
      );
      await this.bot.sendMessage(chatId, `🤖 Ответ агента:\n${result}`);
      const agentMsg = `✅ Агент вернул ответ по файлу: ${result}`;
      this.logger.log(agentMsg, this.context);
      void this.log.info(agentMsg, this.context, { stepId: step.id });

      // 7️⃣ Сохраняем в DB
      await this.prisma.step.update({
        where: { id: step.id },
        data: { output: { result } },
      });
      const saveOutMsg = `💾 Сохранён ответ агента для step.id=${step.id}`;
      this.logger.log(saveOutMsg, this.context);
      void this.log.info(saveOutMsg, this.context, { stepId: step.id });
    } catch (err: any) {
      const errMsg = `❌ Ошибка при загрузке/обработке файла: ${err.message}`;
      this.logger.error(errMsg, err.stack, this.context);
      void this.log.error(errMsg, this.context, {
        stepId: step.id,
        error: err.stack,
      });
      await this.bot.sendMessage(
        chatId,
        '❌ Не удалось загрузить или обработать файл',
      );
      await this.prisma.step.update({
        where: { id: step.id },
        data: { error: err.message },
      });
    }
  }

  private async getOrCreateExecution(userId: string) {
    const recent = await this.prisma.execution.findFirst({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    if (
      recent &&
      !recent.finishedAt &&
      Date.now() - new Date(recent.startedAt).getTime() < 5 * 60 * 1000
    ) {
      return recent;
    }
    if (recent && !recent.finishedAt) {
      await this.prisma.execution.update({
        where: { id: recent.id },
        data: { finishedAt: new Date(), status: 'done' },
      });
    }
    return this.prisma.execution.create({ data: { userId, status: 'active' } });
  }
}
