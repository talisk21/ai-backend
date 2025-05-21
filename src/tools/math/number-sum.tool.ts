import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberSumTool implements Tool {
  name = "number_sum";

  description =
    "Вычисляет сумму всех чисел в массиве. " +
    "Полезен для подсчёта итогов, агрегации данных или выполнения арифметических операций над множеством значений. " +
    "Пример: [5, 10, 15] → 30";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "values",
      type: "array",
      itemsType: "number",
      required: true,
      description: "Массив чисел, которые нужно сложить. Должен содержать хотя бы один элемент."
    }
  ];

  async run(input: { values: number[] }): Promise<string> {
    const { values } = input;

    if (!Array.isArray(values) || values.length === 0) {
      return "❌ Массив чисел пуст или невалиден";
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return `➕ Сумма чисел: ${sum}`;
  }
}