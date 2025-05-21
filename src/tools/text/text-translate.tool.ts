import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";

export class TextTranslateTool implements Tool {
  name = "text_translate";

  description =
    "Переводит текст с одного языка на другой, используя API LibreTranslate. " +
    "Полезно для мультиязычных агентов, локализации сообщений и автоматической обработки данных на разных языках. " +
    "Языки задаются в формате ISO-кодов (например: \"en\", \"ru\", \"de\").";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, который нужно перевести."
    },
    {
      name: "to",
      type: "string",
      required: true,
      description: "Целевой язык перевода (ISO-код, например: \"en\", \"ru\")."
    },
    {
      name: "from",
      type: "string",
      required: false,
      description: "Исходный язык текста (по умолчанию определяется автоматически)."
    }
  ];

  async run(input: { text: string; to: string; from?: string }): Promise<string> {
    const { text, to, from = "auto" } = input;

    if (!text || !to) {
      return "❌ Укажи текст и целевой язык перевода (например, \"en\", \"ru\")";
    }

    try {
      const response = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: text,
          source: from,
          target: to,
          format: "text"
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      return `🌐 Перевод: ${response.data.translatedText}`;
    } catch (error: any) {
      return `❌ Ошибка при переводе: ${error.message}`;
    }
  }
}