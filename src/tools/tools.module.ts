// src/tools/tools.module.ts
import { Module } from "@nestjs/common";
import { ToolExecutorService } from "./tool-executor.service";
import { LogModule } from "../log/log.module";
import { ToolCallService } from "./tool-call.service";
import { ToolSpecOpenRouterAdapter } from "./tool-spec-openrouter-adapter"; // ← добавить
import { ToolResponseParserService } from "./tool-response-parser.service";

@Module({
  imports: [LogModule],
  providers: [
    ToolExecutorService,
    ToolCallService,
    ToolSpecOpenRouterAdapter,
    ToolResponseParserService
  ],
  exports: [
    ToolExecutorService,
    ToolCallService,
    ToolSpecOpenRouterAdapter,
    ToolResponseParserService
  ]
})
export class ToolsModule {
}