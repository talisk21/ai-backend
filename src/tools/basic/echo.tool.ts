import { Tool, ToolInputSpecField } from "../tool.interface";

export class EchoTool implements Tool {
  name = "echo";
  description = "Возвращает тот же текст, что был передан. Полезно для отладки, демонстрации или сохранения пользовательского ввода.\n" +
    "Когда использовать:\n" +
    "Если задача — просто отразить текст пользователя без изменений (например: “Повтори за мной”).";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, который необходимо вернуть без изменений."
    }
  ];

  async run(args: { text: string }): Promise<string> {
    return args.text;
  }
}