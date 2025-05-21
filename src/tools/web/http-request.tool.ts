import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";

export class HttpRequestTool implements Tool {
  name = "http_request";

  description =
    "Позволяет отправить универсальный HTTP-запрос (GET, POST, PUT и др.) по заданному URL. " +
    "Поддерживает настройку метода, заголовков, параметров запроса, тела запроса, авторизации и таймаута. " +
    "Полезен для взаимодействия с внешними API, проверок состояния и получения данных.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "method",
      type: "string",
      required: false,
      description: "HTTP-метод запроса: GET, POST, PUT, DELETE и т.п. По умолчанию — GET."
    },
    {
      name: "url",
      type: "string",
      required: true,
      description: "Полный URL-адрес запроса. Например: \"https://api.example.com/data\"."
    },
    {
      name: "headers",
      type: "object",
      required: false,
      description: "Дополнительные заголовки запроса в формате { \"Header-Name\": \"value\" }."
    },
    {
      name: "params",
      type: "object",
      required: false,
      description: "Query-параметры (в URL) в формате { ключ: значение }. Например: { page: 1 }."
    },
    {
      name: "data",
      type: "object",
      required: false,
      description: "Тело запроса (для POST, PUT и др.), например: { name: \"John\" }."
    },
    {
      name: "auth",
      type: "object",
      required: false,
      description: "Объект авторизации: { username: \"user\", password: \"pass\" } (basic-auth)."
    },
    {
      name: "timeout",
      type: "number",
      required: false,
      description: "Таймаут запроса в миллисекундах. По умолчанию — 7000 мс."
    },
    {
      name: "responseType",
      type: "string",
      required: false,
      description: "Тип ожидаемого ответа: \"json\", \"text\", или \"arraybuffer\". По умолчанию — \"text\"."
    }
  ];

  async run(input: {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    auth?: { username: string; password: string };
    timeout?: number;
    responseType?: "json" | "text" | "arraybuffer";
  }): Promise<string> {
    const {
      method = "GET",
      url,
      headers = {},
      params = {},
      data,
      auth,
      timeout = 7000,
      responseType = "text"
    } = input;

    if (!url || typeof url !== "string") {
      return "❌ URL не указан";
    }

    try {
      const response = await axios.request({
        method,
        url,
        headers,
        params,
        data,
        auth,
        timeout,
        responseType
      });

      const content =
        typeof response.data === "string"
          ? response.data.slice(0, 1000)
          : JSON.stringify(response.data, null, 2).slice(0, 1000);

      return `✅ [${response.status}] ${response.statusText}\n${content}`;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.statusText || error.message;
      return `❌ Ошибка запроса${status ? ` (${status})` : ""}: ${message}`;
    }
  }
}