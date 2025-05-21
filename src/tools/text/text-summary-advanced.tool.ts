import { Tool, ToolInputSpecField } from "../tool.interface";

export class TextSummaryAdvancedTool implements Tool {
  name = "text_summary_advanced";

  description =
    "Создаёт содержательное резюме текста, выделяя наиболее информативные предложения " +
    "на основе частоты ключевых слов. Полезно для анализа длинных текстов, статей или сообщений. " +
    "Позволяет задать максимальное количество предложений в итоговом резюме.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Исходный текст, из которого нужно построить сжатое резюме."
    },
    {
      name: "maxSentences",
      type: "number",
      required: false,
      description: "Максимальное количество предложений в итоговом резюме (по умолчанию — 3)."
    }
  ];

  async run(input: { text: string; maxSentences?: number }): Promise<string> {
    const { text, maxSentences = 3 } = input;

    if (!text || typeof text !== "string") {
      return "❌ Укажи текст для суммирования";
    }

    const sentences = text
      .split(/[.?!]\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length <= maxSentences) {
      return `ℹ️ В тексте слишком мало предложений, возвращаю как есть:\n\n${text}`;
    }

    const scores = new Map<string, number>();
    const wordFreq: Record<string, number> = {};

    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      for (const word of words) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    for (const sentence of sentences) {
      let score = 0;
      const words = sentence.toLowerCase().split(/\W+/);
      for (const word of words) {
        if (wordFreq[word]) score += wordFreq[word];
      }
      scores.set(sentence, score);
    }

    const sorted = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxSentences)
      .map(([sentence]) => sentence);

    return `📄 Сводка:\n\n${sorted.join(". ")}.`;
  }
}