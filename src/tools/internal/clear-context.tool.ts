import { Tool } from './tool.interface';

export class ClearContextTool implements Tool {
  name = 'clear_context';

  async run(): Promise<string> {
    // Здесь могла бы быть очистка истории в БД
    return '🧹 Контекст сброшен (символически)';
  }
}