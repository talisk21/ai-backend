import { Tool } from '../tool.interface';

export class TimeDeltaTool implements Tool {
  name = 'time_delta';
  description = 'Вычисляет количество дней между двумя датами в формате YYYY-MM-DD';

  async run(input: { from: string; to: string }): Promise<string> {
    const fromDate = new Date(input.from);
    const toDate = new Date(input.to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return '❌ Неверный формат даты. Используй YYYY-MM-DD';
    }

    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `📅 Между датами ${diffDays} дней`;
  }
}