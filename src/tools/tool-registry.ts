import { Tool } from "./tool.interface";
import { UuidTool } from "./basic/uuid.tool";
import { GetTimeTool } from "./time/get-time.tool";
import { MathTool } from "./basic/math.tool";
import { EchoTool } from "./basic/echo.tool";
import { WebSearchTool } from "./web/web-search.tool";
import { JsonExtractTool } from "./json/json-extract.tool";
import { ClearContextTool } from "./internal/clear-context.tool";
import { TimeDeltaTool } from "./time/time-delta.tool";
import { IsWeekendTool } from "./time/is-weekend.tool";
import { TextSummaryTool } from "./text/text-summary.tool";
import { TextKeywordsTool } from "./text/text-keywords.tool";
import { TextSentimentTool } from "./text/text-sentiment.tool";
import { JsonMergeTool } from "./json/json-merge.tool";
import { JsonKeysTool } from "./json/json-keys.tool";
import { NumberSumTool } from "./math/number-sum.tool";
import { NumberStatsTool } from "./math/number-stats.tool";
import { NumberCompareTool } from "./math/number-compare.tool";
import { UrlTitleTool } from "./web/url-title.tool";
import { UrlStatusTool } from "./web/url-status.tool";
import { HttpRequestTool } from "./web/http-request.tool";
import { TextLengthTool } from "./text/text-length.tool";
import { TextUppercaseTool } from "./text/text-uppercase.tool";
import { TextTrimTool } from "./text/text-trim.tool";
import { NotifyWebhookTool } from "./notify/notify-webhook.tool";
import { IfConditionTool } from "./logic/if-condition.tool";
import { SwitchCaseTool } from "./logic/switch-case.tool";
import { EqualsTool } from "./logic/equals.tool";
import { NotTool } from "./logic/not.tool";
import { AndTool } from "./logic/and.tool";
import { OrTool } from "./logic/or.tool";
import { SleepTool } from "./schedule/sleep.tool";
import { DelayUntilTool } from "./schedule/delay-until.tool";
import { NumberDiffTool } from "./math/number-diff.tool";
import { NumberProductTool } from "./math/number-product.tool";
import { NumberDivideTool } from "./math/number-divide.tool";
import { NumberRoundTool } from "./math/number-round.tool";
import { WebScrapeTool } from "./web/web-scrape.tool";
import { ExtractLinksTool } from "./web/extract-links.tool";
import { ExtractTableTool } from "./web/extract-table.tool";
import { FileDownloadTool } from "./files/file-download.tool";
import { FileToBase64Tool } from "./files/file-to-base64.tool";
import { FileReadTool } from "./files/file-read.tool";
import { TemplateStringTool } from "./logic/template-string.tool";
import { EvalExpressionTool } from "./logic/eval-expression.tool";
import { TextRepeatTool } from "./logic/text-repeat.tool";
import { DetectLanguageTool } from "./text/detect-language.tool";
import { ClassifyTextTool } from "./text/classify-text.tool";
import { ExtractKeywordsTool } from "./text/extract-keywords.tool";
import { TextSummaryAdvancedTool } from "./text/text-summary-advanced.tool";
import { TextCorrectGrammarTool } from "./text/text-correct-grammar.tool";
import { TextTokenCountTool } from "./text/text-token-count.tool";
import { TextTranslateTool } from "./text/text-translate.tool";
import { JsonCompareTool } from "./json/json-compare.tool";
import { JsonFlattenTool } from "./json/json-flatten.tool";
import { JsonValidateTool } from "./json/json-validate.tool";
import { SendEmailTool } from "./email/send-email.tool";
import { FetchEmailTool } from "./email/fetch-email.tool";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";

const prisma = new PrismaService();
const mailService = new MailService(prisma);

export class ToolRegistry {
  constructor(private readonly tools: Tool[]) {
  }

  getAll(): Tool[] {
    return this.tools;
  }

  getByName(name: string): Tool | undefined {
    return this.tools.find((tool) => tool.name === name);
  }
}

export const toolRegistryInstance = new ToolRegistry([
  new UuidTool(),
  new GetTimeTool(),
  new MathTool(),
  new EchoTool(),
  new WebSearchTool(),
  new JsonExtractTool(),
  new ClearContextTool(),
  new TimeDeltaTool(),
  new IsWeekendTool(),
  new TextSummaryTool(),
  new TextKeywordsTool(),
  new TextSentimentTool(),
  new JsonMergeTool(),
  new JsonKeysTool(),
  new NumberSumTool(),
  new NumberStatsTool(),
  new NumberCompareTool(),
  new UrlTitleTool(),
  new UrlStatusTool(),
  new HttpRequestTool(),
  new TextLengthTool(),
  new TextUppercaseTool(),
  new TextTrimTool(),
  new NotifyWebhookTool(),
  new IfConditionTool(),
  new SwitchCaseTool(),
  new EqualsTool(),
  new NotTool(),
  new AndTool(),
  new OrTool(),
  new SleepTool(),
  new DelayUntilTool(),
  new NumberDiffTool(),
  new NumberProductTool(),
  new NumberDivideTool(),
  new NumberRoundTool(),
  new WebScrapeTool(),
  new ExtractLinksTool(),
  new ExtractTableTool(),
  new FileDownloadTool(),
  new FileToBase64Tool(),
  new FileReadTool(),
  new TemplateStringTool(),
  new EvalExpressionTool(),
  new TextRepeatTool(),
  new DetectLanguageTool(),
  new ClassifyTextTool(),
  new ExtractKeywordsTool(),
  new TextSummaryAdvancedTool(),
  new TextCorrectGrammarTool(),
  new TextTokenCountTool(),
  new TextTranslateTool(),
  new JsonCompareTool(),
  new JsonFlattenTool(),
  new JsonValidateTool(),
  new SendEmailTool(mailService),
  new FetchEmailTool(mailService)
]);
