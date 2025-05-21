import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextKeywordsTool implements Tool {
  name = "text_keywords";

  description =
    "Анализирует текст и извлекает ключевые слова, используя частотный анализ. " +
    "Игнорирует часто встречающиеся служебные слова (стоп-слова). " +
    "Полезно для выделения тематики текста или составления тэгов.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст для анализа. Например: описание товара, статья, отзыв и т.д."
    }
  ];

  private stopWords = new Set([
    "и", "в", "во", "на", "с", "со", "за", "под", "по", "о", "об", "от",
    "а", "но", "или", "да", "что", "это", "как", "у", "к", "из", "для",
    "не", "мы", "вы", "он", "она", "они", "его", "ее", "их", "бы", "же", "быть"
  ]);

  async run(input: { text: string }): Promise<string> {
    const words = input.text
      .toLowerCase()
      .replace(/[.,!?;:()\[\]{}"']/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    const frequencyMap: Record<string, number> = {};
    for (const word of words) {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }

    const topWords = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => `${word} (${count})`)
      .join(", ");

    return topWords
      ? `🔑 Ключевые слова: ${topWords}`
      : "❌ Не удалось извлечь ключевые слова.";
  }
}