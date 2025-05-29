import { Injectable, Logger } from "@nestjs/common";
import * as Services from "@services";
import * as Utils from "@utils";
import { Agent, AgentInput, AgentOutput, ChatMessage } from "./agent.interface";

@Injectable()
export class LlmToolAgent implements Agent {
  name = 'llm-tool-agent';
  description =
    'Агент, который строго вызывает инструменты. Не генерирует ответы сам.';

  private readonly context = LlmToolAgent.name;
  private readonly logger = new Logger(this.context);

  constructor(
    private openRouter: Services.OpenRouterService,
    private toolProxy: Services.ToolProxyService,
    private log: Services.LogService,
  ) {}

  async run(input: AgentInput): Promise<AgentOutput> {
    // 1️⃣ Загрузка системного промпта
    const systemPrompt = Utils.loadPrompt('llm-agent.prompt.txt');

    // 2️⃣ Сборка истории сообщений
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: m.content,
        file: m.file,
      })),
    ];

    // 3️⃣ Лог вложенных файлов
    if (input.files?.length) {
      const filesLog = `📎 Передано файлов: ${input.files.length}`;
      this.logger.log(filesLog, this.context);
      void this.log.info(filesLog, this.context);

      for (const file of input.files) {
        messages.push({
          role: 'user',
          content: `Файл: ${file.name}`,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            base64: file.base64,
          },
        });
      }
    }

    // 4️⃣ Отправка в LLM с включёнными инструментами
    const requestLog = `🚀 Отправка в OpenRouter (model=${input.model}, useTools=true)`;
    this.logger.log(requestLog, this.context);
    void this.log.info(requestLog, this.context);

    const response = await this.openRouter.chat({
      model: input.model,
      messages,
      useTools: true,
    });

    // 5️⃣ Пришёл ответ от LLM
    const responseLog = `🔄 Ответ от LLM:\n${JSON.stringify(response, null, 2)}`;
    this.logger.log(responseLog, this.context);
    void this.log.info(responseLog, this.context);

    // 6️⃣ Парсинг на предмет вызова инструмента
    const parsed = Utils.parseToolResponse(response);

    if (parsed.error !== null) {
      const errParse = `❌ Ошибка парсинга tool-вызова: ${parsed.error}`;
      this.logger.log(errParse, this.context);
      void this.log.info(errParse, this.context);
      return { result: errParse };
    }

    if (parsed.tool === null) {
      const noTool =
        '❌ Этот агент не обрабатывает обычный текст. Только tool-вызовы.';
      this.logger.log(noTool, this.context);
      void this.log.info(noTool, this.context);
      return { result: noTool };
    }

    // 7️⃣ Логи до proxy-вызова
    const proxyCallLog = `🔧 Вызов инструмента через proxy: ${parsed.tool} с аргументами ${JSON.stringify(parsed.input)}`;
    this.logger.log(proxyCallLog, this.context);
    void this.log.info(proxyCallLog, this.context);

    // 8️⃣ Выполнение proxy-вызова в try/catch
    try {
      const output = await this.toolProxy.runTool(parsed.tool, parsed.input);

      const proxyResultLog = `✅ Результат proxy для ${parsed.tool}: ${JSON.stringify(output)}`;
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
      const errRun =
        error?.message ?? '❌ Ошибка выполнения инструмента через proxy.';
      this.logger.log(errRun, this.context);
      void this.log.info(errRun, this.context);
      return { result: errRun };
    }
  }
}
