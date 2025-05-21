import { Tool, ToolInputSpecField } from "../tool.interface";

export class DetectLanguageTool implements Tool {
  name = "detect_language";

  description =
    "Определяет язык заданного текста с помощью библиотеки franc. " +
    "Возвращает трёхбуквенный ISO 639-3 код языка (например: rus, eng, fra). " +
    "Подходит для предварительной обработки текста, маршрутизации сообщений, мультиязычных приложений и пр.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "text",
      type: "string",
      required: true,
      description: "Текст, язык которого нужно определить. Может быть предложение, фраза или абзац."
    }
  ];

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== "string") {
      return "❌ Укажи текст";
    }

    const francModule = await import("franc");
    const detectLanguage = francModule.default as unknown as (text: string) => string;

    const lang = detectLanguage(text);

    if (lang === "und") {
      return "⚠️ Язык не определён";
    }

    return `🌐 Язык текста: ${lang}`;
  }
}