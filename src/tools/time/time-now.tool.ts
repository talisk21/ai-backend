import { Tool } from '../tool.interface';

export class TimeNowTool implements Tool {
  name = 'time_now';
  description = 'Возвращает текущее время в заданной временной зоне (например: Europe/Moscow)';

  async run(input: { timezone: string }): Promise<string> {
    try {
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        timeZone: input.timezone,
        dateStyle: 'full',
        timeStyle: 'long',
      });

      return `🕒 Сейчас в ${input.timezone}: ${formatter.format(new Date())}`;
    } catch {
      return '❌ Ошибка: Указана неверная временная зона';
    }
  }
}