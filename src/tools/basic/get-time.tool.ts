import { Tool } from '../tool.interface';
import { DateTime } from 'luxon';

export class GetTimeTool implements Tool {
  name = 'getTime';

  async run(args: any): Promise<string> {
    const zone = args?.timezone || 'Europe/Moscow';
    try {
      return DateTime.now().setZone(zone).toLocaleString(DateTime.DATETIME_FULL);
    } catch {
      return '❌ Неверная таймзона';
    }
  }
}