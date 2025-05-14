import { Tool } from '../tool.interface';

export class NumberSumTool implements Tool {
  name = 'number_sum';
  description = 'Считает сумму всех чисел в массиве.';

  async run(input: { values: number[] }): Promise<string> {
    const { values } = input;

    if (!Array.isArray(values) || values.length === 0) {
      return '❌ Массив чисел пуст или невалиден';
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return `➕ Сумма чисел: ${sum}`;
  }
}