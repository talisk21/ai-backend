import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Services from '@services';
import axios from 'axios';

@Injectable()
export class ToolProxyService {
  private readonly logger = new Logger(ToolProxyService.name);
  private readonly jsBaseUrl: string;
  private readonly pyBaseUrl: string;
  private readonly context = 'ToolProxyService';

  constructor(
    private readonly config: ConfigService,
    private readonly log: Services.LogService,
  ) {
    const jsHost = this.config.get<string>('BACKEND_HOST');
    const jsPort = this.config.get<string>('JS_TOOLS_SERVICE_PORT');
    const pyHost = this.config.get<string>('BACKEND_HOST');
    const pyPort = this.config.get<string>('PY_TOOLS_SERVICE_PORT');

    this.jsBaseUrl = `http://${jsHost}:${jsPort}/tools`;
    this.pyBaseUrl = `http://${pyHost}:${pyPort}/tools`;
  }

  async getAllTools(): Promise<any[]> {
    const tools: any[] = [];

    // JS-инструменты
    try {
      const jsResponse = await axios.get(this.jsBaseUrl);
      tools.push(...(jsResponse.data || []));
    } catch (error) {
      const msg = `⚠️ Ошибка загрузки JS-инструментов: ${error.message}`;
      this.logger.warn(msg, this.context);
      void this.log.info(msg, this.context);
    }

    // Python-инструменты
    try {
      const pyResponse = await axios.get(this.pyBaseUrl);
      tools.push(...(pyResponse.data || []));
    } catch (error) {
      const msg = `⚠️ Ошибка загрузки Python-инструментов: ${error.message}`;
      this.logger.warn(msg, this.context);
      void this.log.info(msg, this.context);
    }

    return tools;
  }

  async getTool(name: string): Promise<any> {
    const sourceMap: Record<string, string> = {
      js: this.jsBaseUrl,
      py: this.pyBaseUrl,
      // future:
      // go: this.goBaseUrl,
      // rust: this.rustBaseUrl,
    };

    for (const [source, baseUrl] of Object.entries(sourceMap)) {
      try {
        const response = await axios.get(`${baseUrl}/${name}`);
        const tool = response.data;

        const msg = `🔍 Инструмент "${name}" найден в "${source}"`;
        this.logger.log(msg, this.context);
        void this.log.info(msg, this.context, { name, source });

        return { ...tool, source }; // ⬅️ Добавим метку source
      } catch {
        // Просто переходим к следующему
      }
    }

    const msg = `❌ Инструмент "${name}" не найден ни в одном источнике`;
    this.logger.warn(msg, this.context);
    void this.log.warn(msg, this.context, { name });

    throw new Error(msg);
  }

  async runTool(name: string, args: any, source?: string): Promise<any> {
    const sourceMap: Record<string, string> = {
      js: this.jsBaseUrl,
      py: this.pyBaseUrl,
      // future:
      // go: this.goBaseUrl,
      // rust: this.rustBaseUrl,
    };

    // 1️⃣ Если source явно передан
    if (source) {
      const baseUrl = sourceMap[source];
      if (!baseUrl) {
        const err = `❌ Неизвестный source "${source}" для инструмента "${name}"`;
        this.logger.error(err, this.context);
        void this.log.error(err, this.context, { name, source, args });
        throw new Error(err);
      }

      return this.runToolAtBaseUrl(name, args, baseUrl, source);
    }

    // 2️⃣ Иначе — ищем инструмент во всех источниках
    for (const [src, baseUrl] of Object.entries(sourceMap)) {
      try {
        const exists = await axios.get(`${baseUrl}/${name}`);
        if (exists.status === 200) {
          return this.runToolAtBaseUrl(name, args, baseUrl, src);
        }
      } catch {
        // не логируем — просто пробуем дальше
      }
    }

    const msg = `❌ Инструмент "${name}" не найден ни в одном источнике`;
    this.logger.warn(msg, this.context);
    void this.log.warn(msg, this.context, { name, args });
    throw new Error(msg);
  }

  private async runToolAtBaseUrl(
    name: string,
    args: any,
    baseUrl: string,
    source: string,
  ): Promise<any> {
    try {
      const response = await axios.post(`${baseUrl}/${name}/run`, { args });
      const result = response.data;

      const msg = `✅ Инструмент "${name}" успешно выполнен (source: ${source})`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { name, source, args });

      return result;
    } catch (error: any) {
      const err = `❌ Ошибка при выполнении инструмента "${name}" (source: ${source}): ${error.message}`;
      this.logger.error(err, this.context);
      void this.log.error(err, this.context, {
        name,
        source,
        args,
        stack: error.stack,
      });
      throw new Error(err);
    }
  }
}
