import { Tool } from '../tool.interface';

export class NumberDivideTool implements Tool {
  name = 'number_divide';
  description = 'Делит число a на b. Можно вернуть остаток.';

  async run(input: { a: number; b: number; returnRemainder?: boolean }): Promise<string> {
    const { a, b, returnRemainder } = input;

    if (typeof a !== 'number' || typeof b !== 'number') {
      return '❌ Значения "a" и "b" должны быть числами';
    }

    if (b === 0) {
      return '❌ Деление на ноль невозможно';
    }

    const result = a / b;
    const remainder = a % b;

    if (returnRemainder) {
      return `Результат: ${result}, Остаток: ${remainder}`;
    }

    return result.toString();
  }
}