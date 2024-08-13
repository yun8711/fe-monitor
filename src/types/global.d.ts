export {};

declare global {
  interface Window {
    __feMonitor__?: boolean;
  }
}

export interface InitConfig {
  remoteUrl: string; // 远程配置请求地址
  remoteVersion: string; // 远程配置版本
  host?: string; // 远程配置host，默认为当前host，可以手动指定不同的host
}

export interface RemoteConfig {
  enable: boolean; // 是否开启监控
  reportUrl: string; // 上报地址
  [key: string]: any; // 其他配置
}

export interface IAnyObject {
  [key: string]: any;
}

// 租户信息，来自localStorage的tenantObj
interface TenantObject {
  chName: string; // 租户中文名
  enName: string; // 租户英文名
  id: string; // 租户id
}

// 账号信息，来自localStorage的userInfo
interface UserObject {
  id: string; // 用户id
  name: string; // 用户名
  realName: string; // 真实姓名
}

// 项目信息，来自sessionStorage的projectObj
interface ProjectObject {
  id: string; // 项目id
  chName: string; // 项目中文名
  enName: string; // 项目英文名
}

interface Location {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  iframe: boolean;
}

// 上报数据类型
export interface ReportDataType {
  // 固定属性
  id: string;
  datetime: number; // 上报时间
  // 基本业务信息，上报前动态获取
  sessionId: string; // 会话id
  location: Location; // 页面信息
  user: UserObject | {}; // 用户信息
  tenant: TenantObject | {}; // 租户信息
  project: ProjectObject | {}; // 项目名
  // 上报数据的属性，按上报类型不同而不同
  type: 'session' | 'error' | 'behavior' | 'performance'; // 上报类型
  subType?: string;
  data?: any; // 上报的数据
  [key: string]: any;
}

// 会话信息，记录本次页面访问的信息
export interface SessionInfoType {
  id: string; // 会话id
  visitorId: string; // 浏览器指纹
  type: 'session';
  domain: string; // 域名
  branch?: string; // 代码分支
  datetime: number; // 会话开始时间
  ua: string; // 浏览器标识
  availWidth: number; // 显示屏幕的宽度
  availHeight: number; // 显示屏幕的高度
}

/**
 * 错误信息
 * 1、xhr：接口请求错误
 * 2、fetch：fetch请求错误
 * 3、code：代码错误
 * 4、console：console.error错误
 * 5、unhandledrejection：未处理的promise错误
 * 6、resource：静态资源加载错误
 * 7、crash：页面崩溃
 */
export interface ErrorInfoType extends ReportDataType {
  type: 'error'; // 错误类型
  subType: 'code' | 'console' | 'resource' | 'unhandledrejection' | 'xhr' | 'fetch' | 'crash' | 'vue'; // 错误子类型
}

/**
 * 行为信息
 * 1、pv：路由跳转
 * 2、click：点击事件
 * 3、close-page：页面正常关闭
 */
export interface BehaviorInfoType extends ReportDataType {
  type: 'behavior';
  subType: 'click' | 'pv' | 'beforeunload'; // 行为子类型
}

/**
 * 性能信息
 * 1、xhr：xhr接口加载
 * 2、fetch：fetch接口加载
 * 3、page：首屏加载
 * 4、resource：静态资源加载，['img', 'script', 'link', 'audio', 'video'];
 */
export interface PerformanceInfoType extends ReportDataType {
  type: 'performance'; // 性能类型
  subType: 'resource' | 'xhr' | 'fetch' | 'page'; // 性能子类型
}

// xhr.open方法的参数
export type XhrOpenArgs = [method: string, url: string, async?: boolean, user?: string, password?: string];
