import { isFunction } from './is';
import type { AnyFun, AnyObj } from '../types';

/**
 * 获取时间戳
 */
export function getTimeStamp() {
  return Date.now();
}

/**
 * 生成UUID，可指定长度和基数
 */
export function generateUUID(len = 16, radix = 32): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const uuid = [];
  let i: number;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    let r: number;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

/**
 * 从对象中获取指定属性值，返回新的对象
 */
export function pickObject<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

/**
 * 重写对象上面的某个属性
 * @param source 需要被重写的对象
 * @param name 需要被重写对象的key
 * @param replacement 以原有的函数作为参数，执行并重写原有函数
 * @param isForced 是否强制重写（可能原先没有该属性）
 */
export function replaceAop(source: AnyObj, name: string, replacement: AnyFun, isForced = false): void {
  if (source === undefined) return;
  if (name in source || isForced) {
    const original = source[name];
    const wrapped = replacement(original);
    if (isFunction(wrapped)) {
      source[name] = wrapped;
    }
  }
}
