import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextTokenCountTool implements Tool {
  name = "text_token_count";

  description =
      "Оценивает примерное количество токенов в тексте. " +
      "Полезно для предварительной оценки объёма перед отправкой в LLM. " +
      "Используется приближённая формула: 1 слово ≈ 1.33 токена.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, для которого нужно посчитать приблизительное количество токенов."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Пожалуйста, укажи текст";
    }

    const words = text.trim().split(/\s+/).length;
    const approxTokens = Math.ceil(words * 1.33);

    return `🧮 Примерное количество токенов: ${approxTokens}`;
  }
}