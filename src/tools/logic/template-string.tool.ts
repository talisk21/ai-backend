import { Tool } from '../tool.interface';

export class TemplateStringTool implements Tool {
  name = 'template_string';
  description = 'Подставляет переменные в шаблон строки. Формат: {{имя}}';

  async run(input: { template: string; variables: Record<string, string> }): Promise<string> {
    const { template, variables } = input;

    if (!template || typeof template !== 'string') {
      return '❌ Укажи текст шаблона';
    }

    const result = template.replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
      return variables?.[key] ?? `{{${key}}}`;
    });

    return result;
  }
}