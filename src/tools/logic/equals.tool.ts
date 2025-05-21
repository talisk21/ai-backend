import { Tool, ToolInputSpecField } from "../tool.interface";

export class EqualsTool implements Tool {
  name = "equals";

  description = "Сравнивает два значения на строгое равенство (===). Возвращает \"true\", если значения и их типы совпадают, иначе — \"false\".";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "number",
      required: true,
      description: "Первое значение для сравнения."
    },
    {
      name: "b",
      type: "number",
      required: true,
      description: "Второе значение для сравнения."
    }
  ];

  async run(input: { a: any; b: any }): Promise<string> {
    const { a, b } = input;
    return a === b ? "true" : "false";
  }
}