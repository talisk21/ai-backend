import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextCorrectGrammarTool implements Tool {
  name = "text_correct_grammar";

  description =
    "Выполняет базовую корректировку текста: устраняет лишние пробелы, исправляет пунктуацию, " +
    "а также делает первую букву каждого предложения заглавной. Полезен для вычитки коротких сообщений или заметок.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, в котором нужно исправить орфографию и пунктуацию."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    let { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Пожалуйста, укажи текст";
    }

    // Простые улучшения:
    text = text
      .replace(/\s+/g, " ") // удалить лишние пробелы
      .replace(/ ,/g, ",")  // убрать пробел перед запятой
      .replace(/ \./g, ".") // убрать пробел перед точкой
      .replace(/\s+([!?])/g, "$1") // убрать пробел перед воскл./вопр.
      .replace(/(^\w)|(\.\s+\w)/g, m => m.toUpperCase()); // первая буква с заглавной

    return `✍️ Исправленный текст:\n${text}`;
  }
}