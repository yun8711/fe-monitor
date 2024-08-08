import { reactive } from 'vue';
import type { InitConfig, RemoteConfig } from '../types/global';

export function loadConfig(options: InitConfig) {
  if (!options?.remoteUrl) {
    console.warn('[fe-monitor] 未设置远程配置请求地址，请检查配置项 remoteUrl');
    return Promise.resolve(false);
  }
  const remoteUrl = options.remoteUrl;
  const remoteVersion = options.remoteVersion || '1';
  const host = options.host || window.location.host;
  const url = `${remoteUrl}?host=${host}&version=${remoteVersion}`;

  // 使用xhr请求远程配置
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // console.log('xhr.responseText', xhr);
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve(res?.data?.config || false);
        } else {
          // throw new Error('[fe-monitor] 获取远程配置失败，请检查远程配置是否正确');
          console.error('[fe-monitor] 获取远程配置失败');
          reject(false);
        }
      }
    };
    xhr.onerror = function () {
      console.error('[fe-monitor] 获取远程配置失败');
      reject(false);
    };
    xhr.send();
  });
}

interface OptionsType {
  enable: boolean;
  reportUrl: string;
  devReport: boolean;
  log: boolean;
  timeout: number;
  maxCache: number;
  error: boolean;
  performance: boolean;
  behavior: boolean;
  crash: boolean;
  crashInterval: number;
  crashTimeout: number;
  ignoreErrors: string[];
  ignoreRequest: RegExp[];
  ignorePage: string[];
  ignoreModules: string[];
}

export const options: OptionsType = reactive({
  enable: false,
  reportUrl: '',
  devReport: false, // 本地开发环境是否上报数据, 默认不上报
  log: window.location.hostname === 'localhost', // 本地开发环境是否显示日志, 默认不显示
  timeout: 3000, // 延迟上报的时间间隔
  maxCache: 10, // 允许缓存的最大数据量
  error: false, // 是否上报错误信息
  performance: false, // 是否上报性能信息
  behavior: false, // 是否上报用户行为
  crash: false, // 是否上报页面崩溃信息
  crashInterval: 10000, // 页面崩溃监控间隔
  crashTimeout: 15000, // 页面崩溃监控超时时间
  ignoreErrors: [], // 忽略上报的错误
  ignoreRequest: [], // 忽略监听的资源路径的正则表达式
  ignorePage: [], // 忽略上报的页面
  ignoreModules: [], // 忽略上报的模块
});

export function initConfig(remoteOptions: RemoteConfig) {
  const enable = remoteOptions.enable || false;
  options.enable = enable;
  if (!enable) return;
  options.reportUrl = remoteOptions.reportUrl;
  options.devReport = remoteOptions.devReport || false;
  // options.log = remoteOptions.log || false;
  options.timeout = remoteOptions.timeout || 3000;
  options.maxCache = remoteOptions.maxCache || 10;
  options.error = remoteOptions.error || false;
  options.crash = remoteOptions.crash || false;
  options.crashInterval = remoteOptions.crashInterval || 10000;
  options.crashTimeout = remoteOptions.crashTimeout || 15000;
  options.performance = remoteOptions.performance || false;
  options.behavior = remoteOptions.behavior || false;
  options.ignoreRequest =
    remoteOptions.ignoreRequest?.length > 0 ? remoteOptions.ignoreRequest.map(x => new RegExp(x)) : [];
  options.ignorePage = remoteOptions.ignorePage || [];
  options.ignoreModules = remoteOptions.ignoreModules || [];
}
