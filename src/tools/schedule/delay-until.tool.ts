import { Tool, ToolInputSpecField } from "../tool.interface";

export class DelayUntilTool implements Tool {
  name = "delay_until";

  description =
    "Приостанавливает выполнение до указанной даты и времени. " +
    "Полезно для отложенного запуска шагов, автоматизации сценариев и точного планирования. " +
    "Использует стандартный ISO 8601 формат времени, например: \"2025-05-14T12:00:00Z\".";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "isoDateTime",
      type: "string",
      required: true,
      description: "Дата и время в формате ISO 8601. Пример: \"2025-05-14T12:00:00Z\""
    }
  ];

  async run(input: { isoDateTime: string }): Promise<string> {
    const target = new Date(input.isoDateTime);
    const now = new Date();

    if (isNaN(target.getTime())) {
      return "❌ Неверный формат даты. Используй ISO-строку, например: \"2025-05-14T12:00:00Z\"";
    }

    const delay = target.getTime() - now.getTime();

    if (delay <= 0) {
      return "⏱️ Указанное время уже прошло. Продолжаем выполнение без задержки.";
    }

    await new Promise((res) => setTimeout(res, delay));

    return `✅ Выполнение продолжено в заданное время (${target.toISOString()})`;
  }
}