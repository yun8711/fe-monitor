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
    let monitoringActive = true;  // 页面是否活跃
    let crashReported = false;  // 是否已经上报
    let lastUpdateTime = Date.now();  // 前一次监听触发的时间
    let sessionId = '';

    self.onmessage = function(event) {
      // console.log('Worker received message:', event.data);
      if (event.data.type === 'update') {
        lastUpdateTime = Date.now();
        sessionId=event.data.sessionId;
      } else if (event.data.type === 'pause') {
        monitoringActive = false;
      } else if (event.data.type === 'resume') {
        monitoringActive = true;
      }
    };

    function checkForInactivity() {
      if (!monitoringActive) return; // 如果页面失活，则不检查
      if (Date.now() - lastUpdateTime > Number(${options.crashTimeout}) && !crashReported) {
        crashReported = true; // Ensure crash is reported only once
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
  const updateSessionId = () => {
    const sessionId = sessionStorage.getItem('FE_MONITOR_SESSION_ID');
    worker.postMessage({ type: 'update', sessionId });
  };

  setInterval(updateSessionId, options.crashInterval);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // isPageActive = false;
      worker.postMessage({ type: 'pause' });
    } else {
      // isPageActive = true;
      worker.postMessage({ type: 'resume' });
      updateSessionId(); // Ensure session ID is current upon resuming
    }
  });
  // 页面正常关闭时，触发beforeunload事件
  window.addEventListener('beforeunload', () => {
    worker.terminate(); // 直接停止 Worker
    report.lazyReportCache({
      type: 'behavior',
      subType: 'beforeunload',
      data: {},
    } as BehaviorInfoType);
  });
}

export { initPageCrash };
