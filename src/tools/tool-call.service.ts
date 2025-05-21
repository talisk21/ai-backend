import { Injectable } from "@nestjs/common";
import { ToolExecutorService } from "./tool-executor.service";

interface ToolCallParsed {
  tool: string;
  input: any;
}

@Injectable()
export class ToolCallService {
  constructor(private readonly tools: ToolExecutorService) {
  }


  /**
   * Выполняет инструмент по имени и входным данным
   */
  async executeTool(tool: string, input: any): Promise<string | { error: string }> {
    try {
      const result = await this.tools.run(tool, input);
      return result;
    } catch (err: any) {
      return { error: `❌ Ошибка при выполнении "${tool}": ${err.message}` };
    }
  }
}
