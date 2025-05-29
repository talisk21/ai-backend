import { Injectable, Logger } from '@nestjs/common';
import * as Services from '@services';
import * as Utils from '@utils';
import { Agent, AgentInput, AgentOutput } from './agent.interface';

@Injectable()
export class LLmAgent implements Agent {
  name = 'llm-agent';
  description =
    'Базовый агент с поддержкой LLM (OpenRouter), без инструментов.';

  private readonly context = LLmAgent.name;
  private readonly logger = new Logger(this.context);

  constructor(
    private openRouter: Services.OpenRouterService,
    private toolProxy: Services.ToolProxyService,
    private log: Services.LogService,
  ) {}

  async run(input: AgentInput): Promise<AgentOutput> {
    const systemPrompt = Utils.loadPrompt('llm-agent.prompt.txt');

    try {
      const messages = [...input.messages];

      // Прикрепим base64 содержимое файлов, если есть
      if (input.files?.length) {
        for (const file of input.files) {
          messages.push({
            role: 'user',
            content: `Файл "${file.name}" (${file.mimeType}) как base64:\n\n${file.base64}`,
          });
        }
      }

      const response = await this.openRouter.chat({
        model: input.model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        useTools: false,
      });

      const logMessage = `🔄 Ответ от LLM (agent):\n${JSON.stringify(response, null, 2)}`;
      this.logger.log(logMessage, this.context);
      void this.log.info(logMessage, this.context);

      if (response.type === 'text') {
        return { result: response.content };
      }

      return { result: '❌ Неизвестный формат ответа от LLM' };
    } catch (error: any) {
      const errMsg = `Ошибка LLM: ${error.message}`;
      this.logger.log(errMsg, this.context, {
        model: input.model,
        error: error.stack,
      });
      void this.log.info(errMsg, this.context, {
        model: input.model,
        error: error.stack,
      });

      return { result: `❌ Ошибка агента: ${error.message}` };
    }
  }
}
