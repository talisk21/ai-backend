import { Injectable } from '@nestjs/common';
import * as Services from '@services';
import { OpenRouterToolInputSpecField } from './tool.interface';

@Injectable()
export class ToolSpecOpenRouterAdapter {
  constructor(private readonly toolProxy: Services.ToolProxyService) {}

  async getToolFunctions(): Promise<any[]> {
    const toolList = await this.toolProxy.getAllTools(); // name, description, spec[]
    return toolList.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: this.convertSpecToSchema(tool.spec || []),
      },
    }));
  }

  private convertSpecToSchema(spec: OpenRouterToolInputSpecField[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of spec) {
      const fieldSchema: any = {
        type: field.type,
        description: field.description || '',
      };

      if (field.type === 'array') {
        fieldSchema.items = {
          type: field.itemsType || 'string',
        };
      }

      properties[field.name] = fieldSchema;
      if (field.required) required.push(field.name);
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }
}
