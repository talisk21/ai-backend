import { Tool, ToolInputSpecField } from "../tool.interface";

export class AndTool implements Tool {
  name = "and";

  description = "Выполняет логическую операцию И (AND) между двумя булевыми значениями. Возвращает true, только если оба значения истинны.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "a",
      type: "boolean",
      required: true,
      description: "Первый булевый операнд."
    },
    {
      name: "b",
      type: "boolean",
      required: true,
      description: "Второй булевый операнд."
    }
  ];

  async run(input: { a: boolean; b: boolean }): Promise<string> {
    return input.a && input.b ? "true" : "false";
  }
}