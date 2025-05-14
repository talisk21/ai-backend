import { Tool } from './tool.interface';
import { v4 as uuidv4 } from 'uuid';

export class UuidTool implements Tool {
  name = 'uuid';

  async run(): Promise<string> {
    return uuidv4();
  }
}