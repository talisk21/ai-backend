// src/tools/tools.module.ts

import { Module } from "@nestjs/common";
import { ToolExecutorService } from "./tool-executor.service";
import { LogModule } from "../log/log.module";
import { ToolCallService } from "./tool-call.service";
import { ToolSpecOpenRouterAdapter } from "./tool-spec-openrouter-adapter";
import { ToolResponseParserService } from "./tool-response-parser.service";
import { ToolRegistry, toolRegistryInstance } from "./tool-registry";
import { ToolController } from "./tool.controller";

@Module({
  imports: [LogModule],
  providers: [
    ToolExecutorService,
    ToolCallService,
    ToolSpecOpenRouterAdapter,
    ToolResponseParserService,
    {
      provide: ToolRegistry,
      useValue: toolRegistryInstance
    }
  ],
  controllers: [ToolController],
  exports: [
    ToolExecutorService,
    ToolCallService,
    ToolSpecOpenRouterAdapter,
    ToolResponseParserService,
    ToolRegistry
  ]
})
export class ToolsModule {
}