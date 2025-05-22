import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ToolMetadata } from "./tool.interface";
import { ToolRegistry } from "./tool-registry";

@Controller("api/tools")
export class ToolController {
  constructor(private readonly registry: ToolRegistry) {
  }

  @Get()
  listTools(): ToolMetadata[] {
    return this.registry.getAll().map(this.toMetadata);
  }

  @Get(":name")
  getToolByName(@Param("name") name: string): ToolMetadata {
    const tool = this.registry.getByName(name);
    if (!tool) {
      throw new NotFoundException(`Tool "${name}" not found`);
    }
    return this.toMetadata(tool);
  }

  private inferCategory(name: string): string {
    if (name.includes("email")) return "notifications";
    if (name.includes("text")) return "text";
    if (name.includes("time")) return "system";
    return "general";
  }

  private toMetadata = (tool): ToolMetadata => ({
    name: tool.name,
    description: tool.description,
    category: this.inferCategory(tool.name),
    props: tool.inputSpec ?? []
  });
}