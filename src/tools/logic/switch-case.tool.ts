import { Tool, ToolInputSpecField } from "../tool.interface";

export class SwitchCaseTool implements Tool {
  name = "switch_case";

  description =
      "Возвращает значение из набора `cases` по ключу `key`. Аналог оператора `switch/case`. Если ключ не найден — возвращается значение по умолчанию (default).";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "key",
      type: "string",
      required: true,
      description: "Ключ, по которому производится выбор значения."
    },
    {
      name: "cases",
      type: "object",
      required: true,
      description: "Объект с возможными значениями для разных ключей. Пример: { \"admin\": \"Привет, админ\", \"user\": \"Привет, пользователь\" }"
    },
    {
      name: "default",
      type: "string",
      required: false,
      description: "Значение по умолчанию, если ключ не найден в `cases`. По умолчанию: \"Неизвестное значение\"."
    }
  ];

  async run(input: {
    key: string;
    cases: Record<string, string>;
    default?: string;
  }): Promise<string> {
    const { key, cases, default: defaultValue = "Неизвестное значение" } = input;

    if (!key || typeof cases !== "object") {
      return "❌ Неверные параметры";
    }

    return cases[key] ?? defaultValue;
  }
}