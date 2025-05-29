import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from '@services';
import axios from 'axios';

@Injectable()
export class ModelRegistryService {
  private readonly context = ModelRegistryService.name;
  private readonly logger = new Logger(this.context);

  private modelsCache: any[] = [];
  private lastFetchTime = 0;
  private readonly cacheTtl = 1000 * 60 * 10; // 10 минут

  constructor(
    private readonly config: ConfigService,
    private readonly log: Services.LogService,
  ) {}

  async getAvailableModels(): Promise<any[]> {
    const now = Date.now();

    // 📑 Кэш актуален?
    if (
      this.modelsCache.length > 0 &&
      now - this.lastFetchTime < this.cacheTtl
    ) {
      const cacheHitMsg = `📥 Возвращаем модели из кэша (${this.modelsCache.length} шт.)`;
      this.logger.log(cacheHitMsg, this.context);
      void this.log.info(cacheHitMsg, this.context, {
        cacheTtl: this.cacheTtl,
      });
      return this.modelsCache;
    }

    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      const errMsg = '❌ OPENROUTER_API_KEY не задан в .env';
      this.logger.error(errMsg, undefined, this.context);
      void this.log.error(errMsg, this.context);
      throw new Error(errMsg);
    }

    try {
      const fetchMsg = '🌐 Запрос доступных моделей у OpenRouter';
      this.logger.log(fetchMsg, this.context);
      void this.log.info(fetchMsg, this.context);

      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      this.modelsCache = response.data || [];
      this.lastFetchTime = now;

      const successMsg = `✅ Получено моделей: ${this.modelsCache.length}`;
      this.logger.log(successMsg, this.context);
      void this.log.info(successMsg, this.context, {
        count: this.modelsCache.length,
      });

      return this.modelsCache;
    } catch (error: any) {
      const errMsg = `❌ Ошибка при получении моделей OpenRouter: ${error.message}`;
      this.logger.error(errMsg, error.stack, this.context);
      void this.log.error(errMsg, this.context);
      throw new Error('Failed to fetch models from OpenRouter');
    }
  }

  async getModelById(id: string): Promise<any | undefined> {
    const msg = `🔍 Ищем модель по id="${id}"`;
    this.logger.log(msg, this.context);
    void this.log.info(msg, this.context, { id });

    const models = await this.getAvailableModels();
    const model = models.find((m) => m.id === id);

    if (model) {
      const foundMsg = `✅ Модель найдена: ${id}`;
      this.logger.log(foundMsg, this.context);
      void this.log.info(foundMsg, this.context, { id });
    } else {
      const notFoundMsg = `⚠️ Модель с id="${id}" не найдена`;
      this.logger.log(notFoundMsg, this.context);
      void this.log.info(notFoundMsg, this.context, { id });
    }

    return model;
  }
}
