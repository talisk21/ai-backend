import { Tool, ToolInputSpecField } from "../tool.interface";

export class IfConditionTool implements Tool {
  name = "if_condition";

  description = "Проверяет логическое условие и возвращает одно из двух значений. Если `condition` равно `true`, возвращается `ifTrue`, иначе — `ifFalse`. Используется для построения условной логики в сценариях.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "condition",
      type: "boolean",
      required: true,
      description: "Логическое значение условия (true или false)."
    },
    {
      name: "ifTrue",
      type: "string",
      required: false,
      description: "Результат, если условие истинно (по умолчанию: \"true\")."
    },
    {
      name: "ifFalse",
      type: "string",
      required: false,
      description: "Результат, если условие ложно (по умолчанию: \"false\")."
    }
  ];

  async run(input: {
    condition: boolean;
    ifTrue?: string;
    ifFalse?: string;
  }): Promise<string> {
    const { condition, ifTrue = "true", ifFalse = "false" } = input;

    return condition ? ifTrue : ifFalse;
  }
}