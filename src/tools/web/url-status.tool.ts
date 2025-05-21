import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";

export class UrlStatusTool implements Tool {
  name = "url_status";

  description =
      "Проверяет доступность URL и возвращает HTTP-статус код ответа. " +
      "Полезен для мониторинга сайтов, проверки состояния API и диагностики ошибок соединения. " +
      "Использует HEAD-запрос, чтобы получить только заголовки без загрузки тела ответа.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "Полный URL-адрес ресурса, доступность которого нужно проверить. Например: \"https://example.com\""
    }
  ];

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== "string") {
      return "❌ URL не указан или имеет неверный формат";
    }

    try {
      const response = await axios.head(url); // HEAD-запрос для экономии трафика
      return `🔍 Статус ${response.status}: ${response.statusText}`;
    } catch (error: any) {
      if (error.response) {
        return `⚠️ Ошибка ${error.response.status}: ${error.response.statusText}`;
      }
      return `❌ Ошибка: ${error.message}`;
    }
  }
}