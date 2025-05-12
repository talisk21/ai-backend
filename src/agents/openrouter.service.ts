import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenRouterService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  async chat(prompt: string, model: string): Promise<string> {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model, // ← теперь модель приходит как параметр
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'ai-platform',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}