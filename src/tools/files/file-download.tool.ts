import { Tool, ToolInputSpecField } from "../tool.interface";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

export class FileDownloadTool implements Tool {
  name = "file_download";
  description = "Скачивает файл по указанному URL. Может вернуть путь к файлу или его содержимое в формате base64.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "url",
      type: "string",
      required: true,
      description: "Полный URL-адрес файла, который необходимо скачать (например, \"https://example.com/image.jpg\")."
    },
    {
      name: "asBase64",
      type: "boolean",
      required: false,
      description: "Если true — возвращает содержимое файла в формате base64. Если false или не указано — возвращает путь к сохранённому файлу."
    }
  ];

  async run(input: { url: string; asBase64?: boolean }): Promise<string> {
    const { url, asBase64 } = input;

    if (!url || typeof url !== "string") {
      return "❌ Укажи корректный URL";
    }

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      const buffer = Buffer.from(response.data);
      const ext = path.extname(url).split("?")[0] || ".bin";
      const filename = `download_${uuidv4()}${ext}`;
      const filepath = path.join("/tmp", filename); // или './tmp', если локально

      if (asBase64) {
        return buffer.toString("base64");
      }

      fs.writeFileSync(filepath, buffer);
      return `✅ Файл скачан и сохранён: ${filepath}`;
    } catch (error: any) {
      return `❌ Ошибка при скачивании: ${error.message}`;
    }
  }
}