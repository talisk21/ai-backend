import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonFlattenTool implements Tool {
  name = "json_flatten";

  description =
    "Преобразует вложенный JSON-объект в плоский объект с точечной нотацией ключей. Используется для упрощения структуры данных.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "data",
      type: "object",
      required: true,
      description: "Вложенный JSON-объект, который нужно привести к плоской структуре."
    }
  ];

  async run(input: { data: any }): Promise<any> {
    const result: any = {};

    function flatten(obj: any, prefix = "") {
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          flatten(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    }

    flatten(input.data);
    return result;
  }
}