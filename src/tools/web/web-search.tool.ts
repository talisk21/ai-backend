import { Tool, ToolInputSpecField } from "../tool.interface";

export class WebSearchTool implements Tool {
  name = "web_search";

  description =
    "Выполняет интернет-поиск по заданному запросу. " +
    "Используется для получения актуальной информации, фактов, новостей или другой информации, недоступной локально. " +
    "Может быть полезен, когда LLM не знает ответа или требуется достоверная справка из внешнего источника.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "query",
      type: "string",
      required: true,
      description: "Поисковый запрос, который нужно выполнить (например: \"погода в Москве\", \"новости OpenAI\")."
    }
  ];

  async run(input: { query: string }): Promise<string> {
    const { query } = input;

    if (!query || typeof query !== "string") {
      return "❌ Не указан поисковый запрос";
    }

    // Пока заглушка
    return `🔍 Результаты поиска по запросу: "${query}" (заглушка)`;
  }
}