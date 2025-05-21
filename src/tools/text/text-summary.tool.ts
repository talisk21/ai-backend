import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextSummaryTool implements Tool {
  name = "text_summary";

  description =
    "Создаёт краткое резюме из длинного текста. " +
    "Выделяет первые несколько предложений в качестве сжатой выжимки основного содержания. " +
    "Полезен для быстрого обзора длинных сообщений, статей или описаний.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Длинный текст, из которого нужно составить краткое резюме (не менее 50 символов)."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || text.length < 50) {
      return "❌ Недостаточно текста для резюмирования";
    }

    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join(" ");

    return `📝 Резюме: ${summary}`;
  }
}