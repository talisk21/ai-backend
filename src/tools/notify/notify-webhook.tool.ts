import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";

export class NotifyWebhookTool implements Tool {
  name = "notify_webhook";
  description = "Отправляет HTTP-запрос на указанный Webhook (универсальный метод).";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "URL для отправки webhook-запроса"
    },
    {
      name: "method",
      type: "string",
      required: false,
      description: "HTTP-метод запроса (по умолчанию POST)"
    },
    {
      name: "headers",
      type: "object",
      required: false,
      description: "Заголовки запроса (в формате ключ-значение)"
    },
    {
      name: "params",
      type: "object",
      required: false,
      description: "Query-параметры запроса"
    },
    {
      name: "data",
      type: "object",
      required: false,
      description: "Тело запроса (например, JSON)"
    }
  ];

  async run(input: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
  }): Promise<string> {
    const { url, method = "POST", headers = {}, params = {}, data } = input;

    if (!url) return "❌ Не указан URL для webhook-запроса";

    try {
      new URL(url);
    } catch {
      return "❌ Указан некорректный URL.";
    }

    try {
      const response = await axios.request({
        url,
        method: method.toUpperCase(),
        headers,
        params,
        data
      });

      return `✅ Webhook выполнен успешно: [${response.status}] ${response.statusText}`;
    } catch (error: any) {
      const code = error.response?.status || "—";
      const msg = error.response?.statusText || error.message || "Неизвестная ошибка";
      const responseData = error.response?.data;

      return `❌ Ошибка при выполнении webhook-запроса:
[Код]: ${code}
[Сообщение]: ${msg}
${responseData ? "[Ответ]: " + JSON.stringify(responseData) : ""}`;
    }
  }
}