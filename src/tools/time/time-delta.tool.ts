import { Tool, ToolInputSpecField } from "../tool.interface";
import { differenceInDays, isValid, parseISO } from "date-fns";

export class TimeDeltaTool implements Tool {
  name = "time_delta";

  description =
    "Вычисляет количество дней между двумя датами. " +
    "Используется для оценки временных интервалов, дедлайнов и планирования. " +
    "Формат даты должен быть YYYY-MM-DD. Например: от \"2025-01-01\" до \"2025-01-10\".";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "from",
      type: "string",
      required: true,
      description: "Начальная дата в формате YYYY-MM-DD. Например: \"2025-01-01\"."
    },
    {
      name: "to",
      type: "string",
      required: true,
      description: "Конечная дата в формате YYYY-MM-DD. Например: \"2025-01-10\"."
    }
  ];

  async run(input: { from: string; to: string }): Promise<string> {
    const fromDate = parseISO(input.from);
    const toDate = parseISO(input.to);

    if (!isValid(fromDate) || !isValid(toDate)) {
      return "❌ Неверный формат даты. Используй формат YYYY-MM-DD";
    }

    const days = Math.abs(differenceInDays(toDate, fromDate));
    return `📅 Между датами ${days} дней`;
  }
}