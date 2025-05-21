import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextUppercaseTool implements Tool {
  name = "text_uppercase";

  description =
    "Преобразует весь текст в верхний регистр (заглавные буквы). " +
    "Полезно для визуального выделения текста, нормализации данных или форматирования заголовков.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Исходный текст, который нужно преобразовать в верхний регистр."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Текст не задан или имеет неверный формат";
    }

    return `🔠 ${text.toUpperCase()}`;
  }
}