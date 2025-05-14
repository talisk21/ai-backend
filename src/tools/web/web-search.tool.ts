import { Tool } from '../tool.interface';

export class WebSearchTool implements Tool {
  name = 'web_search';

  async run(args: any): Promise<string> {
    const query = typeof args === 'string' ? args : args?.query;
    if (!query) return '❌ Не указан поисковый запрос';

    // Здесь пока просто симуляция
    return `🔍 Результаты поиска по запросу: "${query}" (заглушка)`;
  }
}