import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberDivideTool implements Tool {
  name = "number_divide";

  description =
    "Делит одно число на другое (a / b). " +
    "Позволяет дополнительно вернуть остаток от деления, если параметр `returnRemainder` установлен в true. " +
    "Полезно для арифметических операций, анализа делимости и расчёта частных значений.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "number",
      required: true,
      description: "Делимое (число, которое делим)"
    },
    {
      name: "b",
      type: "number",
      required: true,
      description: "Делитель (число, на которое делим)"
    },
    {
      name: "returnRemainder",
      type: "boolean",
      required: false,
      description: "Если true — дополнительно возвращает остаток от деления"
    }
  ];

  async run(input: { a: number; b: number; returnRemainder?: boolean }): Promise<string> {
    const { a, b, returnRemainder } = input;

    if (typeof a !== "number" || typeof b !== "number") {
      return "❌ Значения \"a\" и \"b\" должны быть числами";
    }

    if (b === 0) {
      return "❌ Деление на ноль невозможно";
    }

    const result = a / b;
    const remainder = a % b;

    if (returnRemainder) {
      return `📊 Результат: ${result}, Остаток: ${remainder}`;
    }

    return result.toString();
  }
}