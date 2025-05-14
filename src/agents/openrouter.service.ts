import axios from 'axios';
import { Injectable } from '@nestjs/common';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class OpenRouterService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  async chat(input: {
    model: string;
    messages?: ChatMessage[];
    prompt?: string;
  }): Promise<string> {
    const { model, messages = [], prompt } = input;

    const finalMessages: ChatMessage[] = messages.length
      ? messages
      : prompt
        ? [{ role: 'user', content: prompt }]
        : [];

    if (finalMessages.length === 0) {
      throw new Error('❌ Не указаны ни prompt, ни messages');
    }

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
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'ai-platform',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}