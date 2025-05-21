import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonKeysTool implements Tool {
  name = "json_keys";

  description =
    "Возвращает список всех ключей верхнего уровня переданного JSON-объекта. Полезно для анализа структуры данных.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "json",
      type: "object",
      required: true,
      description: "JSON-объект, из которого необходимо извлечь ключи верхнего уровня."
    }
  ];

  async run(input: { json: object }): Promise<string> {
    if (!input.json || typeof input.json !== "object") {
      return "❌ Неверный JSON";
    }

    const keys = Object.keys(input.json);
    return keys.length
      ? `🔑 Ключи: ${keys.join(", ")}`
      : "📭 Объект пуст";
  }
}