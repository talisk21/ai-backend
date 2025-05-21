import { Tool, ToolInputSpecField } from "../tool.interface";

export class TemplateStringTool implements Tool {
  name = "template_string";

  description =
    "Подставляет значения переменных в шаблон строки. Использует формат `{{имя}}` для вставки. " +
    "Если переменная отсутствует в объекте `variables`, она остаётся в исходном виде.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "template",
      type: "string",
      required: true,
      description: "Строка с плейсхолдерами вида {{имя}}, например: \"Привет, {{name}}!\""
    },
    {
      name: "variables",
      type: "object",
      required: true,
      description: "Объект с переменными для подстановки. Пример: { \"name\": \"Игорь\" }"
    }
  ];

  async run(input: { template: string; variables: Record<string, string> }): Promise<string> {
    const { template, variables } = input;

    if (!template || typeof template !== "string") {
      return "❌ Укажи текст шаблона";
    }

    const result = template.replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
      return variables?.[key] ?? `{{${key}}}`;
    });

    return result;
  }
}