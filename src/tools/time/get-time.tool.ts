import { Tool, ToolInputSpecField } from "../tool.interface";
import { DateTime } from "luxon";

export class GetTimeTool implements Tool {
  name = "getTime";
  description = "Возвращает текущее время в заданной временной зоне в формате ISO (например, \"2025-05-16T18:00:00+03:00\").\n" +
    "Когда использовать:\n" +
    "Когда пользователь спрашивает текущее время, указывает город или таймзону. Если не указана, используется Europe/Moscow.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "timezone",
      type: "string",
      required: false,
      description: "Таймзона по базе IANA, например \"Europe/Moscow\", \"America/New_York\". Если не указана — используется Europe/Moscow."
    }
  ];

  async run(args: any): Promise<string> {
    const zone = args?.timezone || "Europe/Moscow";
    try {
      return DateTime.now().setZone(zone).toLocaleString(DateTime.DATETIME_FULL);
    } catch {
      return "❌ Неверная таймзона";
    }
  }
}