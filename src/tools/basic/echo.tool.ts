import { Tool } from './tool.interface';

export class EchoTool implements Tool {
  name = 'echo';

  async run(args: any): Promise<string> {
    return typeof args === 'string' ? args : JSON.stringify(args);
  }
}