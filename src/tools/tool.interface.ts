export interface OpenRouterToolInputSpecField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'date' | 'array';
  itemsType?: 'string' | 'number' | 'boolean' | 'object' | 'date' | 'array';
  required: boolean;
  description?: string;
}
