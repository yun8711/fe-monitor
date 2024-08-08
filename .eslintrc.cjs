// @see https://github.com/element-plus/element-plus/blob/dev/internal/eslint-config/index.js

module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    // 告诉eslint，tsconfig 在哪
    project: ['tsconfig.json'],
    sourceType: 'module',
    // // ？？仅允许 import export 语句出现在模块的顶层
    // allowImportExportEverywhere: false,
    // ecmaFeatures: {
    //   // 不允许 return 语句出现在 global 环境下
    //   globalReturn: false,
    //   // 开启全局严格模式
    //   impliedStrict: true,
    //   jsx: true,
    // },
  },
  extends: [
    // ESLint 内置规则，推荐用来检查常规的 JavaScript 代码
    'eslint:recommended',
    // 插件eslint-plugin-jsonc：检查 JSON文件
    'plugin:jsonc/recommended-with-jsonc',
    // 'plugin:markdown/recommended',
    // eslint-plugin-vue 插件，检查 Vue.js 3.0 代码
    // 'plugin:vue/vue3-recommended',
    // 插件@typescript-eslint/eslint-plugin；针对TypeScript代码的推荐规则；关闭与eslint 冲突的规则
    'plugin:@typescript-eslint/recommended',
    // 插件：eslint-plugin-import：用于检查 ES6 的模块导入和导出语句
    'plugin:import/recommended',
    'plugin:import/typescript',
    // eslint-plugin-prettier 插件，将 Prettier 的格式化规则作为 ESLint 规则来运行
    'plugin:prettier/recommended',
  ],
  // 对不同类型的文件，指定更加具体的解析器和规则
  overrides: [
    // 所有json 文件使用jsonc-eslint-parser解析器
    {
      files: ['*.json', '*.json5', '*.jsonc'],
      parser: 'jsonc-eslint-parser',
    },
    // {
    //   files: ['**/__tests__/**'],
    //   rules: {
    //     'no-console': 'off',
    //     'vue/one-component-per-file': 'off',
    //   },
    // },
    // 对package.json 文件属性进行排序
    {
      files: ['package.json'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/sort-keys': [
          'error',
          {
            pathPattern: '^$',
            order: [
              'name',
              'version',
              'private',
              'packageManager',
              'description',
              'type',
              'keywords',
              'homepage',
              'bugs',
              'license',
              'author',
              'contributors',
              'funding',
              'files',
              'main',
              'module',
              'exports',
              'unpkg',
              'jsdelivr',
              'browser',
              'bin',
              'man',
              'directories',
              'repository',
              'publishConfig',
              'scripts',
              'peerDependencies',
              'peerDependenciesMeta',
              'optionalDependencies',
              'dependencies',
              'devDependencies',
              'engines',
              'config',
              'overrides',
              'pnpm',
              'husky',
              'lint-staged',
              'eslintConfig',
            ],
          },
          {
            pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies$',
            order: { type: 'asc' },
          },
        ],
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'import/no-duplicates': 'off',
        // 'import/no-duplicates': 'warn',
        // '@typescript-eslint/ban-types': 'warn',
        // '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],

  /**
   * "off" 或 0    ==>  关闭规则
   * "warn" 或 1   ==>  打开的规则作为警告（不影响代码执行）
   * "error" 或 2  ==>  规则作为一个错误（代码不能执行，界面报错）
   */
  rules: {
    // eslint (http://eslint.cn/docs/rules)
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    // 不允许使用未声明的变量 https://eslint.org/docs/latest/rules/no-undef
    'no-undef': 'off',
    'no-multiple-empty-lines': ['error', { max: 1 }], // 不允许多个空行
    'no-useless-escape': 'off', // 禁止不必要的转义字符,
    // "no-unexpected-multiline": "error", // 禁止空余的多行
    // "prefer-const": "off", // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    // "no-use-before-define": "off", // 禁止在 函数/类/变量 定义之前使用它们
    // "no-redeclare": "off",
    // "no-self-assign": "off",

    // eslint-plugin-import (https://www.npmjs.com/package/eslint-plugin-import)
    // analysis/correctness
    'import/no-unresolved': 'off',
    // "import/named": "error",
    'import/namespace': 'off',
    // "import/default": "error",
    'import/export': 'off',

    // red flags (thus, warnings)
    // "import/no-named-as-default": "warn",
    // "import/no-named-as-default-member": "warn",
    'import/no-duplicates': 'error', // 多次引用同一个模块
    // 排序
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        // pathGroups: [
        //   {
        //     pattern: 'vue',
        //     group: 'external',
        //     position: 'before',
        //   },
        //   {
        //     pattern: '@vue/**',
        //     group: 'external',
        //     position: 'before',
        //   },
        //   {
        //     pattern: '@element-plus/**',
        //     group: 'internal',
        //   },
        // ],
        pathGroupsExcludedImportTypes: ['type'],
      },
    ],
    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // 禁止未使用的变量
    // '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
    // "@typescript-eslint/no-inferrable-types": "off", // 可以轻松推断的显式类型可能会增加不必要的冗长
    // "@typescript-eslint/no-namespace": "off", // 禁止使用自定义 TypeScript 模块和命名空间
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/ban-types': 'off', // 禁止使用特定类型
    '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 函数导入模块
    // "@typescript-eslint/no-empty-function": "off", // 禁止空函数
    '@typescript-eslint/no-non-null-assertion': 'off', // 不允许使用后缀运算符的非空断言(!)
    // "@typescript-eslint/semi": "off",  // 要求或禁止使用分号代替 ASI
    '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
    // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    // '@typescript-eslint/ban-ts-comment': ['off', { 'ts-ignore': false }],
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false }],

    '@typescript-eslint/no-empty-function': 'off',
    // 不允许在不合适的地方使用 Promise 值
    '@typescript-eslint/no-misused-promises': 'error',

    // 不允许 for-in Array
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    // 避免非必要的布尔值比较
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    // switch 语句需要覆盖所有可能情况
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    // 禁止将没有 await 的函数标记为 async
    '@typescript-eslint/require-await': 'error',
    // 不允许给能自动推断出类型的 primitive 类型变量额外添加类型声明
    '@typescript-eslint/no-inferrable-types': 'error',
    // 不允许在范型和返回值之外的地方使用 void 类型
    '@typescript-eslint/no-invalid-void-type':'error',
    // 不可变的私有属性标记成 readonly
    '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: true }]
  }
};
