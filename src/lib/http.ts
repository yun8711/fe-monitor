import { options } from '../common/options';
import { parseGetParams, replaceAop } from '../utils';
import report from '../common/report';
import { _global } from '../utils/global';
import { isRegExp } from '../utils/is';
import type { ErrorInfoType, XhrOpenArgs, PerformanceInfoType } from '../types/global';

const originalProto = XMLHttpRequest.prototype;
const originalOpen = originalProto.open;
const originalSend = originalProto.send;

function initXHR() {
  // xhrReq.open(method, url, async, user, password);
  originalProto.open = function newOpen(...args: XhrOpenArgs) {
    // console.log('originalProto.open', args);
    // 这里的this 指定的是调用XMLHttpRequest的实例
    this.method = String(args[0]).toLocaleLowerCase();
    this.url = args[1].split('?')[0];
    this.reqQuery = this.method === 'get' ? parseGetParams(args[1]) : '';
    originalOpen.apply(this, args);
  };

  // xhrReq.send(body);
  originalProto.send = function newSend(...args) {
    // console.log('originalProto.send', args);
    // 请求开始时间
    this.startTime = Date.now();
    // this.params = args[0];
    const isFormData = args[0] instanceof FormData;
    if (isFormData) {
      // 将 FormData 转换为对象
      const formDataObj = {};
      // @ts-expect-error
      for (const pair of args[0].entries()) {
        formDataObj[pair[0]] = pair[1];
      }
      this.reqBody = formDataObj;
    } else {
      this.reqBody = args[0];
    }
    // console.log('this.params', this.params);

    // 这里只能使用箭头函数，否则this指向会出错
    const onLoadend = () => {
      // console.log('onLoadend', this);
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      const { status, duration, startTime, url, method, response } = this;

      if (status === 200 || status === 304) {
        if (!options.performance) return;
        let resSize = 0;
        if (this.responseType === '' || this.responseType === 'text') {
          resSize = new Blob([this.responseText]).size; // 更准确地获取字节数
        } else if (this.responseType === 'arraybuffer' && this.response) {
          resSize = this.response.byteLength;
        } else if (this.responseType === 'blob' && this.response) {
          resSize = this.response.size;
        }

        const reportData = {
          type: 'performance',
          subType: 'xhr',
          data: {
            url,
            method,
            reqQuery: this.reqQuery, // query参数
            reqBody: this.reqBody, // body参数
            status,
            duration,
            startTime,
            // 如果response太长，只截取前1000个字符
            res: resSize > 1000 ? response.slice(0, 1000) + '...' : response,
            resSize,
          },
        } as PerformanceInfoType;
        // console.log('initXHR performance', reportData);
        report.lazyReportCache(reportData);
      } else {
        if (!options.error) return;
        const reportData = {
          type: 'error',
          subType: 'xhr',
          data: {
            url,
            method,
            reqQuery: this.reqQuery, // query参数
            reqBody: this.reqBody, // body参数
            status,
            duration,
            startTime,
            response,
          },
        } as ErrorInfoType;
        // console.log('initXHR error', reportData);
        // 上报数据
        report.lazyReportCache(reportData);
      }

      // 解绑监听器
      this.removeEventListener('loadend', onLoadend, true);
    };

    if (!isIgnoreHttp(this.url)) {
      // 挂载一个事件监听器，用于监听请求结束，然后收集数据
      this.addEventListener('loadend', onLoadend, true);
    }
    originalSend.apply(this, args);
  };
}

function initFetch() {
  if (!('fetch' in _global)) return;
  replaceAop(_global, 'fetch', originalFetch => {
    // return function (this: any, ...args: any[]): void {
    return function (this: any, [url, config]): void {
      const fetchStart = Date.now();
      return originalFetch.apply(_global, [url, config]).then((res: Response) => {
        // console.log('initFetch', url, config);
        if (isIgnoreHttp(url)) return;
        // const { method = 'GET', body } = args[1];
        const { method = 'GET', body } = config;
        // const { status, statusText } = res;
        const requestMethod = String(method).toLowerCase();

        const reqQuery = requestMethod === 'get' ? parseGetParams(url) : {};
        const clonedRes = res.clone(); // 克隆响应对象
        const status = clonedRes.status;
        // console.log('clonedRes', res, clonedRes);
        if (status === 200 || status === 304) {
          if (options.performance) {
            clonedRes.blob().then(blob => {
              // 读取响应体内容
              const resSize = blob.size; // 获取字节数

              const reportData = {
                type: 'performance',
                subType: 'fetch',
                data: {
                  url,
                  method,
                  reqQuery, // query参数
                  reqBody: requestMethod === 'post' ? body : {}, // body参数
                  status,
                  duration: Date.now() - fetchStart,
                  startTime: fetchStart,
                  // 如果response太长，只截取前1000个字符
                  res: resSize > 1000 ? blob.slice(0, 1000) + '...' : blob,
                  resSize,
                },
              } as PerformanceInfoType;
              // console.log('initFetch performance', reportData);
              report.lazyReportCache(reportData);
            });
          }
        } else {
          if (options.error) {
            clonedRes.blob().then(blob => {
              const reportData = {
                type: 'error',
                subType: 'fetch',
                data: {
                  url,
                  method,
                  reqQuery: reqQuery, // query参数
                  reqBody: requestMethod === 'post' ? body : {}, // body参数
                  status,
                  duration: Date.now() - fetchStart,
                  startTime: fetchStart,
                  res: blob,
                },
              } as ErrorInfoType;
              // console.log('initXHR error', reportData);
              // 上报数据
              report.lazyReportCache(reportData);
            });
          }
        }
        return res;
      });
    };
  });
}

/**
 * 判断请求地址是否为需要拦截的
 * @param url 请求地址
 */
function isIgnoreHttp(url: string): boolean {
  if (!url) return true;
  if (url === options.reportUrl) return true;
  if (!options.ignoreRequest.length) return false;

  return options.ignoreRequest.some(item => {
    if (isRegExp(item)) {
      return (item as RegExp).test(url);
    } else {
      return url === item;
    }
  });
}

export function initHttp() {
  initXHR();
  initFetch();
}
