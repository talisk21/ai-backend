import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as Services from "@services";
import { Job, Queue } from "bull";
import { STEP_QUEUE } from "./queue.constants";

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface StepInput {
  question?: string; // используется только для самого первого сообщения
  model: string;
  agent?: string;
  messages?: ChatMessage[];
  tools?: string[];
}

@Processor(STEP_QUEUE)
@Injectable()
export class StepProcessor {
  private readonly context = StepProcessor.name;
  private readonly logger = new Logger(this.context);

  constructor(
    private readonly prisma: Services.PrismaService,
    private readonly agentGateway: Services.AgentGatewayService,
    private readonly log: Services.LogService,
    private readonly toolProxy: Services.ToolProxyService,
    private readonly executionsService: Services.ExecutionsService,
    @InjectQueue(STEP_QUEUE) private readonly stepQueue: Queue,
  ) {}

  @Process('default')
  async handleStep(job: Job<{ executionId: string; stepId: string }>) {
    const { stepId } = job.data;
    const step = await this.prisma.step.findUnique({ where: { id: stepId } });

    if (!step) {
      const msg = `❌ Step не найден: ${stepId}`;
      this.logger.warn(msg);
      void this.log.info(msg, this.context, { stepId });
      return;
    }

    try {
      const input = step.input as unknown as StepInput;
      const model = input.model;
      const agent = input.agent || step.type || 'llm-tool-decision-agent';
      const messages: ChatMessage[] = input.messages || [];

      // Если история ещё не началась — добавляем первое сообщение
      if (!messages.length && input.question) {
        messages.push({ role: 'user', content: input.question });
      }

      // Обновляем input.messages
      input.messages = messages;

      const lastMessage = messages.at(-1)?.content ?? '';

      this.logger.log(`🤖 Агент "${agent}", сообщений: ${messages.length}`);
      void this.log.info(`🤖 Агент "${agent}"`, this.context, { stepId, agent });

      const resultText = await this.agentGateway.chat(
        { model, prompt: lastMessage, messages },
        agent,
      );

      // Добавляем ответ агента в историю
      messages.push({ role: 'assistant', content: resultText });
      input.messages = messages;

      const isDone = resultText?.includes('__DONE__');

      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          input: input as unknown as Prisma.InputJsonValue,
          output: { result: resultText } as Prisma.InputJsonValue,
          status: isDone ? 'done' : 'waiting_user_loop',
        },
      });

      const logMsg = isDone
        ? '✅ Ответ от агента получен'
        : '🕐 Ожидание ответа пользователя (waiting_user_loop)'

      this.logger.log(logMsg);
      void this.log.info(logMsg, this.context, { stepId });

      if (isDone) {
        const completeMsg = `🔁 Запуск onStepComplete для step ${stepId}`;
        this.logger.log(completeMsg);
        void this.log.info(completeMsg, this.context, { stepId });

        await this.executionsService.onStepComplete(stepId);
      }

      return true;
    } catch (error: any) {
      const errorMsg = `❌ Ошибка в step ${stepId}: ${error.message}`;
      this.logger.error(errorMsg, error.stack);
      void this.log.error(errorMsg, this.context, { stepId });

      await this.prisma.step.update({
        where: { id: stepId },
        data: { error: error.message || 'Unknown error', status: 'error' },
      });

      return false;
    }
  }
}