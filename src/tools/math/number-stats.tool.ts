import { Tool } from '../tool.interface';

export class NumberStatsTool implements Tool {
  name = 'number_stats';
  description = 'Вычисляет статистику по числам: минимум, максимум, среднее.';

  async run(input: { values: number[] }): Promise<string> {
    const { values } = input;

    if (!Array.isArray(values) || values.length === 0) {
      return '❌ Массив чисел пуст или невалиден';
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, val) => acc + val, 0) / values.length;

    return `📊 Статистика:\n🔻 Мин: ${min}\n🔺 Макс: ${max}\n📈 Среднее: ${avg.toFixed(2)}`;
  }
}