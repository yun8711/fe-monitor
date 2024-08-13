import { options } from '../common/options';

export function log(...args: any[]) {
  if (options.log) {
    console.log('[fe-monitor]', ...args);
  }
}
