import { Tool, ToolInputSpecField } from "../tool.interface";

export class OrTool implements Tool {
  name = "or";

  description = "Выполняет логическую операцию ИЛИ (OR) между двумя булевыми значениями. Возвращает `true`, если хотя бы одно из значений истинно.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "boolean",
      required: true,
      description: "Первый логический операнд."
    },
    {
      name: "b",
      type: "boolean",
      required: true,
      description: "Второй логический операнд."
    }
  ];

  async run(input: { a: boolean; b: boolean }): Promise<string> {
    return input.a || input.b ? "true" : "false";
  }
}