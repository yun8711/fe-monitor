import { initClick } from './lib/click';
import { initError, parseError } from './lib/error';
import { initPageCrash } from './lib/page-crash';
import { initPerformance } from './lib/performance';
import { initPv } from './lib/pv';
import { _global } from './utils/global';
import { initConfig, loadConfig, options as baseOptions } from './common/options';
import { initSession } from './lib/session';
import { initHttp } from './lib/http';
import report from './common/report';

import type { ErrorInfoType, InitConfig, RemoteConfig } from './types/global';

// 初始化
async function init(options: InitConfig) {
  // 判断是否已经初始化，防止重复初始化；初始化过各中，会向全局挂载一个__webTracingInit__标识
  if (window.__feMonitor__) return;

  // 1、从远程获取配置
  const remoteConfig = await loadConfig(options);
  if (!remoteConfig) return;
  // 2、初始化配置参数
  initConfig(remoteConfig as RemoteConfig);
  if (baseOptions.log) console.log('[fe-monitor] 配置参数', baseOptions);
  if (!baseOptions.enable) return;
  // 3、初始化会话信息
  initSession();
  // 5、注册各个监听事件
  // http请求监控
  initHttp();
  // 错误监听
  initError();
  // 跳由监控
  initPv();
  // 点击事件监听
  initClick();
  // 性能监控
  initPerformance();
  // 页面崩溃监控
  initPageCrash();

  _global.__feMonitor__ = true;
}

async function initV2(Vue: any, options: any) {
  const handler = Vue.config?.errorHandler;
  Vue.config.errorHandler = function (err: Error, vm: any, info: string): void {
    report.lazyReportCache({
      type: 'error',
      subType: 'vue',
      data: {
        eventId: 'code',
        ...parseError(err),
      },
    } as ErrorInfoType);

    if (handler) handler.apply(null, [err, vm, info]);
  };
  await init(options);
}

async function initVue3(Vue: any, options: any) {
  await init(options);
}

export { init, initV2, initVue3 };
