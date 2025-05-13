// Типы ролей сообщений для LLM-агента
export type ChatRole = 'user' | 'assistant' | 'system';

// Стандартное сообщение в стиле OpenAI API
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Входной payload для отправки в LLM через gateway
export interface AgentChatInput {
  model: string;
  prompt: string;
  messages?: ChatMessage[];
}

// Ожидаемый ответ от агента
export interface AgentChatOutput {
  result: string;
}