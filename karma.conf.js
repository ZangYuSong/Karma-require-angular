// Karma configuration
// Generated on Sat Jan 13 2018 13:43:46 GMT+0800 (中国标准时间)

module.exports = function(config) {
  config.set({
    // 基础路径，用在files，exclude属性上
    "basePath": "./",

    // 测试框架
    // 可用的框架: https://npmjs.org/browse/keyword/karma-adapter
    "frameworks": ["jasmine", "requirejs"],

    // 需要加载到浏览器的文件列表
    // {pattern: 'src/**/*', included: false}
    // false 表示初始化的时候不会使用 script 标签直接将相关 js 引入到浏览器，需要自己写代码加载
    "files": [
      "lib/angular-1.4.6/angular.js",
      "lib/angular-1.4.6/angular-mocks.js",
      "lib/require-2.1.11/require.js",
      "test-main.js",
      "src/**/*.js",
      "test/**/*.spec.js"
    ],

    // 排除的文件列表
    "exclude": [],

    // 在浏览器使用之前处理匹配的文件
    // 可用的预处理: https://npmjs.org/browse/keyword/karma-preprocessor
    "preprocessors": {
      "src/**/*.js": ["coverage"]
    },

    // 覆盖率报告器配置
    "coverageReporter": {
      "type": "html",
      "dir": "coverage"
    },

    // 使用测试结果报告者
    // 可能的值: 'dots', 'progress'
    // 可用的报告者: https://npmjs.org/browse/keyword/karma-reporter
    "reporters": ["progress", "coverage"],

    // 服务端口号
    "port": 9876,

    // 启用或禁用输出报告或者日志中的颜色
    "colors": true,

    // 日志等级
    // config.LOG_DISABLE 不输出信息
    // config.LOG_ERROR 只输出错误信息
    // config.LOG_WARN 只输出警告信息
    // config.LOG_INFO 输出全部信息
    // config.LOG_DEBUG 输出调试信息
    "logLevel": config.LOG_INFO,

    // 启用或禁用自动检测文件变化进行测试
    "autoWatch": true,

    // 测试启动的浏览器
    // 可用的浏览器: https://npmjs.org/browse/keyword/karma-launcher
    "browsers": ["Chrome"],

    // 开启或禁用持续集成模式
    // 设置为true, Karma将打开浏览器，执行测试并最后退出
    "singleRun": true,

    // 并发级别
    // 启动的浏览器数
    "concurrency": Infinity
  });
};
