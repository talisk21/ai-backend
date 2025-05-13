import { Injectable } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';

export interface AgentChatInput {
  model: string;
  prompt?: string;
  messages?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

@Injectable()
export class AgentGatewayService {
  constructor(private openRouter: OpenRouterService) {}

  async chat(input: AgentChatInput): Promise<string> {
    const { model, prompt, messages } = input;

    // Поддерживаем модели OpenRouter и похожие
    switch (true) {
      case model.startsWith('openai/'):
      case model.startsWith('mistral'):
      case model.startsWith('claude'):
      case model.startsWith('anthropic/'):
      case model.startsWith('meta/'):
      case model.startsWith('google/'):
      case model.startsWith('perplexity/'):
      case model.startsWith('nousresearch/'):
      case model.startsWith('gryphe/'):
      case model.startsWith('togethercomputer/'):
        return this.openRouter.chat({ model, prompt, messages });

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }
}