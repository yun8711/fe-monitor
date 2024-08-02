import { options } from '../common/options';
import report from '../common/report';
import { _global } from '../utils/global';
import { getLocationHref, isValidKey, normalizeObj } from '../utils';
import type { AnyObj } from '../types';
import type { ErrorInfoType, PerformanceInfoType } from '../types/global';

// 兼容判断
const supported = {
  performance: !!_global.performance,
  getEntriesByType: !!(_global.performance && _global.performance.getEntriesByType),
  PerformanceObserver: 'PerformanceObserver' in _global,
  MutationObserver: 'MutationObserver' in _global,
  PerformanceNavigationTiming: 'PerformanceNavigationTiming' in _global,
};
// 资源属性
const performanceEntryAttrs = {
  initiatorType: '',
  transferSize: 0,
  encodedBodySize: 0,
  decodedBodySize: 0,
  duration: 0,
  redirectStart: 0,
  redirectEnd: 0,
  startTime: 0,
  fetchStart: 0,
  domainLookupStart: 0,
  domainLookupEnd: 0,
  connectStart: 0,
  connectEnd: 0,
  requestStart: 0,
  responseStart: 0,
  responseEnd: 0,
  workerStart: 0,
};

/**
 * 发送页面追踪资源加载性能数据
 * (支持getEntriesByType的情况下才追踪)
 */
function traceResourcePerformance(performance: PerformanceObserverEntryList) {
  // 排除xmlhttprequest类型,服务器有响应便会记录,包括404的请求,转由http-request模块负责记录请求数据,区分请求状态
  // 同时也会排除一些其他类型,比如在引入一个script后会触发一次性能监控,它的类型是beacon,这一次的要排除
  // xmlhttprequest: XMLHttpRequest请求,
  // fetch: fetch请求,beacon: sendBeacon请求
  // css: 静态CSS文件、包含css、webp、webm等文件,
  // link：动态加载或插入的CSS文件,
  // script: 动态插入的 JavaScript文件
  const observerTypeList = ['img', 'script', 'link', 'audio', 'video', 'css', 'other'];

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  entries.forEach(entry => {
    // initiatorType含义：通过某种方式请求的资源,例如script,link..
    const { initiatorType = '', name } = entry;
    const nameCopy = name;
    const newName = replaceUriHash(nameCopy);
    const type = initiatorType.toLowerCase();
    if (options.ignoreRequest.some(reg => reg.test(name))) return;
    // 只记录observerTypeList中列出的资源类型请求,不在列表中则跳过
    if (observerTypeList.indexOf(type) < 0) return;

    // sdk内部 img 发送请求的错误不会记录
    // if (sendReaconImageList.length) {
    //   const index = sendReaconImageList.findIndex(item => item.src === entry.name);
    //
    //   if (index !== -1) {
    //     sendReaconImageList.splice(index, 1);
    //     return;
    //   }
    // }

    const value: AnyObj = {};
    Object.keys(performanceEntryAttrs).forEach(attr => {
      if (isValidKey(attr, entry)) {
        value[attr] = entry[attr];
      }
    });
    const reportData = {
      type: 'performance',
      subType: 'resource',
      data: normalizeObj({
        ...value,
        // 去除entry.name中的域名部分和hash部分
        isCache: isCache(entry),
        requestUrl: newName,
      }),
    } as PerformanceInfoType;
    // console.log('traceResourcePerformance', reportData);
    report.lazyReportCache(reportData);
  });
}

/**
 * 监听 - 异步插入的script、link、img, DOM更新操作记录
 */
function observeSourceInsert() {
  const tags = ['img', 'script', 'link'];
  // 检测异步插入的script、link、img,会有一些延迟,一些连接建立、包体大小的数据会丢失,精度下降
  // MutationObserver DOM3 Events规范,是个异步监听,只有在全部DOM操作完成之后才会调用callback
  const observer = new MutationObserver(mutationsList => {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < mutationsList.length; i += 1) {
      const startTime = Date.now();
      const { addedNodes = [] } = mutationsList[i];
      addedNodes.forEach((node: Node & { src?: string; href?: string }) => {
        const { nodeName } = node;
        if (tags.indexOf(nodeName.toLowerCase()) !== -1) {
          // 加载成功获取性能信息
          node.addEventListener('load', () => {
            const reportData = {
              type: 'performance',
              subType: 'resource',
              data: {
                requestUrl: node.src || node.href,
                duration: Date.now() - startTime,
              },
            } as PerformanceInfoType;
            // console.log('observeSourceInsert load', reportData);
            report.lazyReportCache(reportData);
          });

          // 加载失败获取性能信息
          node.addEventListener('error', () => {
            const reportData = {
              type: 'error',
              subType: 'resource',
              data: {
                requestUrl: node.src || node.href,
                duration: Date.now() - startTime,
                status: 'error',
              },
            } as ErrorInfoType;
            // console.log('observeSourceInsert error', reportData);
            report.lazyReportCache(reportData);
          });
        }
      });
    }
  });
  observer.observe(_global.document, {
    subtree: true, // 目标以及目标的后代改变都会观察
    childList: true, // 表示观察目标子节点的变化，比如添加或者删除目标子节点，不包括修改子节点以及子节点后代的变化
    // attributes: true, // 观察属性变动
    // attributeFilter: ['src', 'href'] // 要观察的属性
  });
  // observer.disconnect()
}

