import { Controller, Get } from "@nestjs/common";
import { ToolMetadata } from "./tool.interface";
import { ToolRegistry } from "./tool-registry";


@Controller("api/tools")
export class ToolController {
  constructor(private readonly registry: ToolRegistry) {
  }

  @Get()
  getAllTools(): ToolMetadata[] {
    return this.registry.getAll().map(tool => ({
      name: tool.name,
      description: tool.description,
      category: this.inferCategory(tool.name),
      props: tool.inputSpec ?? []
    }));
  }

  private inferCategory(name: string): string {
    if (name.includes("email")) return "notifications";
    if (name.includes("text")) return "text";
    if (name.includes("time")) return "system";
    return "general";
  }
}