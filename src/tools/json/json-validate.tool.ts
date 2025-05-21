import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonValidateTool implements Tool {
  name = "json_validate";

  description = "Проверяет, является ли строка валидным JSON. Полезно для быстрой валидации данных перед их обработкой.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Строка, которая должна содержать JSON-данные. Будет проверена на корректность синтаксиса."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    try {
      JSON.parse(input.text);
      return "✅ Строка — корректный JSON";
    } catch (err: any) {
      return `❌ Ошибка: ${err.message}`;
    }
  }
}