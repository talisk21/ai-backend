import { Tool, ToolInputSpecField } from "../tool.interface";

export class MathTool implements Tool {
  name = "math";
  description = "Выполняет математическое выражение из строки, включая сложение, вычитание, умножение и деление.\n" +
    "Когда использовать:\n" +
    "Когда пользователь просит рассчитать выражение (например: \"2 + 3 * (5 - 1)\"), посчитать сумму, разницу, результат формулы и т.д.\"";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "expression",
      type: "string",
      required: true,
      description: "Математическое выражение в виде строки. Допустимые символы: числа, +, -, *, /, скобки."
    }
  ];

  async run(input: { expression: string }): Promise<string> {
    const expr = input.expression;

    console.log("expr ", expr);

    if (!expr || typeof expr !== "string") {
      return "❌ Укажи выражение (expression) в виде строки";
    }

    // Проверка: только допустимые символы
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(expr)) {
      return "❌ Выражение содержит недопустимые символы";
    }

    try {
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      return `📐 Результат: ${result}`;
    } catch (e) {
      return "❌ Не удалось вычислить выражение";
    }
  }
}