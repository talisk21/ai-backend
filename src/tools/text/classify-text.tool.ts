import { Tool, ToolInputSpecField } from "../tool.interface";

export class ClassifyTextTool implements Tool {
  name = "classify_text";

  description =
    "Выполняет простую классификацию текста на основе вхождения ключевых слов. " +
    "Полезно для категоризации обращений, сообщений или заданий по заданному словарю. " +
    "Например, можно отнести текст к метке \"оплата\", если он содержит слова: \"карта\", \"счёт\", \"платёж\".";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, который нужно классифицировать. Может быть сообщение, фраза или описание."
    },
    {
      name: "labels",
      type: "object",
      required: true,
      description: "Объект, где ключи — названия категорий, а значения — массив ключевых слов. Например: { \"оплата\": [\"карта\", \"счёт\"], \"техподдержка\": [\"ошибка\", \"не работает\"] }"
    }
  ];

  async run(input: { text: string; labels: Record<string, string[]> }): Promise<string> {
    const { text, labels } = input;

    if (!text || typeof text !== "string" || !labels || typeof labels !== "object") {
      return "❌ Укажи текст и список меток с ключевыми словами";
    }

    const lowerText = text.toLowerCase();
    const matched: string[] = [];

    for (const label of Object.keys(labels)) {
      const keywords = labels[label];
      if (keywords.some(word => lowerText.includes(word.toLowerCase()))) {
        matched.push(label);
      }
    }

    return matched.length > 0
      ? `🏷️ Найдены категории: ${matched.join(", ")}`
      : "🔍 Категории не найдены";
  }
}