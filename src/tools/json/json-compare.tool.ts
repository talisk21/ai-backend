import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonCompareTool implements Tool {
  name = "json_compare";
  description = "Сравнивает два JSON-объекта и возвращает список отличающихся ключей. Показывает, какие поля присутствуют только в одном из объектов, а также поля с различиями.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "object",
      required: true,
      description: "Первый JSON-объект для сравнения."
    },
    {
      name: "b",
      type: "object",
      required: true,
      description: "Второй JSON-объект для сравнения."
    }
  ];

  async run(input: { a: any; b: any }): Promise<string> {
    const diff: string[] = [];

    function compare(obj1: any, obj2: any, path = "") {
      for (const key in obj1) {
        const fullPath = path ? `${path}.${key}` : key;
        if (!(key in obj2)) {
          diff.push(`🟥 Только в A: ${fullPath}`);
        } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          diff.push(`⚠️ Отличие: ${fullPath}`);
        }
      }

      for (const key in obj2) {
        const fullPath = path ? `${path}.${key}` : key;
        if (!(key in obj1)) {
          diff.push(`🟦 Только в B: ${fullPath}`);
        }
      }
    }

    compare(input.a, input.b);

    return diff.length ? diff.join("\n") : "✅ Объекты идентичны";
  }
}