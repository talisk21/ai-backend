import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";
import * as cheerio from "cheerio";

export class ExtractTableTool implements Tool {
  name = "extract_table";

  description =
      "Извлекает первую таблицу со страницы по указанному URL и возвращает её содержимое в виде JSON-массива. " +
      "Полезно для парсинга HTML-таблиц, автоматизации сбора данных и анализа веб-страниц. " +
      "Обрабатывает заголовки, извлекает строки и возвращает максимум 10 строк.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "URL-адрес страницы, на которой нужно найти и извлечь первую таблицу. Например: \"https://example.com/table\"."
    }
  ];

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== "string") {
      return "❌ Укажи URL страницы";
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI-Agent/1.0)"
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const table = $("table").first();

      if (!table.length) return "📭 Таблица не найдена.";

      const headers: string[] = [];
      const rows: string[][] = [];

      table.find("tr").each((i, row) => {
        const cells = $(row).find("th, td");
        const rowData: string[] = [];

        cells.each((_, cell) => {
          rowData.push($(cell).text().trim());
        });

        if (i === 0) {
          headers.push(...rowData);
        } else {
          rows.push(rowData);
        }
      });

      const result = rows.slice(0, 10).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h || `col_${i + 1}`] = row[i] || "";
        });
        return obj;
      });

      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `❌ Ошибка: ${error.message}`;
    }
  }
}