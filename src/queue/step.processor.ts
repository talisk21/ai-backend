import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { STEP_QUEUE } from './queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AgentGatewayService } from '../agents/agent-gateway.service';
import { Injectable } from '@nestjs/common';

@Processor(STEP_QUEUE)
@Injectable()
export class StepProcessor {
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

    if (!step) return;

    try {
      const input = step.input as { question: string; model: string };
      const result = await this.agentGateway.chat({
        model: input.model,
        prompt: input.question,
      });

      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          output: { result },
        },
      });

      return true;
    } catch (error) {
      await this.prisma.step.update({
        where: { id: stepId },
        data: {
          error: error.message || 'Unknown error',
        },
      });
    }
  }
}
