import { Tool } from '../tool.interface';

export class SleepTool implements Tool {
  name = 'sleep';
  description = 'Приостанавливает выполнение на указанное количество миллисекунд.';

  async run(input: { ms?: number; seconds?: number }): Promise<string> {
    const delay = input.ms ?? (input.seconds ?? 0) * 1000;

    if (isNaN(delay) || delay <= 0) {
      return '❌ Укажи положительное время задержки (ms или seconds)';
    }

    await new Promise((res) => setTimeout(res, delay));

    return `⏱️ Пауза ${delay} мс завершена`;
  }
}