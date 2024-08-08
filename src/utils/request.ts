import { MethodTypes } from '../common/constant';
import type { IAnyObject } from '../types/global.d.ts';

/**
 * sendBeacon上传
 * @param {string} url - 接口地址
 * @param {IAnyObject} data - 请求参数
 * @return {boolean}
 */
export function beacon(url: string, data: IAnyObject): boolean {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    let value = data[key];
    if (typeof value !== 'string') {
      // formData 只能 append string 或 Blob
      value = JSON.stringify(value);
    }
    formData.append(key, value);
  });
  return navigator.sendBeacon(url, formData);
}

/**
 * xhr方式的 get 上传
 * @param {string} url - 接口地址
 * @param {IAnyObject} data - 请求参数
 * @return {Promise}
 */
// export function get(url: string, data: IAnyObject): Promise<any> {
//   return xhr(MethodTypes.GET, `${url}${url.indexOf('?') === -1 ? '?' : ''}${obj2query(data)}`, '');
// }

/**
 * xhr方式的 post 上传
 * @param {string} url - 接口地址
 * @param {any} data - 请求参数
 */
export function post(url: string, data: any) {
  const xhr = new XMLHttpRequest();
  xhr.open('post', url);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.onerror = function (e) {
    console.error('数据上报错误', e);
  };

  xhr.onload = function () {
    if (xhr.status !== 200) {
      console.error(`[fe-monitor] 数据上报失败： ${xhr.status}: ${xhr.statusText}`);
    }
  };
  xhr.send(JSON.stringify(data));
}

/**
 * xhr上传
 * @param method
 * @param {string} url - 接口地址
 * @param {string} data - 请求参数
 * @return {Promise}
 */
export function xhr(method: MethodTypes, url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      if (method === MethodTypes.POST) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(data);
      } else {
        xhr.send();
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
          resolve(JSON.parse(xhr.response));
        } else {
          new Error(xhr.response);
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 图片方式上传
 * @param {string} url - 接口地址
 * @param {IAnyObject} data - 请求参数
 */
export function imgRequest(url: string, data: IAnyObject): void {
  let img = new Image();
  const spliceStr = url.indexOf('?') === -1 ? '?' : '&';
  img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
  img = null;
}
