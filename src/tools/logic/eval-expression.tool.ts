import { Tool, ToolInputSpecField } from "../tool.interface";
import { evaluate } from "mathjs";

export class EvalExpressionTool implements Tool {
  name = "eval_expression";

  description = "Вычисляет математическое или логическое выражение. Поддерживаются операции сложения, вычитания, умножения, деления, скобки, а также логические выражения и функции mathjs. Примеры: `2 + 2`, `(5 * 3) / (2 + 1)`, `10 > 3 && 4 < 5`.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "expression",
      type: "string",
      required: true,
      description: "Строка с математическим или логическим выражением для вычисления. Пример: \"2 + 2 * (3 - 1)\""
    }
  ];

  async run(input: { expression: string }): Promise<string> {
    const { expression } = input;

    if (!expression || typeof expression !== "string") {
      return "❌ Укажи выражение для вычисления";
    }

    try {
      const result = evaluate(expression);
      return `✅ Результат: ${result}`;
    } catch (error: any) {
      return `❌ Ошибка в выражении: ${error.message}`;
    }
  }
}