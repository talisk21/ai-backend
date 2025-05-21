import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberProductTool implements Tool {
  name = "number_product";

  description =
    "Умножает все числа в переданном массиве. " +
    "Полезен для вычисления произведений, расчёта итогов и других операций, где необходимо перемножить значения. " +
    "Например: [2, 3, 4] → 24";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "values",
      type: "array",
      itemsType: "number",
      required: true,
      description: "Массив чисел, которые нужно перемножить. Должен содержать хотя бы один элемент."
    }
  ];

  async run(input: { values: number[] }): Promise<string> {
    const { values } = input;

    if (!Array.isArray(values) || values.length === 0) {
      return "❌ Передайте непустой массив чисел";
    }

    const result = values.reduce((acc, val) => acc * val, 1);

    return result.toString();
  }
}