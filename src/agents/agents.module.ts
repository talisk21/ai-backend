import { Module } from "@nestjs/common";
import { AgentGatewayService } from "./agent-gateway.service";
import { OpenRouterService } from "./openrouter.service";
import { PromptLoader } from "./prompt-loader";
import { ToolsModule } from "../tools/tools.module";
import { LogModule } from "../log/log.module";
import { ToolResponseParserService } from "../tools/tool-response-parser.service";

@Module({
  imports: [ToolsModule, LogModule],
  providers: [
    AgentGatewayService,
    OpenRouterService,
    PromptLoader,
    ToolResponseParserService
  ],
  exports: [AgentGatewayService, ToolResponseParserService]
})
export class AgentModule {
}
