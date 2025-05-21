import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextSentimentTool implements Tool {
  name = "text_sentiment";

  description =
    "Выполняет базовый анализ тональности текста: определяет, является ли он позитивным, негативным или нейтральным. " +
    "Оценивает наличие ключевых слов из списков позитивной и негативной лексики. " +
    "Полезен для предварительного анализа отзывов, комментариев и пользовательской обратной связи.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, который необходимо проанализировать. Например: отзыв, сообщение или комментарий."
    }
  ];

  private positiveWords = ["отлично", "хорошо", "супер", "круто", "счастлив", "нравится", "прекрасно"];
  private negativeWords = ["плохо", "ужасно", "ненавижу", "грусть", "разочарован", "печально"];

  async run(input: { text: string }): Promise<string> {
    const text = input.text.toLowerCase();

    const positives = this.positiveWords.filter(w => text.includes(w)).length;
    const negatives = this.negativeWords.filter(w => text.includes(w)).length;

    if (positives > negatives) return "😊 Позитивный текст";
    if (negatives > positives) return "☹️ Негативный текст";
    return "😐 Нейтральный текст";
  }
}