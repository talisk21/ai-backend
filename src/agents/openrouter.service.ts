import axios from "axios";
import { Injectable, Logger } from "@nestjs/common";
import { ToolSpecOpenRouterAdapter } from "../tools/tool-spec-openrouter-adapter";
import { ChatMessage } from "./agent.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OpenRouterService {
  private apiKey: string;
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(
    private readonly toolAdapter: ToolSpecOpenRouterAdapter,
    private readonly config: ConfigService
  ) {
    this.apiKey = this.config.get<string>("OPENROUTER_API_KEY");
    if (!this.apiKey) throw new Error("❌ OPENROUTER_API_KEY не задан в .env");
  }

  async chat(input: {
    model: string;
    messages: ChatMessage[];
    useTools?: boolean;
  }): Promise<
    | { type: "text"; content: string }
    | { type: "tool"; toolCalls: { name: string; arguments: any }[] }
  > {
    const { model, messages, useTools = false } = input;

    if (!messages || messages.length === 0) {
      throw new Error("❌ Не указаны сообщения для LLM");
    }

    const tools = useTools ? this.toolAdapter.getToolFunctions() : undefined;

    const formattedMessages = messages.map((msg) => {
      const content: any[] = [];

      if (typeof msg.content === "string") {
        content.push({ type: "text", text: msg.content });
      } else if (Array.isArray(msg.content)) {
        content.push(...msg.content);
      }

      if (msg.file && msg.file.base64 && msg.file.mimeType) {
        const base64Url = `data:${msg.file.mimeType};base64,${msg.file.base64}`;
        content.push({
          type: "image_url",
          image_url: {
            url: base64Url
          }
        });
      }

      return {
        role: msg.role,
        content
      };
    });

    this.logger.debug(`📤 Отправка запроса в OpenRouter:
    ┌─ Model: ${model}
    ├─ Tools: ${useTools ? "включены" : "отключены"}
    └─ Messages: ${JSON.stringify(formattedMessages, null, 2)}
    `);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: formattedMessages,
        tools
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'ai-platform',
        },
      }
    );

    const data = response?.data;

    this.logger.debug(`📥 Ответ от OpenRouter:\n${JSON.stringify(data, null, 2)}`);

    if (data?.error) {
      Logger.error("❌ OpenRouter вернул ошибку:\n" + JSON.stringify(data.error, null, 2), "OpenRouterService");
      throw new Error(`OpenRouter error: ${data.error.message}`);
    }

    const choice = data?.choices?.[0];
    const message = choice?.message;

    if (!message) {
      Logger.error("❌ OpenRouter не вернул message:\n" + JSON.stringify(data, null, 2), "OpenRouterService");
      throw new Error("Ответ от LLM отсутствует или повреждён");
    }

    if (message.tool_calls?.length) {
      const toolCalls = message.tool_calls.map((call: any) => ({
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments)
      }));
      return { type: "tool", toolCalls };
    }

    if (message.content) {
      return { type: "text", content: message.content };
    }

    throw new Error("❌ Ответ не содержит ни tool_calls, ни контента");
  }
}