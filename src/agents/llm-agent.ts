// src/agents/llm-agent.ts
import { Agent, AgentInput, AgentOutput } from './agent.interface';
import { OpenRouterService } from './openrouter.service';
import { Injectable } from '@nestjs/common';
import { LogService } from '../log/log.service';

@Injectable()
export class LLmAgent implements Agent {
  name = 'llm-agent';
  description = 'Базовый агент с поддержкой LLM (OpenRouter)';

  constructor(
    private openRouter: OpenRouterService,
    private log: LogService,
  ) {}

  async run(input: AgentInput): Promise<AgentOutput> {
    try {
      const result = await this.openRouter.chat({
        model: input.model,
        messages: input.messages,
        prompt: '',
      });

      await this.log.info(`LLmAgent ответ: ${result}`, 'LLmAgent', {
        model: input.model,
        lastInput: input.messages.at(-1)?.content,
      });

      return { result };
    } catch (error: any) {
      await this.log.error(`Ошибка LLM: ${error.message}`, 'LLmAgent', {
        model: input.model,
        error: error.stack,
      });

      return { result: `❌ Ошибка агента: ${error.message}` };
    }
  }
}