/**
 * 发送页面性能数据
 */
function observeNavigationTiming() {
  const times: AnyObj = {};
  const { performance } = _global;
  let t: any = performance.timing;

  times.fmp = 0; // 首屏时间 (渲染节点增量最大的时间点)
  if (supported.getEntriesByType) {
    const paintEntries = performance.getEntriesByType('paint');
    if (paintEntries.length) {
      times.fmp = paintEntries[paintEntries.length - 1].startTime;
    }

    // 优先使用 navigation v2  https://www.w3.org/TR/navigation-timing-2/
    if (supported.PerformanceNavigationTiming) {
      const nt2Timing = performance.getEntriesByType('navigation')[0];
      if (nt2Timing) t = nt2Timing;
    }
  }

  // 从开始发起这个页面的访问开始算起,减去重定向跳转的时间,在performanceV2版本下才进行计算
  // v1版本的fetchStart是时间戳而不是相对于访问起始点的相对时间
  if (times.fmp && supported.PerformanceNavigationTiming) {
    times.fmp -= t.fetchStart;
  }

  // 白屏时间 (从请求开始到浏览器开始解析第一批HTML文档字节的时间差)
  // times.fpt = t.responseEnd - t.fetchStart;

  times.tti = t.domInteractive - t.fetchStart; // 首次可交互时间

  times.ready = t.domContentLoadedEventEnd - t.fetchStart; // HTML加载完成时间

  times.loadon = t.loadEventStart - t.fetchStart; // 页面完全加载时间

  times.firstbyte = t.responseStart - t.domainLookupStart; // 首包时间

  times.dns = t.domainLookupEnd - t.domainLookupStart; // dns查询耗时

  times.appcache = t.domainLookupStart - t.fetchStart; // dns缓存时间

  times.tcp = t.connectEnd - t.connectStart; // tcp连接耗时

  times.ttfb = t.responseStart - t.requestStart; // 请求响应耗时

  times.trans = t.responseEnd - t.responseStart; // 内容传输耗时

  times.dom = t.domInteractive - t.responseEnd; // dom解析耗时

  times.res = t.loadEventStart - t.domContentLoadedEventEnd; // 同步资源加载耗时

  times.ssllink = t.connectEnd - t.secureConnectionStart; // SSL安全连接耗时

  times.redirect = t.redirectEnd - t.redirectStart; // 重定向时间

  times.unloadTime = t.unloadEventEnd - t.unloadEventStart; // 上一个页面的卸载耗时

  const reportData = {
    type: 'performance',
    subType: 'page',
    data: normalizeObj(times),
  } as PerformanceInfoType;

  // console.log('observeNavigationTiming', reportData);
  report.lazyReportCache(reportData);
}

/**
 * 页面资源加载性能数据
 */
function observeResource() {
  if (supported.performance) {
    observeNavigationTiming();
  }

  if (supported.performance && options.performance) {
    traceResourcePerformance(_global.performance);

    if (supported.PerformanceObserver) {
      // 监听异步资源加载性能数据 chrome≥52
      const observer = new PerformanceObserver(traceResourcePerformance);
      observer.observe({ entryTypes: ['resource'] });
    } else if (supported.MutationObserver) {
      // 监听资源、DOM更新操作记录 chrome≥26 ie≥11
      observeSourceInsert();
    }
  }
}

/**
 * 进一步优化的方法，替换URL中的webpack哈希为"hash"字符串，同时保留前置和结尾的字符。
 * @param url 原始URL字符串。
 * @returns 替换哈希后的URL字符串。
 */
function replaceUriHash(url: string): string {
  if (!url) return '';
  // 正则表达式匹配webpack哈希，确保哈希模式以.或/或-开头，并以.结尾，同时保留这些字符
  const hashPattern = /([\/.-])[0-9a-fA-F]+(\.\w+$)/;
  return url.replace(hashPattern, '$1XXX$2');
}

/**
 * 判断是否命中缓存
 * @param data
 */
function isCache(data: PerformanceResourceTiming) {
  // 直接从缓存读取或 304
  return data.transferSize === 0 || (data.transferSize > 0 && data.encodedBodySize === 0);
}

export function initPerformance() {
  if (!options.performance) return;

  // 初始化方法可能在onload事件之后才执行,此时不会触发load事件了 (例如delayInit)
  // 检查document.readyState属性来判断onload事件是否会被触发
  if (document.readyState === 'complete') {
    observeResource();
  } else {
    window.addEventListener('load', observeResource);
  }
}
