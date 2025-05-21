import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextTrimTool implements Tool {
  name = "text_trim";

  description =
      "Удаляет пробелы (и другие пустые символы) в начале и в конце строки. " +
      "Полезно для очистки ввода пользователя, нормализации данных перед обработкой и устранения лишних пробелов.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Строка, которую нужно обрезать по краям от пробелов."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Текст не задан или имеет неверный формат";
    }

    return `✂️ "${text.trim()}"`;
  }
}