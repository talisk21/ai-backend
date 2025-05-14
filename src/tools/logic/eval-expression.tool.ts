import { Tool } from '../tool.interface';
import { evaluate } from 'mathjs';

export class EvalExpressionTool implements Tool {
  name = 'eval_expression';
  description = 'Выполняет математическое или логическое выражение (например, 2 + 2 * 3).';

  async run(input: { expression: string }): Promise<string> {
    const { expression } = input;

    if (!expression || typeof expression !== 'string') {
      return '❌ Укажи выражение для вычисления';
    }

    try {
      const result = evaluate(expression);
      return `✅ Результат: ${result}`;
    } catch (error: any) {
      return `❌ Ошибка в выражении: ${error.message}`;
    }
  }
}