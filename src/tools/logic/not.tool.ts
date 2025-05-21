import { Tool, ToolInputSpecField } from "../tool.interface";

export class NotTool implements Tool {
  name = "not";

  description = "Инвертирует логическое значение. Если `value` равно `true`, возвращает `false`, и наоборот. Полезно для построения условий с отрицанием.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "value",
      type: "boolean",
      required: true,
      description: "Логическое значение, которое нужно инвертировать."
    }
  ];

  async run(input: { value: boolean }): Promise<string> {
    return input.value ? "false" : "true";
  }
}