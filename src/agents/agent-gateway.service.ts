import { Injectable, Logger } from "@nestjs/common";
import { LLmAgent, LlmToolAgent, LlmToolDecisionAgent, LogService } from "@services";
import { Agent, AgentInput, AgentOutput } from "./agent.interface";

@Injectable()
export class AgentGatewayService {
  private readonly agents: Record<string, Agent>;
  private readonly logger = new Logger(AgentGatewayService.name);
  private readonly context = 'AgentGatewayService';

  constructor(
    private readonly llmAgent: LLmAgent,
    private readonly llmToolAgent: LlmToolAgent,
    private readonly llmToolDecisionAgent: LlmToolDecisionAgent,
    private readonly log: LogService,
  ) {
    this.agents = {
      'llm-agent': this.llmAgent,
      'llm-tool-agent': this.llmToolAgent,
      'llm-tool-decision-agent': this.llmToolDecisionAgent,
    };
  }

  async chat(input: AgentInput, agentName: string): Promise<string> {
    const agent = this.agents[agentName];
    if (!agent) {
      const errMsg = `❌ Агент "${agentName}" не найден`;
      this.logger.error(errMsg, '', this.context);
      void this.log.error(errMsg, this.context, { agentName });
      throw new Error(errMsg);
    }

    const output: AgentOutput = await agent.run(input);

    if (output.usedTools?.length) {
      const toolName = output.usedTools[0].name;
      const msg = `✅ Использован инструмент "${toolName}"`;
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context, { tool: toolName });
    } else {
      const msg = '💬 Ответ без использования инструментов';
      this.logger.log(msg, this.context);
      void this.log.info(msg, this.context);
    }

    return output.result;
  }
}
