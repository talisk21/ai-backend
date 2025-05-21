import { Tool } from "../tool.interface";
import { v4 as uuidv4 } from "uuid";

export class UuidTool implements Tool {
  name = "uuid";
  description = "Генерирует уникальный идентификатор в формате UUID v4.\n" +
    "Когда использовать:\n" +
    "Когда пользователю нужно создать уникальный ID, например, для новых объектов, записей, сессий, файлов и т.п.";

  inputSpec = []; // инструмент не требует входных параметров

  async run(): Promise<string> {
    return uuidv4();
  }
}