import { Agent, AgentInput, AgentOutput, ChatMessage } from "./agent.interface";
import { ToolExecutorService } from "../tools/tool-executor.service";
import { OpenRouterService } from "./openrouter.service";
import { PromptLoader } from "./prompt-loader";
import { ToolCallService } from "../tools/tool-call.service";
import { LogService } from "../log/log.service";
import { ToolResponseParserService } from "../tools/tool-response-parser.service";
import { Logger } from "@nestjs/common";

export class LlmToolAgent implements Agent {
  name = "llm-tool-agent";
  description =
    "Агент, который строго вызывает инструменты. Не генерирует ответы сам.";

  private readonly logger = new Logger(LlmToolAgent.name);

  constructor(
    private openRouter: OpenRouterService,
    private tools: ToolExecutorService,
    private log: LogService,
    private promptLoader: PromptLoader,
    private toolCallService: ToolCallService,
    private toolResponseParser: ToolResponseParserService
  ) {
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const systemPrompt = this.promptLoader.loadAgentPrompt(
      "llm-tool-agent.prompt.txt"
    );

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt
      },
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content,
        file: m.file // тип file уже корректно объявлен в интерфейсе
      }))
    ];

    // 👇 Прикрепим base64-содержимое файлов (если есть)
    if (input.files?.length) {
      this.logger.log(
        `📎 Передано файлов: ${input.files.length}`,
        "LlmToolAgent"
      );

      for (const file of input.files) {
        messages.push({
          role: "user",
          content: `Файл: ${file.name}`,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            base64: file.base64
          }
        });
      }
    }

    const response = await this.openRouter.chat({
      model: input.model,
      messages,
      useTools: true
    });

    this.logger.log(`🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`);
    await this.log.info(
      `🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`,
      "LlmToolAgent"
    );

    const parsed = this.toolResponseParser.parse(response);

    // ⛔ Обработка ошибок
    if (parsed.error !== null) {
      const msg = `❌ Ошибка парсинга tool-вызова: ${parsed.error}`;
      this.logger.warn(msg);
      await this.log.warn?.(msg, "LlmToolAgent");
      return { result: msg };
    }

    // ❌ Агент не должен принимать обычные ответы
    if (parsed.tool === null) {
      const msg =
        "❌ Этот агент не обрабатывает обычный текст. Только tool-вызовы.";
      this.logger.warn(msg);
      await this.log.warn?.(msg, "LlmToolAgent");
      return { result: msg };
    }

    // ✅ Запуск инструмента
    const output = await this.toolCallService.executeTool(
      parsed.tool,
      parsed.input
    );
    if (typeof output !== "string") {
      const errMsg =
        output?.error ?? "❌ Неизвестная ошибка выполнения инструмента.";
      this.logger.error(errMsg);
      await this.log.error?.(errMsg, "LlmToolAgent");
      return { result: errMsg };
    }

    return {
      result: output,
      usedTools: [
        {
          name: parsed.tool,
          input: parsed.input,
          output
        }
      ]
    };
  }
}
