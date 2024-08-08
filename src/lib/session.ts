import { reactive } from 'vue';
import { generateUUID, getTimeStamp } from '../utils/common';
import report from '../common/report';
import type { SessionInfoType } from '../types/global';

export const sessionInfo: SessionInfoType = reactive({
  id: '',
  visitorId: '',
  type: 'session',
  domain: '',
  datetime: 0,
  ua: '',
  availWidth: 0,
  availHeight: 0,
});

export function initSession() {
  const visitorId = localStorage.getItem('FE_MONITOR_VISITOR_ID');
  if (visitorId) {
    sessionInfo.visitorId = visitorId;
  } else {
    const result = generateUUID();
    sessionInfo.visitorId = result;
    localStorage.setItem('FE_MONITOR_VISITOR_ID', result);
  }
  sessionInfo.id = generateUUID();
  sessionStorage.setItem('FE_MONITOR_SESSION_ID', sessionInfo.id);
  sessionInfo.datetime = getTimeStamp();
  sessionInfo.domain = window.location.host;
  sessionInfo.ua = window.navigator.userAgent;
  sessionInfo.availWidth = window.screen.availWidth;
  sessionInfo.availHeight = window.screen.availHeight;
  report.lazyReportCache(sessionInfo);
}
