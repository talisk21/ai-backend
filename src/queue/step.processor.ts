import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { STEP_QUEUE } from './queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AgentGatewayService } from '../agents/agent-gateway.service';
import { LogService } from '../log/log.service';
import { ToolExecutorService } from '../tools/tool-executor.service';
import { Prisma } from '@prisma/client';

type ChatRole = 'user' | 'assistant';
interface ChatMessage {
  role: ChatRole;
  content: string;
}

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
    private log: LogService,
    private toolExecutor: ToolExecutorService,
  ) {}

  @Process('default')
  async handleStep(job: Job) {
    const { stepId } = job.data;

    const step = await this.prisma.step.findUnique({ where: { id: stepId } });
    if (!step) {
      const msg = `Step not found: ${stepId}`;
      this.logger.warn(msg);
      await this.log.warn(msg, 'StepProcessor', { stepId });
      return;
    }

    try {
      const input = step.input as unknown as StepInput;
      const question = input.question?.trim();
      const model = input.model;

      const startMsg = `▶️ Выполняется stepId: ${stepId} | model: ${model}`;
      this.logger.log(startMsg);
      await this.log.info(startMsg, 'StepProcessor', {
        stepId,
        executionId: step.executionId,
        model,
        input: question,
      });

      // --- ВЫПОЛНЕНИЕ TOOL ---
      if (question?.startsWith('tool:')) {
        const [rawName, rawArgs] = question.split(/ (.+)/);
        const name = rawName.replace('tool:', '').trim();

        let args: any = {};
        try {
          args = rawArgs ? JSON.parse(rawArgs) : {};
        } catch {
          args = rawArgs?.trim();
        }

        this.logger.log(`🛠 Tool вызван: ${name} | args: ${JSON.stringify(args)}`);
        await this.log.debug(`Tool "${name}" args:`, 'StepProcessor', { stepId, args });

        const resultText = await this.toolExecutor.execute({ name, args });
        const output: StepOutput = { result: resultText };

        await this.prisma.step.update({
          where: { id: stepId },
          data: { output: output as unknown as Prisma.InputJsonValue },
        });

        await this.log.info(`✅ Tool "${name}" выполнен`, 'StepProcessor', { stepId, output });
        return true;
      }

      // --- Обычный AGENT шаг ---
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

      messages.push({ role: 'user', content: question });

      const resultText = await this.agentGateway.chat({
        model,
        prompt: question,
        messages,
      });

      const output: StepOutput = { result: resultText };

      await this.prisma.step.update({
        where: { id: stepId },
        data: { output: output as unknown as Prisma.InputJsonValue },
      });

      const doneMsg = `✅ Step выполнен: ${stepId}`;
      this.logger.log(doneMsg);
      await this.log.info(doneMsg, 'StepProcessor', {
        stepId,
        result: resultText,
      });

      return true;
    } catch (error: any) {
      const errorMsg = `❌ Ошибка в step ${stepId}: ${error.message}`;
      this.logger.error(errorMsg, error.stack);
      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          error: error.message || 'Unknown error',
        },
      });
      await this.log.error(errorMsg, 'StepProcessor', {
        stepId,
        stack: error.stack,
      });
    }
  }
}