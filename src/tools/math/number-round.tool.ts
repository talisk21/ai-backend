import { Tool } from '../tool.interface';

export class NumberRoundTool implements Tool {
  name = 'number_round';
  description = 'Округляет число до заданного количества знаков после запятой.';

  async run(input: { value: number; digits?: number }): Promise<string> {
    const { value, digits = 0 } = input;

    if (typeof value !== 'number' || typeof digits !== 'number') {
      return '❌ Укажи число и количество знаков для округления';
    }

    const factor = Math.pow(10, digits);
    const rounded = Math.round(value * factor) / factor;

    return rounded.toString();
  }
}