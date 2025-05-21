import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberCompareTool implements Tool {
  name = "number_compare";

  description =
      "Сравнивает два числовых значения и возвращает, какое из них больше, меньше или равны. " +
      "Полезно для логических условий, проверок, выбора ветки выполнения.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "number",
      required: true,
      description: "Первое число для сравнения"
    },
    {
      name: "b",
      type: "number",
      required: true,
      description: "Второе число для сравнения"
    }
  ];

  async run(input: { a: number; b: number }): Promise<string> {
    const { a, b } = input;

    if (typeof a !== "number" || typeof b !== "number") {
      return "❌ Оба значения должны быть числами";
    }

    if (a > b) return `⚖️ ${a} больше, чем ${b}`;
    if (a < b) return `⚖️ ${a} меньше, чем ${b}`;
    return `⚖️ ${a} равно ${b}`;
  }
}