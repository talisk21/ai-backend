export interface ToolInput {
  name: string;
  args?: any;
}

export interface ToolInputSpecField {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "date" | "array";
  itemsType?: "string" | "number" | "boolean" | "object" | "date" | "array",
  required: boolean;
  description?: string;
}

export interface ToolMetadata extends Omit<Tool, "inputSpec" | "run"> {
  category?: string;
  props: ToolInputSpecField[];
}

export interface Tool {
  name: string;
  description: string;
  inputSpec?: ToolInputSpecField[];

  run(input: any): Promise<any>;
}