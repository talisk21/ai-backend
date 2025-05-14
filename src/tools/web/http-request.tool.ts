import { Tool } from '../tool.interface';
import axios from 'axios';

export class HttpRequestTool implements Tool {
  name = 'http_request';
  description = 'Универсальный HTTP-запрос с методом, заголовками и телом.';

  async run(input: {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    auth?: { username: string; password: string };
    timeout?: number;
    responseType?: 'json' | 'text' | 'arraybuffer';
  }): Promise<string> {
    const {
      method = 'GET',
      url,
      headers = {},
      params = {},
      data,
      auth,
      timeout = 7000,
      responseType = 'text',
    } = input;

    if (!url || typeof url !== 'string') {
      return '❌ URL не указан';
    }

    try {
      const response = await axios.request({
        method,
        url,
        headers,
        params,
        data,
        auth,
        timeout,
        responseType,
      });

      const content =
        typeof response.data === 'string'
          ? response.data.slice(0, 1000)
          : JSON.stringify(response.data, null, 2).slice(0, 1000);

      return `✅ [${response.status}] ${response.statusText}\n${content}`;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.statusText || error.message;

      return `❌ Ошибка запроса${status ? ` (${status})` : ''}: ${message}`;
    }
  }
}