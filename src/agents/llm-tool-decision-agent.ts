import { Injectable, Logger } from "@nestjs/common";
import * as Services from "@services";
import * as Utils from "@utils";
import { Agent, AgentInput, AgentOutput, ChatMessage } from "./agent.interface";


@Injectable()
export class LlmToolDecisionAgent implements Agent {
  name = 'llm-tool-decision-agent';
  description =
    'LLM агент, выбирающий нужный инструмент и вызывающий его, либо возвращающий ответ напрямую.';

  private readonly logger = new Logger(LlmToolDecisionAgent.name);
  private readonly context = 'LlmToolDecisionAgent';

  constructor(
    private openRouter: Services.OpenRouterService,
    private toolProxy: Services.ToolProxyService,
    private log: Services.LogService,
  ) {}

  async run(input: AgentInput): Promise<AgentOutput> {
    const { model } = input;
    const systemPrompt = Utils.loadPrompt('llm-agent.prompt.txt');

    console.log('openRouter',this.openRouter);
    console.log('toolProxy',this.toolProxy);
    console.log('log',this.log);

    // Формируем историю сообщений
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content,
        file: m.file,
      })),
    ];

    // Лог вложений, если есть
    if (input.files?.length) {
      const attachmentsLog = `📎 Вложения: ${input.files.length} файла(ов)`;
      this.logger.log(attachmentsLog, this.context);
      void this.log.info(attachmentsLog, this.context);
      for (const file of input.files) {
        messages.push({
          role: 'user',
          content: `📂 Вложение: ${file.name}`,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            base64: file.base64,
          },
        });
      }
    }

    // Лог отправки в OpenRouter
    const requestLog = `🚀 Отправка в OpenRouter (model=${model}, useTools=true)`;
    this.logger.log(requestLog, this.context);
    void this.log.info(requestLog, this.context);

    const response = await this.openRouter.chat({
      model,
      messages,
      useTools: true,
    });

    // Лог пришедшего ответа
    const responseLog = `🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`;
    this.logger.log(responseLog, this.context);
    void this.log.info(responseLog, this.context);

    // Парсим ответ на предмет tool-вызова
    const parsed = Utils.parseToolResponse(response);

    // Ошибка парсинга — может быть текст
    if (parsed.error !== null) {
      if (response.type === 'text' && typeof response.content === 'string') {
        return { result: response.content };
      }
      return { result: parsed.error };
    }

    // Если инструмент не вызван — возвращаем ответ напрямую
    if (parsed.tool === null) {
      const directLog = `💬 Прямой ответ без средств: ${parsed.answer}`;
      this.logger.log(directLog, this.context);
      void this.log.info(directLog, this.context);
      return { result: parsed.answer ?? '✅ Ответ сформирован напрямую.' };
    }

    // 🔧 Лог до proxy-вызова
    const proxyCallLog = `🔧 Вызов инструмента "${parsed.tool}" с аргументами ${JSON.stringify(parsed.input)}`;
    this.logger.log(proxyCallLog, this.context);
    void this.log.info(proxyCallLog, this.context);

    // Выполняем через proxy
    try {
      const output = await this.toolProxy.runTool(parsed.tool, parsed.input);

      // ✅ Лог после proxy-вызова
      const proxyResultLog = `✅ Результат инструмента "${parsed.tool}": ${JSON.stringify(output)}`;
      this.logger.log(proxyResultLog, this.context);
      void this.log.info(proxyResultLog, this.context);

      return {
        result: output,
        usedTools: [
          {
            name: parsed.tool,
            input: parsed.input,
            output,
          },
        ],
      };
    } catch (error: any) {
      const errMsg =
        error?.message ?? '❌ Ошибка выполнения инструмента через proxy.';
      this.logger.log(errMsg, this.context);
      void this.log.info(errMsg, this.context);
      return { result: errMsg };
    }
  }
}
