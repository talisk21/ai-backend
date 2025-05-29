export interface ToolConfig {
  name: string;
  toolProps: any[]; // параметры инструмента
}

// UI-данные для узла (используются в rawContent)
export interface RawNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: PromptNodeData;
}

export interface PromptNodeData {
  label: string;
  isStart: boolean;
  isActive?: boolean;
  prompt?: string;
  model?: string;
  agent?: string;
  tools: ToolConfig[];
}

export interface RawEdge {
  id: string;
  source: string;
  target: string;
}

// JSON, который приходит от UI и сохраняется в rawContent
export interface RawRouteFlow {
  nodes: RawNode[];
  edges: RawEdge[];
}

// Упрощённая и очищенная структура для content
export interface FlowNode {
  id: string;
  data: {
    label: string;
    prompt?: string;
    model?: string;
    agent?: string;
    tools: ToolConfig[];
    isStart: boolean;
  };
}

export interface FlowEdge {
  source: string;
  target: string;
}

// Хранимое исполняемое представление маршрута
export interface RouteFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Используется при создании нового шаблона маршрута
export interface RouteTemplate {
  name: string;
  steps: RawRouteFlow;
  userId?: string;
  isPublic?: boolean;
}
