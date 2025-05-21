import { Tool, ToolInputSpecField } from "../tool.interface";

export class IsWeekendTool implements Tool {
  name = "is_weekend";

  description =
    "Определяет, является ли указанная дата выходным днём (субботой или воскресеньем). " +
    "Полезно для построения календарей, логики расписаний, фильтрации по рабочим/выходным дням.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "date",
      type: "string",
      required: true,
      description: "Дата в формате YYYY-MM-DD. Пример: \"2025-05-17\"."
    }
  ];

  async run(input: { date: string }): Promise<string> {
    const date = new Date(input.date);

    if (isNaN(date.getTime())) {
      return "❌ Неверный формат даты. Используй YYYY-MM-DD";
    }

    const day = date.getDay();
    return day === 0 || day === 6
      ? "✅ Это выходной"
      : "❌ Это рабочий день";
  }
}