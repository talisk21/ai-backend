export interface ToolInput {
  name: string;
  args?: any;
}

export interface Tool {
  name: string;
  run(args: any): Promise<string>;
}