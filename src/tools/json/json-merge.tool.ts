import { Tool, ToolInputSpecField } from "../tool.interface";

export class JsonMergeTool implements Tool {
  name = "json_merge";

  description =
    "Объединяет два JSON-объекта в один. При совпадении ключей значения из второго объекта перезаписывают значения первого.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "object",
      required: true,
      description: "Первый JSON-объект. Его значения будут перезаписаны при совпадении ключей."
    },
    {
      name: "b",
      type: "object",
      required: true,
      description: "Второй JSON-объект. Его значения имеют приоритет при объединении."
    }
  ];

  async run(input: { a: object; b: object }): Promise<string> {
    try {
      const merged = { ...input.a, ...input.b };
      return `🧩 Объединённый JSON: ${JSON.stringify(merged, null, 2)}`;
    } catch (e) {
      return "❌ Ошибка при объединении объектов";
    }
  }
}