import { Tool } from '../tool.interface';

export class NumberProductTool implements Tool {
  name = 'number_product';
  description = 'Умножает все числа из массива.';

  async run(input: { values: number[] }): Promise<string> {
    const { values } = input;

    if (!Array.isArray(values) || values.length === 0) {
      return '❌ Передайте непустой массив чисел';
    }

    const result = values.reduce((acc, val) => acc * val, 1);

    return result.toString();
  }
}