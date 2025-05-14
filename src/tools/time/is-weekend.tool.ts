import { Tool } from '../tool.interface';

export class IsWeekendTool implements Tool {
  name = 'is_weekend';
  description = 'Проверяет, является ли указанная дата выходным (суббота или воскресенье)';

  async run(input: { date: string }): Promise<string> {
    const date = new Date(input.date);

    if (isNaN(date.getTime())) {
      return '❌ Неверный формат даты. Используй YYYY-MM-DD';
    }

    const day = date.getDay();
    return day === 0 || day === 6
      ? '✅ Это выходной'
      : '❌ Это рабочий день';
  }
}