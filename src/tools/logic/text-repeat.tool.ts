import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextRepeatTool implements Tool {
  name = "text_repeat";

  description =
    "Повторяет указанный текст заданное количество раз с заданным разделителем. " +
    "Полезно для генерации повторяющихся шаблонов, отладочных строк или тестов.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, который нужно повторить, например \"Привет\""
    },
    {
      name: "times",
      type: "number",
      required: true,
      description: "Количество повторений. Должно быть целым числом ≥ 1."
    },
    {
      name: "separator",
      type: "string",
      required: false,
      description: "Разделитель между повторениями. По умолчанию — пробел."
    }
  ];

  async run(input: { text: string; times: number; separator?: string }): Promise<string> {
    const { text, times, separator = " " } = input;

    if (!text || typeof text !== "string" || !Number.isInteger(times) || times < 1) {
      return "❌ Укажи текст и целое число повторений ≥ 1";
    }

    return Array(times).fill(text).join(separator);
  }
}