import { resolve } from 'path';
import type { UserConfigExport } from 'vite';

export default (): UserConfigExport => {
  return {
    /**
     * 插件配置
     *
     * @see plugins https://cn.vitejs.dev/config/shared-options.html#plugins
     */
    plugins: [],
    css: {},
    /**
     * 构建配置项
     *
     * @see 构建选项 https://cn.vitejs.dev/config/build-options.html
     */
    build: {
      target: 'modules' /** 这是指支持原生 ES 模块、原生 ESM 动态导入 */,
      // minify: 'terser' /** 压缩代码 */,
      chunkSizeWarningLimit: 2 /** 打包的组件超过 2kb 警告提示 */,
      reportCompressedSize: false /** 启用 gzip 压缩大小报告 */,
      emptyOutDir: true,
      outDir: resolve(__dirname, './dist') /** 指定输出路径 */,
      // terserOptions: {
      //   // 清除console和debugger
      //   compress: {
      //     drop_console: true,
      //     drop_debugger: true,
      //   },
      // },
      /**
       * 库模式
       *
       * @see 库模式 https://cn.vitejs.dev/guide/build.html#library-mode
       */
      lib: {
        // 库模式下，必须声明入口文件
        entry: [resolve(__dirname, 'src/index.ts')],
        // name: 'KDMonitor',
      },
      /**
       * rollup 配置项
       * @see https://cn.rollupjs.org/configuration-options/
       */
      rollupOptions: {
        output: [
          {
            format: 'es',
            entryFileNames: 'index.js',
            exports: 'named',
          },
          {
            format: 'umd',
            entryFileNames: 'index.umd.js',
            name: 'KDMonitor',
            exports: 'named',
          },
        ],
      },
    },
  };
};

/** 打包结束之后将一些静态文件进行移入 */
// const moveGlobalDts = (): void => {
//   const files = [{ input: './packages/elp/global.d.ts', outDir: 'dist/global.d.ts' }] as const;
//   files.forEach((item): void => {
//     copyFileSync(item.input, item.outDir);
//   });
// };
