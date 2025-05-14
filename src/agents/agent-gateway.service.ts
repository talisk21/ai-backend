import { Injectable } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { Agent, AgentInput, AgentOutput } from './agent.interface';
import { LLmAgent } from './llm-agent';
import { LlmToolAgent } from './llm-tool-agent';
import { ToolExecutorService } from '../tools/tool-executor.service';
import { LogService } from '../log/log.service';

@Injectable()
export class AgentGatewayService {
  private readonly agents: Record<string, Agent>;

  constructor(
    private openRouter: OpenRouterService,
    private tools: ToolExecutorService,
    private log: LogService,
  ) {
    this.agents = {
      'llm-agent': new LLmAgent(this.openRouter, this.log),
      'llm-tool-agent': new LlmToolAgent(this.openRouter, this.tools, this.log),
    };
  }

  // Метод для выполнения задачи через нужного агента
  async chat(input: AgentInput, agentName = 'llm-agent'): Promise<string> {
    const agent = this.agents[agentName];
    if (!agent) throw new Error(`Agent "${agentName}" не найден`);

    const output: AgentOutput = await agent.run(input);
    return output.result;
  }

  // Прямой вызов OpenRouter без логики агентов
  async callLLM(input: AgentInput): Promise<string> {
    return this.openRouter.chat({
      model: input.model,
      prompt: input.messages.at(-1)?.content ?? '',
      messages: input.messages,
    });
  }
}