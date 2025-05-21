import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class ModelRegistryService {
  private readonly logger = new Logger(ModelRegistryService.name);
  private modelsCache: any[] = [];
  private lastFetchTime: number = 0;
  private readonly cacheTtl = 1000 * 60 * 10; // 10 минут

  async getAvailableModels(): Promise<any[]> {
    const now = Date.now();
    if (this.modelsCache.length > 0 && now - this.lastFetchTime < this.cacheTtl) {
      return this.modelsCache;
    }

    try {
      const response = await axios.get("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        }
      });

      this.modelsCache = response.data || [];
      this.lastFetchTime = now;
      return this.modelsCache;
    } catch (error) {
      this.logger.log("Ошибка при получении моделей OpenRouter", error);
      throw new Error("Failed to fetch models from OpenRouter");
    }
  }

  async getModelById(id: string): Promise<any | undefined> {
    const models = await this.getAvailableModels();
    return models.find((m) => m.id === id);
  }
}