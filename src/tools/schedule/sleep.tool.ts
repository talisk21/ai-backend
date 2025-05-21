import { Tool, ToolInputSpecField } from "../tool.interface";

export class SleepTool implements Tool {
  name = "sleep";

  description =
      "Приостанавливает выполнение на заданное количество времени. " +
      "Можно указать задержку в миллисекундах (`ms`) или в секундах (`seconds`). " +
      "Полезно для создания пауз между действиями или имитации задержек.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "ms",
      type: "number",
      required: false,
      description: "Время задержки в миллисекундах. Приоритет выше, чем у `seconds`."
    },
    {
      name: "seconds",
      type: "number",
      required: false,
      description: "Время задержки в секундах. Используется, если не указан `ms`."
    }
  ];

  async run(input: { ms?: number; seconds?: number }): Promise<string> {
    const delay = input.ms ?? (input.seconds ?? 0) * 1000;

    if (isNaN(delay) || delay <= 0) {
      return "❌ Укажи положительное время задержки (ms или seconds)";
    }

    await new Promise((res) => setTimeout(res, delay));

    return `⏱️ Пауза ${delay} мс завершена`;
  }
}