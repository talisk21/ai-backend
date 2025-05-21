import { Injectable } from "@nestjs/common";
import { ToolExecutorService } from "./tool-executor.service";
import { ToolInputSpecField } from "./tool.interface";

@Injectable()
export class ToolSpecOpenRouterAdapter {
  constructor(private readonly tools: ToolExecutorService) {
  }

  getToolFunctions(): any[] {
    const toolList = this.tools.getToolList(); // name, description, spec[]

    return toolList.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: this.convertSpecToSchema(tool.spec || [])
      }
    }));
  }

  private convertSpecToSchema(spec: ToolInputSpecField[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of spec) {
      let fieldSchema: any = {
        type: field.type,
        description: field.description || ""
      };

      // 🧠 Обработка массивов: добавляем items
      if (field.type === "array") {
        fieldSchema.items = {
          type: field.itemsType || "string" // default fallback
        };
      }

      properties[field.name] = fieldSchema;

      if (field.required) {
        required.push(field.name);
      }
    }

    return {
      type: "object",
      properties,
      required
    };
  }
}