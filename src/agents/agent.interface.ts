// src/agents/agent.interface.ts

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentInput {
  model: string;
  messages: ChatMessage[];
  prompt?: string;
}

export interface AgentOutput {
  result: string;
  usedTools?: {
    name: string;
    input: any;
    output: any;
  }[];
}

export interface Agent {
  name: string;
  description: string;
  run(input: AgentInput): Promise<AgentOutput>;
}