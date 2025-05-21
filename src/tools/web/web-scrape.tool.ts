import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";
import * as cheerio from "cheerio";

export class WebScrapeTool implements Tool {
  name = "web_scrape";

  description =
    "Загружает HTML-страницу по указанному URL и извлекает из неё читаемый текст. " +
    "Удаляет теги `<script>`, `<style>` и другие вспомогательные элементы, оставляя только видимый текст с основной страницы. " +
    "Полезно для анализа содержимого сайтов, извлечения информации и подготовки текста к дальнейшей обработке.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "Полный URL веб-страницы для извлечения текста (например: https://example.com)."
    }
  ];

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== "string") {
      return "❌ Укажи валидный URL для парсинга";
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI-Agent/1.0)"
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Удалим нерелевантные элементы
      $("script, style, noscript, iframe, head, meta, link").remove();

      const text = $("body").text();
      const cleaned = text.replace(/\s+/g, " ").trim();

      return cleaned.slice(0, 2000) || "⛔ Ничего не найдено на странице.";
    } catch (error: any) {
      return `❌ Ошибка при загрузке страницы: ${error.message}`;
    }
  }
}