import { Injectable } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';

@Injectable()
export class AgentGatewayService {
  constructor(private openRouter: OpenRouterService) {}

  async chat(input: { model: string; prompt: string }): Promise<string> {
    const { model, prompt } = input;

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
        return this.openRouter.chat(prompt, model);

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }
}
