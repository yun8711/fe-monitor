/**
 * @file 基础常量定义
 */
// 请求类型
export enum MethodTypes {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
}

/**
 * 触发的事件id - eventID
 */
// export enum SENDID {
//   PAGE = 'page', // 页面
//   RESOURCE = 'resource', // 资源
//   SERVER = 'server', // 请求
//   CODE = 'code', // code
//   REJECT = 'reject', // reject
//   CONSOLEERROR = 'console.error', // console.error
// }

/**
 * 事件类型
 */
// export enum EVENTTYPES {
//   ERROR = 'error',
//   CONSOLEERROR = 'consoleError',
//   UNHANDLEDREJECTION = 'unhandledrejection',
//   CLICK = 'click',
//   LOAD = 'load',
//   BEFOREUNLOAD = 'beforeunload',
//   FETCH = 'fetch',
//   XHROPEN = 'xhr-open',
//   XHRSEND = 'xhr-send',
//   HASHCHANGE = 'hashchange',
//   HISTORYPUSHSTATE = 'history-pushState',
//   HISTORYREPLACESTATE = 'history-replaceState',
//   POPSTATE = 'popstate',
//   READYSTATECHANGE = 'readystatechange',
//   ONLINE = 'online',
//   OFFLINE = 'offline',
// }

/**
 * 网页的几种加载方式
 */
export const WEBPAGELOAD: Record<number, string> = {
  0: 'navigate', // 网页通过点击链接,地址栏输入,表单提交,脚本操作等方式加载
  1: 'reload', // 网页通过“重新加载”按钮或者location.reload()方法加载
  2: 'back_forward', // 网页通过“前进”或“后退”按钮加载
  255: 'reserved', // 任何其他来源的加载
};
