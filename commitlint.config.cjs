module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 以下的配置项供czg 使用
  prompt: {
    // 定义一些常用的 commit message，使用时：czg :fd
    // alias: {
    // 默认
    //   fd: "docs: fix typos",
    // },
    // 自定义命令行提问信息
    messages: {
      type: '提交类型 :',
      scope: '提交范围:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短的变更描述 :\n',
      // body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀（可选）:',
      // customFooterPrefix: '输入自定义issue前缀 :',
      // footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?',
    },
    // 自定义选择类型提示
    types: [
      { value: 'feat', name: 'feat:     新功能 | A new feature', emoji: ':sparkles:' },
      { value: 'fix', name: 'fix:      问题修复 | A bug fix', emoji: ':bug:' },
      { value: 'docs', name: 'docs:     文档更新 | Documentation only changes', emoji: ':memo:' },
      {
        value: 'style',
        name: 'style:    代码格式 | Changes that do not affect the meaning of the code',
        emoji: ':lipstick:',
      },
      {
        value: 'refactor',
        name: 'refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature',
        emoji: ':recycle:',
      },
      { value: 'perf', name: 'perf:     性能优化 | A code change that improves performance', emoji: ':zap:' },
      {
        value: 'test',
        name: 'test:     测试相关 | Adding missing tests or correcting existing tests',
        emoji: ':white_check_mark:',
      },
      {
        value: 'build',
        name: 'build:    构建相关 | Changes that affect the build system or external dependencies',
        emoji: ':package:',
      },
      {
        value: 'ci',
        name: 'ci:       持续集成 | Changes to our CI configuration files and scripts',
        emoji: ':ferris_wheel:',
      },
      { value: 'revert', name: 'revert:   回退代码 | Revert to a commit', emoji: ':rewind:' },
      {
        value: 'chore',
        name: 'chore:    其他修改 | Other changes that do not modify src or test files',
        emoji: ':hammer:',
      },
    ],
    // 在默认 types 的基础上，添加额外的 types
    // typesAppend:[],
    // 默认 types 类别列表的模糊搜索针对列表 value 字段。设置为 false 后针对列表
    typesSearchValue: true,
    // 是否开启 commit message 带有 Emoji 字符
    useEmoji: true,
    // 设置 Emoji 字符 的 位于头部位置 "left" | "center" | "right"
    emojiAlign: 'center',
    // 终端交互的主题色
    // themeColorCode: 'cyan',
    // 预设范围：string[] | Array<{ name: string, value?: string }>
    scopes: [
      { name: '基础配置', value: 'basic' },
      { name: '格式化', value: 'format' },
      { name: '核心功能', value: 'core' },
      { name: '文档', value: 'docs' },
      { name: '组件', value: 'components' },
      { name: '测试', value: 'test' },
    ],
    // 选择了scopes 定义的模块后，命令行显示该scope 对应的模块范围
    // scopeOverrides: {
    //   "test": ["e2eTest", "unitTest"]
    // },
    // 根据 scope.value 过滤模块范围中的选项
    // scopeFilters: [".DS_Store"],
    // 默认 scopes 范围列表的模糊搜索针对列表 name 字段。设置为 true 后针对列表 value 字段
    // scope 是否可多选
    // enableMultipleScopes: false,
    // 在多选模式下 模块范围 之间的分隔符
    // scopeEnumSeparator:',',
    // 是否在选择 模块范围 时显示自定义选项
    allowCustomScopes: true,
    scopesSearchValue: false,
    // 是否在选择 模块范围 显示为空选项
    allowEmptyScopes: false,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    // 是否自动将简短描述(subject)第一个字符进行大写处理
    upperCaseSubject: false,
    // 是否在重大变更时，在头部添加!号
    markBreakingChangeMode: false,
    // 允许出现 重大变更 的特定type
    allowBreakingChanges: ['feat', 'fix', 'refactor'],
    // 详细描述(body)和重大变更(BREAKING CHANGES)中根据字符超过该数值自动换行
    // breaklineNumber: 100,
    // 详细描述(body)和重大变更(BREAKING CHANGES)中换行字符
    // breaklineChar: '|',
    // 指定的哪些问题不显示:'scope' | 'body' | 'breaking' | 'footerPrefix' | 'footer' | 'confirmCommit'
    skipQuestions: ['body', 'footerPrefix', 'footer', 'confirmCommit'],
    // 自定义选择issue前缀
    // issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    // 是否在选择 ISSUE 前缀 显示自定义选项(custom)
    // allowCustomIssuePrefix: true,
    // 是否在选择 ISSUE 前缀 显示为跳过选项(skip)
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    // header 最大长度
    // maxHeaderLength: Infinity,
    // subject 最大长度,
    // maxSubjectLength: Infinity,
    // subject 最小长度
    // minSubjectLength: 0,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
    // 自定义最终的 message 格式以及输出
    // formatMessageCB:({ defaultMessage }) => defaultMessage,
    // 英文版
    // messages: {
    //   type: "Select the type of change that you're committing:",
    //   scope: "Denote the SCOPE of this change (optional):",
    //   customScope: "Denote the SCOPE of this change:",
    //   subject: "Write a SHORT, IMPERATIVE tense description of the change:\n",
    //   body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    //   breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
    //   footerPrefixesSelect: "Select the ISSUES type of changeList by this change (optional):",
    //   customFooterPrefix: "Input ISSUES prefix:",
    //   footer: "List any ISSUES by this change. E.g.: #31, #34:\n",
    //   generatingByAI: "Generating your AI commit subject...",
    //   generatedSelectByAI: "Select suitable subject by AI generated:",
    //   confirmCommit: "Are you sure you want to proceed with the commit above?",
    // },
  },
};
