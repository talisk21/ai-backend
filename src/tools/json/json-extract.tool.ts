import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonExtractTool implements Tool {
  name = "json_extract";

  description =
    "Извлекает значение из вложенного JSON-объекта по ключу или пути с точечной нотацией (например: user.name или order.items.0.id).";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "json",
      type: "object",
      required: true,
      description: "JSON-объект, из которого нужно извлечь данные."
    },
    {
      name: "path",
      type: "string",
      required: true,
      description: "Путь к значению через точку, например: user.name или order.items.0.name"
    }
  ];

  async run(input: { json: object; path: string }): Promise<string> {
    const { json, path } = input;

    if (!json || typeof path !== "string") {
      return "❌ Неверный ввод";
    }

    const keys = path.split(".");
    let result: any = json;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return `❌ Ключ '${key}' не найден`;
      }
    }

    return `📤 Значение: ${JSON.stringify(result)}`;
  }
}