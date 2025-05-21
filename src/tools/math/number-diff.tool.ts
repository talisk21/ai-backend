import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberDiffTool implements Tool {
  name = "number_diff";

  description =
    "Вычисляет разницу между двумя числами (a - b). Может вернуть абсолютное значение, если параметр `abs` равен true. " +
    "Полезен для расчётов, сравнения значений и анализа изменений.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "number",
      required: true,
      description: "Уменьшаемое значение (левый операнд)"
    },
    {
      name: "b",
      type: "number",
      required: true,
      description: "Вычитаемое значение (правый операнд)"
    },
    {
      name: "abs",
      type: "boolean",
      required: false,
      description: "Если true — возвращает абсолютное значение разницы (без знака)"
    }
  ];

  async run(input: { a: number; b: number; abs?: boolean }): Promise<string> {
    const { a, b, abs } = input;

    if (typeof a !== "number" || typeof b !== "number") {
      return "❌ Оба значения должны быть числами (a и b)";
    }

    const result = abs ? Math.abs(a - b) : a - b;

    return result.toString();
  }
}