import { Tool, ToolInputSpecField } from "../tool.interface";
import * as fs from "fs";
import * as path from "path";

export class FileToBase64Tool implements Tool {
  name = "file_to_base64";
  description = "Преобразует содержимое файла в строку base64 по указанному пути.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "path",
      type: "string",
      required: true,
      description: "Путь к файлу, который нужно закодировать в строку base64 (например, \"./uploads/image.png\")."
    }
  ];

  async run(input: { path: string }): Promise<string> {
    const { path: filePath } = input;

    if (!filePath || typeof filePath !== "string") {
      return "❌ Укажи путь к файлу";
    }

    const resolvedPath = path.resolve(filePath);

    try {
      const data = fs.readFileSync(resolvedPath);
      return data.toString("base64");
    } catch (error: any) {
      return `❌ Не удалось прочитать файл: ${error.message}`;
    }
  }
}