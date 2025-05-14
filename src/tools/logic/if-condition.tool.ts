import { Tool } from '../tool.interface';

export class IfConditionTool implements Tool {
  name = 'if_condition';
  description = 'Выполняет логическую проверку: если условие истинно, возвращает одно значение, иначе — другое.';

  async run(input: {
    condition: boolean;
    ifTrue?: string;
    ifFalse?: string;
  }): Promise<string> {
    const { condition, ifTrue = 'true', ifFalse = 'false' } = input;

    return condition ? ifTrue : ifFalse;
  }
}