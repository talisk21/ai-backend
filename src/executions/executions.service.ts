import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { STEP_QUEUE } from "../queue/queue.constants";

@Injectable()
export class ExecutionsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(STEP_QUEUE) private stepQueue: Queue
  ) {
  }

  async findAll() {
    return this.prisma.execution.findMany({
      orderBy: { startedAt: "desc" }
    });
  }

  async createExecution() {
    return this.prisma.execution.create({
      data: { status: "pending" }
    });
  }

  async getExecution(id: string) {
    return this.prisma.execution.findUnique({
      where: { id },
      include: { steps: true }
    });
  }

  async addStep(executionId: string, type: string, input: any) {
    const step = await this.prisma.step.create({
      data: { executionId, type, input }
    });

    // Добавляем задачу в очередь step-queue
    await this.stepQueue.add("default", {
      executionId,
      stepId: step.id
    });

    return step;
  }
}