import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";

export class UrlTitleTool implements Tool {
  name = "url_title";

  description =
      "Получает содержимое тега `<title>` веб-страницы по указанному URL. " +
      "Полезно для определения названия страницы, проверки метаинформации и анализа сайтов.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "Полный URL-адрес страницы. Например: \"https://example.com\""
    }
  ];

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== "string") {
      return "❌ URL не указан";
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI-Agent/1.0)"
        },
        timeout: 10000
      });

      const html = response.data as string;
      const match = html.match(/<title[^>]*>(.*?)<\/title>/i);

      if (match && match[1]) {
        return `📌 Заголовок страницы: ${match[1].trim()}`;
      }

      return "ℹ️ Тег <title> не найден на странице";
    } catch (error: any) {
      return `❌ Ошибка при загрузке: ${error?.message || "неизвестная ошибка"}`;
    }
  }
}