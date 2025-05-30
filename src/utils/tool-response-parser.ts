export interface ToolResponse {
  tool: string | null;
  input: any;
  answer: string | null;
  error: string | null;
}

export function parseToolResponse(raw: any): ToolResponse {
  let tool: string | null = null;
  let input: any = {};
  let answer: string | null = null;
  let error: string | null = null;

  try {
    // ✅ Структурированный вызов функции (OpenRouter / OpenAI format)
    if (raw?.type === 'tool' && Array.isArray(raw.toolCalls)) {
      const call = raw.toolCalls[0];
      const args =
        typeof call.arguments === 'string'
          ? JSON.parse(call.arguments)
          : call.arguments;

      if (typeof call.name === 'string') {
        tool = call.name.replace(/^functions\./, '');
        input = args ?? {};
      } else {
        error = '❌ Имя инструмента отсутствует или не строка.';
      }

      // ✅ Простая текстовая часть
    } else if (raw?.type === 'text' && typeof raw.content === 'string') {
      const rawText = raw.content.trim();

      // Текст без JSON — выдаем как answer
      if (!rawText.startsWith('{') && !rawText.startsWith('```json')) {
        answer = raw.content;

        // Текст, который, возможно, скрывает JSON (в тиках или без)
      } else {
        const match = rawText.match(/```json\s*([\s\S]*?)```/) ?? [
          null,
          rawText,
        ];
        const jsonText = match[1].trim();
        const parsed = JSON.parse(jsonText);

        // Разные форматы JSON для вызовов функций
        if (typeof parsed.tool === 'string') {
          tool = parsed.tool;
          input = parsed.input ?? {};
        } else if (typeof parsed.function === 'string') {
          tool = parsed.function;
          input = parsed.argument ?? {};
        } else if (
          typeof parsed.function === 'object' &&
          typeof parsed.function.name === 'string'
        ) {
          tool = parsed.function.name;
          input = parsed.function.arguments ?? {};
        } else if (typeof parsed.function_call?.name === 'string') {
          tool = parsed.function_call.name;
          input = parsed.function_call.arguments ?? {};
        } else if (parsed.tool === null && typeof parsed.answer === 'string') {
          answer = parsed.answer;
        } else {
          error = '❌ Не удалось извлечь имя инструмента (tool/function.name).';
        }

        if (tool) {
          tool = tool.replace(/^functions\./, '');
        }
      }
    } else {
      error = '❌ Не удалось интерпретировать ответ как tool-вызов или текст.';
    }
  } catch (err: any) {
    error = `❌ Ошибка парсинга tool-вызова: ${err.message}`;
  }

  return { tool, input, answer, error };
}
