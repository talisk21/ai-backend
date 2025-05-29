import { readFileSync } from 'fs';
import { join } from 'path';

const cache = new Map<string, string>();

export function loadPrompt(filename: string): string {
  if (cache.has(filename)) {
    return cache.get(filename)!;
  }
  const fullPath = join(process.cwd(), 'src', 'agents', 'prompts', filename);
  const content = readFileSync(fullPath, 'utf-8');
  cache.set(filename, content);
  return content;
}
