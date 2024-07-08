import { getTimeStamp, pickObject } from '../utils/common';
// import { sessionInfo, config } from './config';
import { sessionInfo } from '../lib/session';
import { options } from './options';
import type { ReportDataType, SessionInfoType } from '../types/global';

class Cache {
  private readonly cache: (ReportDataType | SessionInfoType)[];

  constructor() {
    this.cache = [];
  }

  getCache() {
    return JSON.parse(JSON.stringify(this.cache));
    // return this.cache;
  }

  /**
   * 添加采集到的原始数据到缓存
   * @param data
   */
  addCache(data: ReportDataType | SessionInfoType) {
    this.addProperty(data);
    this.cache.push(data);
    // if (options.log) console.info('[fe-monitor] add cache', data);
  }

  clearCache() {
    this.cache.length = 0;
  }

  private addProperty(data: ReportDataType | SessionInfoType) {
    if (data.type !== 'session') {
      data.datetime = getTimeStamp();
      data.sessionId = sessionInfo.id;
      data.location = <Location>(
        pickObject(window.location, [
          'hash',
          'host',
          'hostname',
          'href',
          'origin',
          'pathname',
          'port',
          'protocol',
          'search',
        ])
      );
      const isLogin = localStorage.getItem('isLogin') === 'true';
      if (!isLogin) {
        data.user = {};
        data.tenant = {};
        data.project = {};
        return;
      }
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const loginInfo = JSON.parse(userInfoStr);
        data.user = pickObject(loginInfo, ['name', 'id', 'realName']);
      } else {
        data.user = {};
      }

      const tenantInfoStr = localStorage.getItem('tenantObj');
      if (tenantInfoStr) {
        const tenantInfo = JSON.parse(tenantInfoStr);
        data.tenant = pickObject(tenantInfo, ['id', 'enName', 'chName']);
      } else {
        data.tenant = {};
      }

      const projectInfoStr = localStorage.getItem('projectObj');
      if (projectInfoStr) {
        const projectInfo = JSON.parse(projectInfoStr);
        data.project = pickObject(projectInfo, ['id', 'enName', 'chName']);
      } else {
        data.project = {};
      }
    }
  }
}

export default new Cache();
