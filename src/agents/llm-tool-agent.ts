import { Agent, AgentInput, AgentOutput } from './agent.interface';
import { OpenRouterService } from './openrouter.service';
import { ToolExecutorService } from '../tools/tool-executor.service';
import { LogService } from '../log/log.service';

export class LlmToolAgent implements Agent {
  name = 'llm-tool-agent';
  description = 'Агент с поддержкой LLM и инструментов';

  constructor(
    private openRouter: OpenRouterService,
    private tools: ToolExecutorService,
    private log: LogService,
  ) {}

  async run(input: AgentInput): Promise<AgentOutput> {
    const { model, messages } = input;

    // Шаг 1: Запрашиваем у LLM, нужен ли Tool
    const toolDecision = await this.openRouter.chat({
      model,
      prompt: '', // Prompt не нужен, используем только сообщения
      messages: [
        ...messages,
        {
          role: 'user',
          content: 'Нужно ли использовать инструмент (Tool)? Если да, то укажи JSON: { "tool": "название", "input": { ... } }. Если нет — просто ответь на вопрос.',
        },
      ],
    });

    this.log.debug('Ответ LLM на запрос Tool:', 'LlmToolAgent', { toolDecision });

    // Пытаемся извлечь JSON с указанием инструмента
    let toolName: string | null = null;
    let toolInput: any = null;
    try {
      const jsonMatch = toolDecision.match(/```json\n(.*?)```/s)?.[1] || toolDecision;
      const parsed = JSON.parse(jsonMatch);
      toolName = parsed.tool;
      toolInput = parsed.input;
    } catch (e) {
      this.log.warn('Не удалось извлечь Tool JSON, продолжаем без инструмента.', 'LlmToolAgent', { toolDecision });
    }

    // Если LLM предложила Tool — выполняем его
    if (toolName && toolInput) {
      const toolResult = await this.tools.run(toolName, toolInput);

      this.log.info('Выполнен инструмент', 'LlmToolAgent', {
        tool: toolName,
        input: toolInput,
        output: toolResult,
      });

      // Новый запрос к LLM с результатом инструмента
      const finalResponse = await this.openRouter.chat({
        model,
        prompt: '',
        messages: [
          ...messages,
          {
            role: 'user',
            content: `Результат выполнения инструмента:\n${toolResult}`,
          },
        ],
      });

      return {
        result: finalResponse,
        usedTools: [{ name: toolName, input: toolInput, output: toolResult }],
      };
    }

    // Если инструмент не использовался — возвращаем ответ напрямую
    return {
      result: toolDecision,
    };
  }
}