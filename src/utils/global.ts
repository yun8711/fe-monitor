import { isWindow } from './is';
/**
 * 是否为浏览器环境
 */
export const isBrowserEnv = isWindow(typeof window !== 'undefined' ? window : 0);

/**
 * 是否为 electron 环境
 */
// export const isElectronEnv = !!window?.process?.versions?.electron;

export function getGlobal() {
  // if (isBrowserEnv || isElectronEnv) return window;
  if (isBrowserEnv) return window;
  return {} as Window;
}

/**
 * 判断sdk是否初始化
 * @returns sdk是否初始化
 */
export function isInit(): boolean {
  return !!_global.__feMonitor__;
}

const _global = getGlobal();

export { _global };
