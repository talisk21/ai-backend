import { Agent, AgentInput, AgentOutput } from "./agent.interface";
import { OpenRouterService } from "./openrouter.service";
import { Injectable, Logger } from "@nestjs/common";
import { LogService } from "../log/log.service";
import { PromptLoader } from "./prompt-loader";
import { AgentGatewayService } from "./agent-gateway.service";

@Injectable()
export class LLmAgent implements Agent {
  name = "llm-agent";
  description = "Базовый агент с поддержкой LLM (OpenRouter), без инструментов.";

  private readonly logger = new Logger(AgentGatewayService.name);

  constructor(
    private openRouter: OpenRouterService,
    private log: LogService,
    private promptLoader: PromptLoader
  ) {
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const systemPrompt = this.promptLoader.loadAgentPrompt("llm-agent.prompt.txt");

    try {
      const messages = [...input.messages];

      // Прикрепим base64 содержимое файлов, если есть
      if (input.files?.length) {
        for (const file of input.files) {
          messages.push({
            role: "user",
            content: `Файл "${file.name}" (${file.mimeType}) как base64:\n\n${file.base64}`
          });
        }
      }

      const response = await this.openRouter.chat({
        model: input.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        useTools: false
      });

      this.logger.log(
        `🔄 Ответ от LLM (agent):\n${JSON.stringify(response, null, 2)}`,
        "LLmAgent"
      );

      await this.log.info(
        `🔄 Ответ от LLM (agent):\n${JSON.stringify(response, null, 2)}`,
        "LLmAgent"
      );

      if (response.type === "text") {
        return { result: response.content };
      }

      return { result: "❌ Неизвестный формат ответа от LLM" };

    } catch (error: any) {
      await this.log.error(`Ошибка LLM: ${error.message}`, "LLmAgent", {
        model: input.model,
        error: error.stack
      });

      return { result: `❌ Ошибка агента: ${error.message}` };
    }
  }
}
