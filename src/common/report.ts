import { post } from '../utils/request';
import { options } from './options';
import cache from './cache';
import type { ReportDataType, SessionInfoType } from '../types/global';

class Report {
  timeout: number;
  // 是否支持sendBeacon
  // isSupportSendBeacon: boolean;
  // 定时器
  timer: number | null;

  constructor() {
    this.timeout = options.timeout || 3000;
    // this.isSupportSendBeacon = !!window.navigator?.sendBeacon;
    this.timer = null;
    this.beforeUnloadReport();
  }

  xhrReport(data: (ReportDataType | SessionInfoType)[]) {
    if (!options.enable) return;
    if (!options.reportUrl) return;
    post(options.reportUrl, data);
    if (options.log) {
      this.logReport(data);
    }
  }

  logReport(data: object) {
    if (options.log) {
      console.group('[fe-monitor] 数据上报:');
      console.info(data);
      console.groupEnd();
    }
  }

  report(data: (ReportDataType | SessionInfoType)[], immediate = false) {
    // console.log('[fe-monitor] report data', data);
    if (immediate) {
      this.xhrReport(data);
      return;
    }

    if (window.requestIdleCallback) {
      window.requestIdleCallback(
        () => {
          this.xhrReport(data);
        },
        { timeout: this.timeout },
      );
    } else {
      setTimeout(() => {
        this.xhrReport(data);
      }, 0);
    }
  }

  lazyReportCache(data: ReportDataType | SessionInfoType) {
    cache.addCache(data);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      const cacheData = cache.getCache();
      // console.log('[fe-monitor] cacheData', cacheData);
      if (!cacheData.length || cacheData.length < options.maxCache) return;
      this.report(cacheData);
      cache.clearCache();
    }, this.timeout) as unknown as number;
  }

  // 如果监听到beforeunload事件，立即上报所有数据
  beforeUnloadReport() {
    window.addEventListener('beforeunload', () => {
      const cacheData = cache.getCache();
      if (!cacheData.length) return;
      this.report(cacheData, true);
    });
  }
}

export default new Report();
