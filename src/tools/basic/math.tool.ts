import { Tool } from '../tool.interface';
import { evaluate } from 'mathjs';

export class MathTool implements Tool {
  name = 'math';

  async run(args: any): Promise<string> {
    const expr = args?.expr || args;
    if (!expr) return '❌ Выражение не указано';

    try {
      const result = evaluate(expr);
      return `Результат: ${result}`;
    } catch (e: any) {
      return `❌ Ошибка вычисления: ${e.message}`;
    }
  }
}