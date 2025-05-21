import { Tool, ToolInputSpecField } from "../tool.interface";

export class NumberRoundTool implements Tool {
  name = "number_round";

  description =
      "Округляет число до заданного количества знаков после запятой. " +
      "Например, 3.14159 с digits = 2 → 3.14.";

  inputSpec: ToolInputSpecField[] = [
    {
      name: "value",
      type: "number",
      required: true,
      description: "Число, которое нужно округлить."
    },
    {
      name: "digits",
      type: "number",
      required: false,
      description: "Количество знаков после запятой (по умолчанию — 0)."
    }
  ];

  async run(input: { value: number; digits?: number }): Promise<string> {
    const { value, digits = 0 } = input;

    if (typeof value !== "number" || typeof digits !== "number") {
      return "❌ Укажи число и количество знаков для округления";
    }

    const factor = Math.pow(10, digits);
    const rounded = Math.round(value * factor) / factor;

    return rounded.toString();
  }
}