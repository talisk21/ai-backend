import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { join } from "path";
import { ToolExecutorService } from "../tools/tool-executor.service"; // путь адаптируй под проект
import { ToolInputSpecField } from "../tools/tool.interface";

@Injectable()
export class PromptLoader {
  private readonly cache = new Map<string, string>();

  constructor(private readonly toolExecutor: ToolExecutorService) {
  }

  loadPrompt(filename: string): string {
    if (this.cache.has(filename)) return this.cache.get(filename)!;

    const path = join(process.cwd(), "src", "agents", "prompts", filename);
    const content = readFileSync(path, "utf-8");
    this.cache.set(filename, content);
    return content;
  }

  /**
   * Загружает промт и подставляет параметры вида {KEY}
   */
  loadPromptWithParams(filename: string, params: Record<string, string>): string {
    let prompt = this.loadPrompt(filename);
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, "g"), value);
    }
    return prompt;
  }

  /**
   * Загружает промт для агента, автоматически подставляя {TOOLS} если он есть
   */
  loadAgentPrompt(filename: string): string {
    const content = this.loadPrompt(filename);

    // если в тексте есть плейсхолдер {TOOLS} — подставляем список инструментов
    if (content.includes("{TOOLS}")) {
      const tools = this.toolExecutor.getToolList();
      const toolsText = this.buildToolDescriptions(tools);
      return content.replace("{TOOLS}", toolsText);
    }

    return content;
  }

  /**
   * Генерация Markdown-блока со всеми инструментами
   */
  private buildToolDescriptions(tools: { name: string; description: string; spec?: ToolInputSpecField[] }[]): string {
    return tools.map(tool => {
      const spec = (tool.spec ?? [])
        .map(p =>
          `- \`${p.name}\` (${p.type}, ${p.required ? "обязательный" : "опционально"}): ${p.description || ""}`
        )
        .join("\n");
      return `🔧 **${tool.name}** — ${tool.description}\nПараметры:\n${spec || "— (без параметров)"}`;
    }).join("\n\n");
  }
}