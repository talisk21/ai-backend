import { Tool } from '../tool.interface';

export class DelayUntilTool implements Tool {
  name = 'delay_until';
  description = 'Приостанавливает выполнение до указанной даты/времени (ISO-формат).';

  async run(input: { isoDateTime: string }): Promise<string> {
    const target = new Date(input.isoDateTime);
    const now = new Date();

    if (isNaN(target.getTime())) {
      return '❌ Неверный формат даты. Используй ISO-строку, например: "2025-05-14T12:00:00Z"';
    }

    const delay = target.getTime() - now.getTime();

    if (delay <= 0) {
      return '⏱️ Указанное время уже прошло. Продолжаем выполнение без задержки.';
    }

    await new Promise((res) => setTimeout(res, delay));

    return `✅ Выполнение продолжено в заданное время (${target.toISOString()})`;
  }
}