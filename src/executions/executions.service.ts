import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as Services from "@services";
import { Queue } from "bull";
import { STEP_QUEUE } from "../queue/queue.constants";
import { FlowNode, RouteFlow } from "../routes/route.interface";

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);
  private readonly context = 'ExecutionsService';

  constructor(
      private prisma: Services.PrismaService,
      private log: Services.LogService,
      @InjectQueue(STEP_QUEUE) private stepQueue: Queue,
  ) {}

  async findAll() {
    return this.prisma.execution.findMany({
      orderBy: { startedAt: 'desc' },
    });
  }

  async createExecution(templateId?: string) {
    const execution = await this.prisma.execution.create({
      data: {
        status: 'pending',
        templateId,
      },
    });

    const msg = `🆕 Создан execution: ${execution.id}`;
    this.logger.log(msg);
    void this.log.info(msg, this.context, { templateId });

    return execution;
  }

  async getExecution(id: string) {
    return this.prisma.execution.findUnique({
      where: { id },
      include: { steps: true },
    });
  }

  async addStep(
      executionId: string,
      type: string,
      input: any,
      parentStepId?: string,
  ) {
    const step = await this.prisma.step.create({
      data: {
        executionId,
        type,
        input: input as Prisma.InputJsonValue,
        parentStepId,
      },
    });

    const msg = `➕ Добавлен step: ${step.id} к execution ${executionId}`;
    this.logger.log(msg);
    void this.log.info(msg, this.context, { input, parentStepId });

    const shouldQueue = !parentStepId || input.forceStart === true;
    if (shouldQueue) {
      const queueMsg = `📤 Шаг ${step.id} добавлен в очередь`;
      this.logger.log(queueMsg);
      void this.log.info(queueMsg, this.context);

      await this.stepQueue.add('default', {
        executionId,
        stepId: step.id,
      });
    }

    return step;
  }

  async respondToWaitingStep(
      executionId: string,
      stepId: string,
      userMessage: string,
  ) {
    const step = await this.prisma.step.findUnique({ where: { id: stepId } });

    if (
        !step ||
        step.executionId !== executionId ||
        step.status !== 'waiting_user_loop'
    ) {
      const errMsg = '⛔ Невалидный step для ответа пользователя';
      this.logger.error(errMsg);
      void this.log.error(errMsg, this.context, { stepId, executionId });
      throw new Error(errMsg);
    }

    const input = step.input as any;
    if (!input.messages || !Array.isArray(input.messages)) {
      input.messages = [];
    }

    input.messages.push({ role: 'user', content: userMessage });

    await this.prisma.step.update({
      where: { id: stepId },
      data: {
        input,
        status: 'pending',
      },
    });

    const resumeMsg = `🔁 Пользователь ответил, step ${stepId} возобновляется`;
    this.logger.log(resumeMsg);
    void this.log.info(resumeMsg, this.context);

    await this.stepQueue.add('default', { executionId, stepId });

    return { success: true };
  }

  async onStepComplete(stepId: string) {
    const step = await this.prisma.step.findUnique({ where: { id: stepId } });
    if (!step) return;

    const execution = await this.prisma.execution.findUnique({
      where: { id: step.executionId },
    });
    if (!execution || !execution.routeJson) return;

    const content = execution.routeJson as unknown as RouteFlow;
    const edges = content.edges;
    const nodeMap = new Map<string, FlowNode>();
    content.nodes.forEach((n) => nodeMap.set(n.id, n));

    const input = step.input as any;
    const currentNodeId = input.nodeId;
    const childrenEdges = edges.filter((e) => e.source === currentNodeId);

    for (const edge of childrenEdges) {
      const childNode = nodeMap.get(edge.target);
      if (!childNode) continue;

      const nextStep = await this.addStep(
          step.executionId,
          'workflow-step',
          {
            nodeId: childNode.id,
            model: childNode.data.model,
            agent: childNode.data.agent,
            question: childNode.data.prompt || childNode.data.label,
            tools: childNode.data.tools || [],
          },
          step.id,
      );

      const linkMsg = `🔗 Step ${step.id} → child step ${nextStep.id}`;
      this.logger.log(linkMsg);
      void this.log.info(linkMsg, this.context);

      await this.stepQueue.add('default', {
        executionId: step.executionId,
        stepId: nextStep.id,
      });
    }
  }

  async runRouteFromTemplate(templateId: string) {
    const template = await this.prisma.routeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      const errMsg = `❌ Route template ${templateId} не найден`;
      this.logger.error(errMsg);
      void this.log.error(errMsg, this.context);
      throw new Error(errMsg);
    }

    const content = template.content as unknown as RouteFlow;
    const execution = await this.createExecution(templateId);

    const routeLog = `📦 Сохраняем маршрут шаблона в execution ${execution.id}`;
    this.logger.log(routeLog);
    void this.log.info(routeLog, this.context);

    await this.prisma.execution.update({
      where: { id: execution.id },
      data: {
        routeJson: content as unknown as Prisma.InputJsonValue,
      },
    });

    // Поиск первого (root) узла
    const targetIds = new Set(content.edges.map((e) => e.target));
    const rootNode = content.nodes.find((n) => !targetIds.has(n.id));

    if (!rootNode) {
      const errMsg = '❌ Root node не найден';
      this.logger.error(errMsg);
      void this.log.error(errMsg, this.context);
      throw new Error(errMsg);
    }

    // Создание первого шага (только одного)
    const step = await this.addStep(execution.id, 'workflow-step', {
      nodeId: rootNode.id,
      model: rootNode.data.model,
      agent: rootNode.data.agent,
      question: rootNode.data.prompt || rootNode.data.label,
      tools: rootNode.data.tools || [],
    });

    const initLog = `🚀 Первый шаг ${step.id} (${rootNode.data.agent}) запущен`;
    this.logger.log(initLog);
    void this.log.info(initLog, this.context);

    await this.stepQueue.add('default', {
      executionId: step.executionId,
      stepId: step.id,
    });

    return execution;
  }
}