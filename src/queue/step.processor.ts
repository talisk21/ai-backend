import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { STEP_QUEUE } from './queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AgentGatewayService } from '../agents/agent-gateway.service';
import { Prisma } from '@prisma/client';

// Тип сообщения для модели
type ChatRole = 'user' | 'assistant';
interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Типы входа/выхода шага
interface StepInput {
  question: string;
  model: string;
}

interface StepOutput {
  result: string;
}

@Processor(STEP_QUEUE)
@Injectable()
export class StepProcessor {
  private readonly logger = new Logger(StepProcessor.name);

  constructor(
    private prisma: PrismaService,
    private agentGateway: AgentGatewayService,
  ) {}

  @Process()
  async handleStep(job: Job) {
    const { stepId } = job.data;

    const step = await this.prisma.step.findUnique({
      where: { id: stepId },
    });

    if (!step) {
      this.logger.warn(`Step not found: ${stepId}`);
      return;
    }

    try {
      const input = step.input as unknown as StepInput;

      this.logger.log(`[StepProcessor] Выполняется stepId: ${stepId} | model: ${input.model}`);

      // Получаем все шаги выполнения
      const execution = await this.prisma.execution.findUnique({
        where: { id: step.executionId },
        include: { steps: { orderBy: { createdAt: 'asc' } } },
      });

      const messages: ChatMessage[] = [];

      for (const s of execution?.steps || []) {
        const sInput = s.input as unknown as StepInput;
        const sOutput = s.output as unknown as StepOutput;

        if (sInput?.question && sOutput?.result) {
          messages.push({ role: 'user', content: sInput.question });
          messages.push({ role: 'assistant', content: sOutput.result });
        }
      }

      // Добавляем текущий шаг как последний user input
      messages.push({ role: 'user', content: input.question });

      // Обращаемся к агенту
      const resultText = await this.agentGateway.chat({
        model: input.model,
        prompt: input.question,
        messages,
      });

      const output: StepOutput = { result: resultText };

      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          output: output as unknown as Prisma.InputJsonValue,
        },
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Step ${stepId} failed`, error.stack);

      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          error: error.message || 'Unknown error',
        },
      });
    }
  }
}