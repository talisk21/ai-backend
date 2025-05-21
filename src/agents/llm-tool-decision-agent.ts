import { Agent, AgentInput, AgentOutput, ChatMessage } from "./agent.interface";
import { ToolExecutorService } from "../tools/tool-executor.service";
import { OpenRouterService } from "./openrouter.service";
import { PromptLoader } from "./prompt-loader";
import { ToolCallService } from "../tools/tool-call.service";
import { LogService } from "../log/log.service";
import { ToolResponseParserService } from "../tools/tool-response-parser.service";
import { Logger } from "@nestjs/common";

export class LlmToolDecisionAgent implements Agent {
  name = "llm-tool-decision-agent";
  description =
    "LLM агент, выбирающий нужный инструмент и вызывающий его, либо возвращающий ответ напрямую.";

  private readonly logger = new Logger(LlmToolDecisionAgent.name);

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
    const { model } = input;
    const systemPrompt = this.promptLoader.loadAgentPrompt(
      "llm-tool-decision-agent.prompt.txt"
    );

    // 🧠 Формируем сообщения с прикреплёнными файлами (если есть)
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content,
        file: m.file // если уже был file в сообщении
      }))
    ];

    if (input.files?.length) {
      this.logger.log(`📎 Вложения: ${input.files.length} файла(ов)`);

      for (const file of input.files) {
        messages.push({
          role: "user",
          content: `📂 Вложение: ${file.name}`,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            base64: file.base64
          }
        });
      }
    }

    const response = await this.openRouter.chat({
      model,
      messages,
      useTools: true
    });

    this.logger.log(
      `🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`,
      "LLmToolDecisionAgent"
    );
    await this.log.info(
      `🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`,
      "LLmToolDecisionAgent"
    );

    const parsed = this.toolResponseParser.parse(response);

    // 🔴 Ошибка парсинга (но может быть обычный текст)
    if (parsed.error !== null) {
      if (response?.type === "text" && typeof response.content === "string") {
        return { result: response.content };
      }
      return { result: parsed.error };
    }

    // ✅ Если инструмент не вызван — просто возвращаем ответ
    if (parsed.tool === null) {
      return {
        result:
          parsed.answer ??
          "✅ Инструмент не требуется, ответ сформирован напрямую."
      };
    }

    // ⚙️ Вызов инструмента
    const output = await this.toolCallService.executeTool(
      parsed.tool,
      parsed.input
    );
    if (typeof output !== "string") {
      return {
        result:
          output?.error ?? "❌ Неизвестная ошибка выполнения инструмента."
      };
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
