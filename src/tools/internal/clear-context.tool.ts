import { Tool } from "../tool.interface";

export class ClearContextTool implements Tool {
  name = "clear_context";
  description = "Очищает историю диалога и сбрасывает текущий контекст агента. Полезно при смене темы разговора или перезапуске сессии.";

  inputSpec = []; // инструмент не требует параметров

  async run(): Promise<string> {
    // Здесь могла бы быть очистка истории в БД
    return "🧹 Контекст сброшен (символически)";
  }
}