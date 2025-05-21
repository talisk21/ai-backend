import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextLengthTool implements Tool {
  name = "text_length";

  description =
    "Подсчитывает длину текста — количество символов и слов. " +
    "Полезен для анализа объёма контента, ограничения ввода, оценки плотности текста. " +
    "Учитывает все символы, включая пробелы.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст для анализа. Например: сообщение, описание, статья."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Текст не задан или имеет неверный формат";
    }

    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).length;

    return `📝 Длина текста: ${charCount} символов, ${wordCount} слов`;
  }
}