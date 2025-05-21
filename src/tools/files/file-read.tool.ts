import { Tool, ToolInputSpecField } from "../tool.interface";
import * as fs from "fs";
import * as path from "path";
import { Buffer } from "buffer";

export class FileReadTool implements Tool {
  name = "file_read";
  description = "Читает содержимое файла по пути или из строки base64. Может вернуть текст или содержимое в формате base64.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "path",
      type: "string",
      required: false,
      description: "Путь к файлу в файловой системе. Может быть абсолютным или относительным (например, \"./data/info.txt\")."
    },
    {
      name: "base64",
      type: "string",
      required: false,
      description: "Base64-представление содержимого файла. Используется, если файл передаётся в виде строки."
    },
    {
      name: "asBase64",
      type: "boolean",
      required: false,
      description: "Если true — результат будет возвращён в формате base64. Если false — как обычный текст."
    }
  ];

  async run(input: { path?: string; base64?: string; asBase64?: boolean }): Promise<string> {
    const { path: filePath, base64, asBase64 } = input;

    let buffer: Buffer;

    // Определяем источник данных
    if (filePath) {
      const resolvedPath = path.resolve(filePath);

      try {
        buffer = fs.readFileSync(resolvedPath);
      } catch (error: any) {
        return `❌ Ошибка при чтении файла по пути: ${error.message}`;
      }
    } else if (base64) {
      try {
        buffer = Buffer.from(base64, "base64");
      } catch (error: any) {
        return `❌ Некорректная base64-строка: ${error.message}`;
      }
    } else {
      return "❌ Укажи либо путь к файлу (path), либо base64-строку (base64)";
    }

    // Возвращаем результат
    if (asBase64) {
      return buffer.toString("base64");
    }

    const text = buffer.toString("utf-8");
    return text.slice(0, 2000) || "📭 Файл пуст";
  }
}