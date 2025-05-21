import { Tool, ToolInputSpecField } from "../tool.interface";
import { removeStopwords } from "stopword";

export class ExtractKeywordsTool implements Tool {
  name = "extract_keywords";

  description =
    "Извлекает наиболее частотные значимые слова из текста. " +
    "Удаляет стоп-слова и неинформативные части речи, затем возвращает топ-N ключевых слов. " +
    "Полезно для аннотаций, индексации, поиска и анализа содержания.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Исходный текст, из которого нужно извлечь ключевые слова."
    },
    {
      name: "top",
      type: "number",
      required: false,
      description: "Количество ключевых слов, которые нужно вернуть (по умолчанию: 10)."
    }
  ];

  async run(input: { text: string; top?: number }): Promise<string> {
    const { text, top = 10 } = input;

    if (!text || typeof text !== "string") {
      return "❌ Укажи текст";
    }

    const words = text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, "")
      .split(/\s+/)
      .filter(w => w.length > 2);

    const filtered = removeStopwords(words);

    const freq: Record<string, number> = {};
    for (const word of filtered) {
      freq[word] = (freq[word] || 0) + 1;
    }

    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([word]) => word);

    return keywords.length
      ? `🔑 Ключевые слова: ${keywords.join(", ")}`
      : "📭 Ключевые слова не найдены.";
  }
}