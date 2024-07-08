import { options } from '../common/options';
import { _global } from '../utils/global';
import { isRegExp, isPromiseRejectedResult, isArray } from '../utils/is';
import { map, filter, replaceAop } from '../utils';
import report from '../common/report';
import type { VoidFun } from '../types';
import type { ErrorInfoType } from '../types/global';

interface ErrorStack {
  errMessage: string;
  errStack: string;
}

type InstabilityNature = {
  lineNumber: string;
  fileName: string;
  columnNumber: string;
};

/**
 * 错误信息收集
 * 主原理是监听/劫持以下事件：
 * 1、error：资源加载错误
 * 2、unhandledrejection：未捕获的Promise reject错误
 * 3、console.error：console.error错误
 */
function initError(): void {
  if (!options.error) return;

  replaceAop(console, 'error', (originalError: VoidFun) => {
    return function (this: any, ...args: any[]): void {
      // console.log('initConsoleError', args);
      // 自定义逻辑：收集错误信息，排除fe-monitor本身的错误
      if (!(args[0] && args[0].slice && args[0].slice(0, 12) === '[fe-monitor]')) {
        report.lazyReportCache({
          type: 'error',
          subType: 'console',
          data: parseError(args),
        } as ErrorInfoType);
      }

      originalError.apply(this, args);
    };
  });

  window.addEventListener('error', (e: ErrorEvent) => {
    // console.log('initError error0', e);
    const reportData = {
      type: 'error',
      subType: 'code',
      data: parseErrorEvent(e),
    } as ErrorInfoType;
    // console.log('initError error', reportData);
    report.lazyReportCache(reportData);
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    // console.log('initError unhandledrejection0', e);
    const reportData = {
      type: 'error',
      subType: 'unhandledrejection',
      data: parseErrorEvent(e as unknown as PromiseRejectedResult),
    } as ErrorInfoType;
    // console.log('initError unhandledrejection', reportData);
    report.lazyReportCache(reportData);
  });
}

/**
 * 格式化错误对象信息
 * @param err Error 错误对象
 */
function parseStack(err: Error): ErrorStack {
  const { stack = '', message = '' } = err;
  const result = { eventId: 'code', errMessage: message, errStack: stack };

  if (stack) {
    const rChromeCallStack = /^\s*at\s*([^(]+)\s*\((.+?):(\d+):(\d+)\)$/;
    const rMozlliaCallStack = /^\s*([^@]*)@(.+?):(\d+):(\d+)$/;
    // chrome中包含了message信息,将其去除,并去除后面的换行符
    const callStackStr = stack.replace(new RegExp(`^[\\w\\s:]*${message}\n`), '');
    const callStackFrameList = map(
      filter(callStackStr.split('\n'), (item: string) => item),
      (str: string) => {
        const chromeErrResult = str.match(rChromeCallStack);
        if (chromeErrResult) {
          return {
            triggerPageUrl: chromeErrResult[2],
            line: chromeErrResult[3], // 错误发生位置的行数
            col: chromeErrResult[4], // 错误发生位置的列数
          };
        }

        const mozlliaErrResult = str.match(rMozlliaCallStack);
        if (mozlliaErrResult) {
          return {
            triggerPageUrl: mozlliaErrResult[2],
            line: mozlliaErrResult[3],
            col: mozlliaErrResult[4],
          };
        }
        return {};
      },
    );
    const item = callStackFrameList[0] || {};
    return { ...result, ...item };
  }
  return result;
}

/**
 * 分析错误信息
 * @param e 错误源信息
 * @returns 相对标准格式的错误信息
 */
export function parseError(e: any) {
  if (e instanceof Error) {
    // fileName: 引发此错误的文件的路径 (此属性为非标准，所以下面得区分)
    const { message, stack, lineNumber, fileName, columnNumber } = e as Error & InstabilityNature;
    if (fileName) {
      return {
        errMessage: message,
        errStack: stack,
        eventId: 'code',
        line: lineNumber, // 不稳定属性 - 在某些浏览器可能是undefined，被废弃了
        col: columnNumber, // 不稳定属性 - 非标准，有些浏览器可能不支持
        triggerPageUrl: fileName, // 不稳定属性 - 非标准，有些浏览器可能不支持
      };
    }
    return parseStack(e);
  }
  if (e.message) return parseStack(e);

  // reject 错误
  if (typeof e === 'string') return { eventId: 'reject', errMessage: e };

  // console.error 暴露的错误
  if (isArray(e)) return { eventId: 'console', errMessage: e.join(';') };

  return {};
}

function parseErrorEvent(event: ErrorEvent | PromiseRejectedResult) {
  // promise reject 错误
  if (isPromiseRejectedResult(event)) {
    return { eventId: 'code', ...parseError(event.reason) };
  }

  // html元素上发生的异常错误
  const { target } = event;
  if (target instanceof HTMLElement) {
    // 为1代表节点是元素节点
    if (target.nodeType === 1) {
      const result = {
        initiatorType: target.nodeName.toLowerCase(),
        eventId: 'resource',
        requestUrl: '',
      };
      switch (target.nodeName.toLowerCase()) {
        case 'link':
          result.requestUrl = (target as HTMLLinkElement).href;
          break;
        default:
          result.requestUrl = (target as HTMLImageElement).currentSrc || (target as HTMLScriptElement).src;
      }
      return result;
    }
  }

  // 代码异常
  if (event.error) {
    // chrome中的error对象没有fileName等属性,将event中的补充给error对象
    const e = event.error;
    e.fileName = e.filename || event.filename;
    e.columnNumber = e.colno || event.colno;
    e.lineNumber = e.lineno || event.lineno;
    return { eventId: 'code', ...parseError(e) };
  }

  // 兜底
  // ie9版本,从全局的event对象中获取错误信息
  return {
    eventId: 'code',
    line: (_global as any).event.errorLine,
    col: (_global as any).event.errorCharacter,
    errMessage: (_global as any).event.errorMessage,
    triggerPageUrl: (_global as any).event.errorUrl,
  };
}

export { initError };
