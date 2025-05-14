import { Tool } from '../tool.interface';
import * as fs from 'fs';
import * as path from 'path';

export class FileReadTool implements Tool {
  name = 'file_read';
  description = 'Читает текстовый файл и возвращает его содержимое.';

  async run(input: { path: string }): Promise<string> {
    const { path: filePath } = input;

    if (!filePath || typeof filePath !== 'string') {
      return '❌ Укажи путь к файлу';
    }

    const resolvedPath = path.resolve(filePath);

    try {
      const data = fs.readFileSync(resolvedPath, 'utf-8');
      return data.slice(0, 2000) || '📭 Файл пуст';
    } catch (error: any) {
      return `❌ Ошибка при чтении файла: ${error.message}`;
    }
  }
}