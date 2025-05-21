import { Injectable, Logger } from "@nestjs/common";
import { OpenRouterService } from "./openrouter.service";
import { Agent, AgentInput, AgentOutput } from "./agent.interface";
import { LLmAgent } from "./llm-agent";
import { LlmToolAgent } from "./llm-tool-agent";
import { LlmToolDecisionAgent } from "./llm-tool-decision-agent";
import { ToolExecutorService } from "../tools/tool-executor.service";
import { LogService } from "../log/log.service";
import { PromptLoader } from "./prompt-loader";
import { ToolCallService } from "../tools/tool-call.service";
import { ToolResponseParserService } from "../tools/tool-response-parser.service";

@Injectable()
export class AgentGatewayService {
  private readonly agents: Record<string, Agent>;
  private readonly logger = new Logger(AgentGatewayService.name);

  constructor(
    private openRouter: OpenRouterService,
    private tools: ToolExecutorService,
    private log: LogService,
    private promptLoader: PromptLoader,
    private toolCallService: ToolCallService,
    private toolResponseParser: ToolResponseParserService
  ) {
    this.agents = {
      "llm-agent": new LLmAgent(this.openRouter, this.log, this.promptLoader),
      "llm-tool-agent": new LlmToolAgent(this.openRouter, this.tools, this.log, this.promptLoader, this.toolCallService,
        this.toolResponseParser),
      "llm-tool-decision-agent": new LlmToolDecisionAgent(this.openRouter, this.tools, this.log, this.promptLoader,
        this.toolCallService, this.toolResponseParser)
    };
  }

  /**
   * Выполнить запрос через заданного агента
   */
  async chat(input: AgentInput, agentName: string): Promise<string> {
    const agent = this.agents[agentName];

    if (!agent) {
      throw new Error(`❌ Агент "${agentName}" не найден`);
    }

    const output: AgentOutput = await agent.run(input);

    if (output.usedTools?.length) {
      this.logger.log(
        `✅ Использован инструмент "${output.usedTools[0].name}"`,
        "AgentGatewayService"
      );
      await this.log.info?.("✅ Использован инструмент", "AgentGatewayService", {
        tool: output.usedTools[0].name
      });
    } else {
      this.logger.log("💬 Ответ без использования инструментов", "AgentGatewayService");
      await this.log.info?.("💬 Ответ без использования инструментов", "AgentGatewayService");
    }

    return output.result;
  }
}
