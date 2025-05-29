export interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content:
    | string
    | { type: 'text'; text: string }[]
    | (
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      )[];

  file?: {
    name: string;
    mimeType: string;
    base64: string;
  };
}

export interface AgentFile {
  name: string;
  mimeType: string;
  base64: string;
}

export interface AgentInput {
  model: string;
  messages: ChatMessage[];
  prompt?: string;
  files?: AgentFile[];
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
