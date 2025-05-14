import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { AgentGatewayService } from './agent-gateway.service';
import { ToolsModule } from '../tools/tools.module'; // 👈 добавили импорт

@Module({
  imports: [ToolsModule],
  providers: [OpenRouterService, AgentGatewayService],
  exports: [OpenRouterService, AgentGatewayService],
})
export class AgentsModule {}