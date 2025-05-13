import { Injectable } from '@nestjs/common';
import { ChatMessage } from '../types/chat';
import axios from 'axios';

interface ChatOptions {
  model: string;
  prompt?: string;
  messages?: ChatMessage[];
}

@Injectable()
export class OpenRouterService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  async chat(options: ChatOptions): Promise<string> {
    const { model, prompt, messages } = options;

    // Если явно передан массив messages, используем его
    const finalMessages: ChatMessage[] =
      messages && messages.length > 0
        ? messages
        : [{ role: 'user', content: prompt ?? '' }];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: finalMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost', // настрой по необходимости
          'X-Title': 'ai-platform',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}