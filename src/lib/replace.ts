import { replaceAop } from '../utils';
import { _global } from '../utils/global';
import type { VoidFun } from '../types';

/**
 * 重写 - history-replaceState
 */
function replaceHistoryReplaceState(): void {
  if (!('history' in _global)) return;
  if (!('pushState' in _global.history)) return;
  replaceAop(_global.history, 'replaceState', (originalSend: VoidFun) => {
    return function (this: any, ...args: any[]): void {
      // eventBus.runEvent(type, ...args);
      originalSend.apply(this, args);
    };
  });
}
/**
 * 重写 - history-pushState
 */
function replaceHistoryPushState(): void {
  if (!('history' in _global)) return;
  if (!('pushState' in _global.history)) return;
  replaceAop(_global.history, 'pushState', (originalSend: VoidFun) => {
    return function (this: any, ...args: any[]): void {
      // eventBus.runEvent(type, ...args);
      originalSend.apply(this, args);
    };
  });
}

export function replaceAll() {
  replaceHistoryReplaceState();
  replaceHistoryPushState();
}
