export type VoidFun = {
  (...args: any[]): void;
};

export type AnyFun = {
  (...args: any[]): any;
};

export type AnyObj<T = any> = {
  [key: string]: T;
};
