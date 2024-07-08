/**
 * 页面崩溃监听
 * 页面正常关闭时，会触发beforeunload事件，但是页面崩溃时，不会触发beforeunload事件
 */

import { options } from '../common/options';
import report from '../common/report';
import type { BehaviorInfoType } from '../types/global';

function initPageCrash() {
  if (!options.crash || !options.reportUrl) return;
  const blob = new Blob(
    [
      `
    let lastUpdateTime = Date.now();
    let sessionId = '';
    self.onmessage = function(event) {
      // console.log('Worker received message:', event.data);
      if (event.data.type === 'update') {
        lastUpdateTime = Date.now();
        sessionId=event.data.sessionId;
      }
    };

    function checkForInactivity() {
      if (Date.now() - lastUpdateTime > Number(${options.crashTimeout})) {
        fetch('${options.reportUrl}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'error',
            subtype: 'crash',
            sessionId: sessionId, // Make sure to replace this with the actual session ID
            timestamp: Date.now(),
            location:{},
            user:{},
            tenant:{},
            project:{},
            data:{}
          }),
        }).catch(error => console.error('[fe-monitor] "initPageCrash - crash" Error sending crash data', error));
      }
    }

    // 每10秒检查一次页面是否有活动
    setInterval(checkForInactivity, 10000);
    `,
    ],
    { type: 'application/javascript' },
  );
  const workerBlobURL = URL.createObjectURL(blob);
  const worker = new Worker(workerBlobURL);

  setInterval(() => {
    const sessionId = sessionStorage.getItem('FE_MONITOR_SESSION_ID');
    worker.postMessage({ type: 'update', sessionId });
  }, options.crashInterval);
  // 页面正常关闭时，触发beforeunload事件
  window.addEventListener('beforeunload', () => {
    // worker.postMessage({ type: 'beforeunload' });
    worker.terminate(); // 直接停止 Worker
    report.lazyReportCache({
      type: 'behavior',
      subType: 'beforeunload',
      data: {},
    } as BehaviorInfoType);
  });
}

export { initPageCrash };
