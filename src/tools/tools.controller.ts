import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import * as Services from '@services';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolProxy: Services.ToolProxyService) {}

  // 🔹 Получение всех инструментов
  @Get()
  async listTools() {
    return await this.toolProxy.getAllTools();
  }

  // 🔹 Получение конкретного инструмента по имени
  @Get(':name')
  async getToolByName(@Param('name') name: string) {
    try {
      return await this.toolProxy.getTool(name);
    } catch (error: any) {
      throw new NotFoundException(error.message);
    }
  }

  // 🔹 Выполнение инструмента по имени с аргументами
  @Post(':name/run')
  async runTool(@Param('name') name: string, @Body() body: { args?: any }) {
    const args = body.args || {};

    // 1️⃣ Находим тул и его source
    const tool = await this.toolProxy.getTool(name);
    if (!tool || !tool.source) {
      throw new NotFoundException(`Инструмент "${name}" не найден`);
    }

    // 2️⃣ Выполняем тул через определённый source
    return await this.toolProxy.runTool(name, args, tool.source);
  }
}
