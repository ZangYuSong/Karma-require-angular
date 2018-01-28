# 单元测试 Karma + Jasmine

## 前言

> Karma has primarily been designed for low level (unit) testing. If it's an AngularJS app, you can
> use Karma with karma-ng-scenario plugin, however we recommend Protractor for high level testing.
> Karma 侧重于单元测试（也可以做端对端测试，只是远没有 Protractor 好用，上面的文字就是摘自 Karma 官网）， Protractor 侧重于端对端测试。

## Karma

### 环境搭建

**Jasmine 做单元测试，Karma 自动化完成单元测试**

* 使用 node 安装，使用 npm 或者 yarn 安装
  `npm install karma --save-dev` 或者 `yarn add karma`
* 执行 `karma init` 初始化 karma 的配置信息 `karma.conf.js`
* 执行 `yarn add jasmine-core` 和 `yarn add requirejs`，安装对应的 jsamine 和 requirejs
* 执行 `karma start` 就可以将项目跑起来
* 代码测试的覆盖率 `yarn add karma-coverage`，配置好对应信息。启动之后会生成对应的 html 文件，打开就是代码测试覆盖率的详细信息。

```js
module.exports = function(config) {
  config.set({
    // 基础路径，用在files，exclude属性上
    basePath: "./",

    // 测试框架
    // 可用的框架: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "requirejs"],

    // 需要加载到浏览器的文件列表
    // {pattern: 'src/**/*', included: false}
    // false 表示初始化的时候不会使用 script 标签直接将相关 js 引入到浏览器，需要自己写代码加载
    files: [
      "lib/angular-1.4.6/angular.js",
      "lib/angular-1.4.6/angular-mocks.js",
      "lib/require-2.1.11/require.js",
      "test-main.js",
      "src/**/*.js",
      "test/**/*.spec.js"
    ],

    // 排除的文件列表
    exclude: [],

    // 在浏览器使用之前处理匹配的文件
    // 可用的预处理: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "src/**/*.js": ["coverage"]
    },

    // 覆盖率报告器配置
    coverageReporter: {
      type: "html",
      dir: "coverage"
    },

    // 使用测试结果报告者
    // 可能的值: 'dots', 'progress'
    // 可用的报告者: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress", "coverage"],

    // 服务端口号
    port: 9876,

    // 启用或禁用输出报告或者日志中的颜色
    colors: true,

    // 日志等级
    // config.LOG_DISABLE 不输出信息
    // config.LOG_ERROR 只输出错误信息
    // config.LOG_WARN 只输出警告信息
    // config.LOG_INFO 输出全部信息
    // config.LOG_DEBUG 输出调试信息
    logLevel: config.LOG_INFO,

    // 启用或禁用自动检测文件变化进行测试
    autoWatch: true,

    // 测试启动的浏览器
    // 可用的浏览器: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome"],

    // 开启或禁用持续集成模式
    // 设置为true, Karma将打开浏览器，执行测试并最后退出
    singleRun: true,

    // 并发级别
    // 启动的浏览器数
    concurrency: Infinity
  });
};
```

## angularJS 配合 karma 进行单元测试

### mock

> 在开始写测试之前，我们需要理解测试的一个核心特性：模拟。模拟允许我们在受控环境下定义模拟对象来模仿真实对象的行为。AngularJS 提供了自己的模拟库：angular-mocks，位于 angular-mock.js 文件中，因此如果要在单元测试中建立模拟对象，就必须确保在 Karma 配置中，即 test/karma.conf.js 文件的 file 数组中包含了 angular-mock.js。

### ng-mock

#### angular.mock.module

此方法非常方便调用，因为 angular.mock.module 函数被发布在全局作用域的 window 接口上了。

module 是用来配置 inject 方法注入的模块信息,参数可以是字符串,函数,对象,它一般用在 beforeEach 方法里,因为这个可以确保在执行测试任务的时候,inject 方法可以获取到模块配置。

#### angular.mock.inject

inject 函数也是在 window 对象上的，为的是全局访问，因此可以直接调用 inject。

inject 是用来注入上面配置好的 ng 模块,方便在 it 的测试函数里调用。

```js
describe("test controller demo1", function() {
  var angular = window.angular;
  var module = angular.mock.module;
  var inject = angular.mock.inject;
  var _scope, _controller;
  beforeEach(function() {
    module("demo1");
    inject([
      "$controller",
      "$rootScope",
      function($controller, $rootScope) {
        _scope = $rootScope.$new();
        _controller = $controller;
      }
    ]);
  });

  it("demo1Controller", function() {
    _controller("demo1Controller", { $scope: _scope });
    expect(_scope.name).toEqual("demo1");
  });
  it("demo2Controller", function() {
    _controller("demo2Controller", { $scope: _scope });
    expect(_scope.name).toEqual("demo2");
  });
});
```

#### \$httpBackend

angualr 内置了 \$httpBackend 模拟库，这样我们可以在应用中模拟任何外部的 XHR 请求，避免在测试中创建昂贵的 \$http 请求。

```js
// controller
var angular = window.angular;
var app = angular.module("Application", []);
var module = angular.mock.module;
var inject = angular.mock.inject;
app.controller("MainCtrl", function($scope, $http) {
  $http.get("Users/users.json").success(function(data) {
    $scope.users = data;
  });
  $scope.text = "Hello World!";
});

// spec
describe("MainCtrl", function() {
  var scope, httpBackend;
  beforeEach(module("Application"));
  beforeEach(
    inject([
      "$rootScope",
      "$controller",
      "$httpBackend",
      function($rootScope, $controller, $httpBackend) {
        httpBackend = $httpBackend;
        httpBackend.when("GET", "Users/users.json").respond([
          {
            id: 1,
            name: "Bob"
          },
          {
            id: 2,
            name: "Jane"
          }
        ]);
        scope = $rootScope.$new();
        $controller("MainCtrl", { $scope: scope });
      }
    ])
  );
  it('should have variable text = "Hello World!"', function() {
    expect(scope.text).toBe("Hello World!");
  });
  it("should fetch list of users", function() {
    httpBackend.flush();
    expect(scope.users.length).toBe(2);
    expect(scope.users[0].name).toBe("Bob");
  });
});
```

##### when

`when(method, url, [data], [headers]);`新建一个后端定义

##### expect

`expect(method, url, [data], [headers]);`新建一个请求期望

* method: 表示 http 方法注意都需要是大写(GET, PUT…)。
* url: 请求的 url 可以为正则或者字符串。
* data: 请求时带的参数。
* headers: 请求时设置的 header。
* when 和 expect 都会返回一个带 respond 方法的对象。respond 方法有 3 个参数 。status，data，headers 通过设置这 3 个参数就可以伪造返回的响应数据了。
* \$httpBackend.when 与 \$httpBackend.expect 的区别在于: \$httpBackend.expect 的伪后台只能被调用一次(调用一次后会被清除)，第二次调用就会报错。

**快捷方法: when 和 expect 都有对应的快捷方法 whenGET, whenPOST,whenHEAD, whenJSONP, whenDELETE, whenPUT; expect 也一样**

##### resetExpectations

移除所有的 expect 而对 when 没有影响

##### flush

刷新一次，模拟后端返回请求，在调用这个命令之前，success 中的回调函数不会被执行

## Jasmine 基本语法

### describe(string, function)

* 可以理解为是一个测试集或者测试包（官方称之为 suite），主要功能是用来划分单元测试的，describe 是可以嵌套使用的
* string：描述测试包的信息
* function：测试集的具体实现，可包含任意代码

### it(string, function)

* 测试用例（官方称之为 spec）
* string：描述测试用例的信息
* function：测试用例的具体实现，可包含任意代码

### expect：断言表达式

1. 每个测试文件中可以包含多个 describe.
2. 每个 describe 中可以包含多个 it.
3. 每个 it 中可以包含多个 expect.
4. describe 可嵌套使用.

```js
describe("Jasmine Test 1", function() {
  it("a spec with an expectation", function() {
    expect(1).toBe(1);
    expect(1 === 1).toBe(true);
    expect("a").not.toBe("b");
  });

  it("an other spec in current suite", function() {
    expect(true).toBe(true);
  });
});
```

#### toBe

基本类型判断

```js
it("The 'toBe' matcher compares with ===", function() {
  var a = 12;
  var b = a;
  expect(a).toBe(b);
  expect(a).not.toBe(null);
});
```

#### toEqual

除了能判断基本类型（相当于"toBe"），还能判断对象

```js
it("should work for objects", function() {
  var foo = {
    a: 12,
    b: 34
  };
  var bar = {
    a: 12,
    b: 34
  };
  expect(foo).toEqual(bar);
});
```

#### toMatch

使用正则表达式判断

```js
it("The 'toMatch' matcher is for regular expressions", function() {
  var message = "foo bar baz";
  expect(message).toMatch(/bar/);
  expect(message).toMatch("bar");
  expect(message).not.toMatch(/quux/);
});
```

#### toBeDefined

判断是否定义

```js
it("The 'toBeDefined' matcher compares against 'undefined'", function() {
  var a = {
    foo: "foo"
  };
  expect(a.foo).toBeDefined();
  expect(a.bar).not.toBeDefined();
});
```

#### toBeUndefined

判断是否是 undefined，与"toBeDefined"相反

```js
it("The 'toBeUndefined' matcher compares against 'undefined'", function() {
  var a = {
    foo: "foo"
  };
  expect(a.foo).not.toBeUndefined();
  expect(a.bar).toBeUndefined();
});
```

#### toBeNull

判断是否为 null

```js
it("The 'toBeNull' matcher compares against null", function() {
  var a = null;
  var foo = "foo";
  expect(null).toBeNull();
  expect(a).toBeNull();
  expect(foo).not.toBeNull();
});
```

#### toBeTruthy

判断是否是 true

```js
it("The 'toBeTruthy' matcher is for boolean casting testing", function() {
  var a,
    foo = "foo";
  expect(foo).toBeTruthy();
  expect(a).not.toBeTruthy();
  expect(true).toBeTruthy();
});
```

#### toBeFalsy

判断是否是 false

```js
it("The 'toBeFalsy' matcher is for boolean casting testing", function() {
  var a,
    foo = "foo";
  expect(a).toBeFalsy();
  expect(foo).not.toBeFalsy();
  expect(false).toBeFalsy();
});
```

#### toContain

判断数组是否包含（可判断基本类型和对象）

```js
it("The 'toContain' matcher is for finding an item in an Array", function() {
  var a = ["foo", "bar", "baz"];
  var b = [{ foo: "foo", bar: "bar" }, { baz: "baz", bar: "bar" }];
  expect(a).toContain("bar");
  expect(a).not.toContain("quux");
  expect(b).toContain({ foo: "foo", bar: "bar" });
  expect(b).not.toContain({ foo: "foo", baz: "baz" });
});
```

#### toBeLessThan

判断值类型的大小，结果若小则为 True（也可以判断字符及字符串，以 ascii 码的大小为判断依据）

```js
it("The 'toBeLessThan' matcher is for mathematical comparisons", function() {
  var pi = 3.1415926,
    e = 2.78;
  expect(e).toBeLessThan(pi);
  expect(pi).not.toBeLessThan(e);
  expect("a").toBeLessThan("b");
  expect("b").not.toBeLessThan("a");
});
```

#### toBeGreaterThan

判断值类型的大小，结果若大则为 True，与 toBeLessThan 相反（也可以判断字符及字符串，以 ascii 码的大小为判断依据）

```js
it("The 'toBeGreaterThan' matcher is for mathematical comparisons", function() {
  var pi = 3.1415926,
    e = 2.78;
  expect(pi).toBeGreaterThan(e);
  expect(e).not.toBeGreaterThan(pi);
  expect("a").not.toBeGreaterThan("b");
  expect("b").toBeGreaterThan("a");
});
```

#### toBeCloseTo

判断数字是否相似（第二个参数为小数精度，默认为 2 位）

```js
it("The 'toBeCloseTo' matcher is for precision math comparison", function() {
  var a = 1.1;
  var b = 1.5;
  var c = 1.455;
  var d = 1.459;
  expect(a).toBeCloseTo(b, 0);
  expect(a).not.toBeCloseTo(c, 1);
  expect(c).toBeCloseTo(d);
});
```

#### toThrow

判断是否抛出异常

```js
it("The 'toBeCloseTo' matcher is for precision math comparison", function() {
  var a = 1.1;
  var b = 1.5;
  var c = 1.455;
  var d = 1.459;
  expect(a).toBeCloseTo(b, 0);
  expect(a).not.toBeCloseTo(c, 1);
  expect(c).toBeCloseTo(d);
});
```

#### toThrowError

判断是否抛出了指定的错误

```js
it("The 'toThrowError' matcher is for testing a specific thrown exception", function() {
  var foo = function() {
    throw new TypeError("foo bar baz");
  };
  expect(foo).toThrowError("foo bar baz");
  expect(foo).toThrowError(/bar/);
  expect(foo).toThrowError(TypeError);
  expect(foo).toThrowError(TypeError, "foo bar baz");
});
```

#### fail

使一个测试用例失败，参数为自定义的失败信息

```js
describe("A spec using the fail function", function() {
  var foo = function(x, callBack) {
    if (x) {
      callBack();
    }
  };
  it("should not call the callBack", function() {
    foo(false, function() {
      fail("Callback has been called");
    });
  });
});
```

### 初始化/销毁

Jasmine 允许在执行测试集/测试用例的开始前/结束后做一些初始化/销毁的操作

#### beforeAll

每个 suite（即 describe）中所有 spec（即 it）运行之前运行

#### beforeEach

每个 spec（即 it）运行之前运行

#### afterAll

每个 suite（即 describe）中所有 spec（即 it）运行之后运行

#### afterEach

每个 spec（即 it）运行之后运行

```js
var globalCount;
describe("Setup and Teardown suite 1", function() {
  var suiteGlobalCount;
  var eachTestCount;

  beforeAll(function() {
    globalCount = 0;
    suiteGlobalCount = 0;
    eachTestCount = 0;
  });

  afterAll(function() {
    suiteGlobalCount = 0;
  });

  beforeEach(function() {
    globalCount++;
    suiteGlobalCount++;
    eachTestCount++;
  });

  afterEach(function() {
    eachTestCount = 0;
  });

  it("Spec 1", function() {
    expect(globalCount).toBe(1);
    expect(suiteGlobalCount).toBe(1);
    expect(eachTestCount).toBe(1);
  });

  it("Spec 2", function() {
    expect(globalCount).toBe(2);
    expect(suiteGlobalCount).toBe(2);
    expect(eachTestCount).toBe(1);
  });
});

describe("Setup and Teardown suite 2", function() {
  beforeEach(function() {
    globalCount += 2;
  });

  it("Spec 1", function() {
    expect(globalCount).toBe(4);
  });
});
```

#### this 对象

beforeEach-it-afterEach 之间共享变量, 每次执行完 1 条测试之后，this 都会被重置为空对象。

```js
describe("a suite", function() {
  beforeEach(function() {
    this.foo = 0;
  });

  it('can use "this" to share initial data', function() {
    expect(this.foo).toEqual(0);
    this.bar = "test pollution?";
  });

  it('prevents test pollution by having an empty "this" created for next test', function() {
    expect(this.foo).toEqual(0);
    expect(this.bar).toBe(undefined);
  });
});
```

### xdescribe、xit 与 pending

在实际项目中，需要由于发布的版本需要选择测试用例包，xdescribe 和 xit 能很方便的将不包含在版本中的测试用例排除在外。

不过 xdescribe 和 xit 略有不同：

* xdescribe：该 describe 下的所有 it 将被忽略，Jasmine 将直接忽略这些 it，因此不会被运行
* xit：运行到该 it 时，挂起它不执行
* pending：将一个 spec(it) 挂起，他将被忽略

```js
xdescribe("Test xdescribe", function() {
  it("Spec 1", function() {
    expect(1).toBe(1);
  });

  it("Spec 2", function() {
    expect(2).toBe(2);
  });
});
describe("Test xit", function() {
  it("Spec 1", function() {
    expect(1).toBe(1);
  });

  it("Spec 2", function() {
    expect(2).toBe(1);
    pending();
  });

  xit("Spec 3", function() {
    expect(3).toBe(3);
  });
});
```

### fdescribe 与 fit

指定测试套件, 同一层级中出现 it, fit 两个测试 spec, 将忽略 it, 同理，同一层级出现 describe 和 fdescribe，将会忽略 desribe

```js
describe("Focused specs", function() {
  fit("is focused and will run", function() {
    expect(true).toBeTruthy();
  });
  // 忽略该测试 spec
  it("is not focused and will not run", function() {
    expect(true).toBeFalsy();
  });
  fdescribe("focused describe", function() {
    it("will run", function() {
      expect(true).toBeTruthy();
    });

    it("will also run", function() {
      expect(true).toBeTruthy();
    });
  });
  fdescribe("another focused describe", function() {
    // 忽略该测试
    fit("is focused and will run", function() {
      expect(true).toBeTruthy();
    });
    it("is not focused and will not run", function() {
      expect(true).toBeFalsy();
    });
  });
  // 忽略该测试
  describe("ignore describe", function() {
    fit("is focused and will run", function() {
      expect(true).toBeTruthy();
    });
  });
});
```

### spy 监视函数执行

Spy 用来追踪函数的调用历史信息（是否被调用、调用参数列表、被请求次数等）。Spy 仅存在于定义它的 describe 和 it 方法块中，并且每次在 spec 执行完之后被销毁。当在一个对象上使用 spyOn 方法后即可模拟调用对象上的函数，此时对所有函数的调用是不会执行实际代码的。

两个 Spy 常用的 expect：

* toHaveBeenCalled: 函数是否被调用
* toHaveBeenCalledWith: 调用函数时的参数

#### spyOn

添加对某个对象下的函数执行情况的监控

```js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      }
    };
    spyOn(spyobj, "setBar");
    spyobj.setBar("123");
    spyobj.setBar("1", "2");
  });
  it("check spyobj invoke track", function() {
    // 检查是否监听函数是否调用过
    expect(spyobj.setBar).toHaveBeenCalled();
    // 检查监听函数参数调用情况
    expect(spyobj.setBar).toHaveBeenCalledWith("123");
    expect(spyobj.setBar).toHaveBeenCalledWith("1", "2");
    // bar变量值默认是不会保存的
    expect(bar).toBeNull();
  });
});
```

#### and.callThrough

让监听的方法返回值保留下来

```js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      }
    };
    spyOn(spyobj, "setBar").and.callThrough();
    spyobj.setBar("123");
    spyobj.setBar("1", "2");
  });

  it("check spyobj invoke track", function() {
    // bar变量此次保存了下来
    expect(bar).toEqual("1");
  });
});
```

#### and.returnValue

指定监听的方法返回值

```js
describe("test spy ", function() {
  var spyobj,
    bar = null,
    foo;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      },
      getBar: function() {
        return bar;
      }
    };
    spyOn(spyobj, "getBar").and.returnValue("1");
    spyobj.setBar("123");
    foo = spyobj.getBar();
  });

  it("check spyobj invoke track", function() {
    expect(bar).toEqual("123");
    // returnValue改变了原先的setBar方法设置的值
    expect(foo).toEqual("1");
  });
});
```

#### and.callFake

伪造监听的方法返回值，通过一个自定义函数

```js
describe("test spy ", function() {
  var spyobj,
    bar = null,
    foo;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      },
      getBar: function() {
        return bar;
      }
    };
    spyOn(spyobj, "getBar").and.callFake(function() {
      return "yicai";
    });
    spyobj.setBar("123");
    foo = spyobj.getBar();
  });

  it("check spyobj invoke track", function() {
    expect(bar).toEqual("123");
    // callFake改变了原先的setBar方法设置的值
    expect(foo).toEqual("yicai");
  });
});
```

#### and.throwError

让监听方法执行之后返回一个错误信息,可以通过 toThrowError 来适配

```js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      },
      getBar: function() {
        return bar;
      }
    };
    spyOn(spyobj, "setBar").and.throwError("error");
  });

  it("check spyobj invoke track", function() {
    expect(function() {
      spyobj.setBar();
    }).toThrowError("error");
  });
});
```

#### and.stub

还原监听方法的返回值

```js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      },
      getBar: function() {
        return bar;
      }
    };
    spyOn(spyobj, "setBar").and.callThrough();
  });

  it("check spyobj invoke track", function() {
    spyobj.setBar("123");
    expect(bar).toEqual("123");
    spyobj.setBar.and.stub();
    bar = null;
    spyobj.setBar("123");
    expect(bar).toBe(null);
  });
});
```

#### calls

这里包含很多监听过程中的属性信息。
**注意，当在 calls 对象上调用 all(), mostRecent(), first()，返回的 object 属性指向的是 this 上下文信息**

* .calls.any(),一次都没调用,则返回 false,否则返回 true
* .calls.count(),返回监听函数调用的次数
* .calls.argsFor(index),返回监听函数调用过程中传递的所有参数信息,index 代表调用的索引数
* .calls.allArgs(),返回监听函数调用过程中的所以参数信息,是一个数组,每一项代表一次调用传参信息
* .calls.all(),返回监听函数调用过程中的所有信息,除了参数信息还包含 this 上下文信息
* .calls.mostRecent(),返回监听函数最后一次调用的相关信息,除了参数还包含 this 上下文信息
* .calls.first(),返回第一次调用监听函数的相关信息,除了参数还包含 this 上下文信息
* .calls.reset(),清除监听函数调用信息,.calls.any()将返回 false

```js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      setBar: function(val) {
        bar = val;
      },
      getBar: function() {
        return bar;
      }
    };
    spyOn(spyobj, "setBar");
  });

  it("check spyobj invoke track", function() {
    // 监听函数没调用过,则返回false
    expect(spyobj.setBar.calls.any()).toBe(false);

    spyobj.setBar("1");
    spyobj.setBar("2", "4");
    // 上面调用了2次
    expect(spyobj.setBar.calls.count()).toEqual(2);

    // 分别获取上面调用两次时的入参信息,索引就是调用顺序
    expect(spyobj.setBar.calls.argsFor(0)).toEqual(["1"]);
    expect(spyobj.setBar.calls.argsFor(1)).toEqual(["2", "4"]);

    // 获取所有调用时的入参信息
    expect(spyobj.setBar.calls.allArgs()).toEqual([["1"], ["2", "4"]]);

    // 获取所有调用信息,包括this上下文信息
    expect(spyobj.setBar.calls.all()).toEqual([
      {
        object: spyobj,
        args: ["1"],
        returnValue: undefined
      },
      {
        object: spyobj,
        args: ["2", "4"],
        returnValue: undefined
      }
    ]);

    // 获取最近一次调用的信息
    expect(spyobj.setBar.calls.mostRecent()).toEqual({
      object: spyobj,
      args: ["2", "4"],
      returnValue: undefined
    });

    // 获取第一次调用的信息
    expect(spyobj.setBar.calls.first()).toEqual({
      object: spyobj,
      args: ["1"],
      returnValue: undefined
    });

    // 清除监听函数调用信息
    spyobj.setBar.calls.reset();

    expect(spyobj.setBar.calls.any()).toBe(false);
  });
});
```

### jasmine 方法

#### jasmine.createSpy

创建一个命名的监听函数

```js
describe("test spy ", function() {
  var spyobj;
  beforeEach(function() {
    spyobj = jasmine.createSpy("spyobj");
    spyobj("1", "2");
  });
  it("check spyobj invoke track", function() {
    expect(spyobj.and.identity()).toEqual("spyobj");
    expect(spyobj.calls.any()).toBe(true);
    expect(spyobj.calls.count()).toEqual(1);
    expect(spyobj).toHaveBeenCalledWith("1", "2");
    expect(spyobj.calls.mostRecent().args[0]).toEqual("1");
  });
});
```

#### jasmine.createSpyObj

批量创建监听函数

```js
describe("test spy ", function() {
  var spyobj;
  beforeEach(function() {
    spyobj = jasmine.createSpyObj("spyobj", [
      "play",
      "pause",
      "stop",
      "rewind"
    ]);
    spyobj.play();
    spyobj.pause("1");
  });

  it("check spyobj invoke track", function() {
    expect(spyobj.rewind.and.identity()).toEqual("spyobj.rewind");
    expect(spyobj.play.calls.any()).toBe(true);
    expect(spyobj.stop.calls.any()).toBe(false);
    expect(spyobj.pause.calls.count()).toEqual(1);
    expect(spyobj.pause.calls.mostRecent().args[0]).toEqual("1");
  });
});
```

#### jasmine.any

检验变量是否匹配相关类型

```js
describe("jasmine.any", function() {
  it("matches any value", function() {
    expect({}).toEqual(jasmine.any(Object));
    expect(12).toEqual(jasmine.any(Number));
  });

  describe("when used with a spy", function() {
    it("is useful for comparing arguments", function() {
      var foo = jasmine.createSpy("foo");
      foo(12, function() {
        return true;
      });

      expect(foo).toHaveBeenCalledWith(
        jasmine.any(Number),
        jasmine.any(Function)
      );
    });
  });
});
```

#### jasmine.objectContaining

检验对象是否包含某个`key/value`

```js
describe("jasmine.objectContaining", function() {
  var foo;
  beforeEach(function() {
    foo = {
      a: 1,
      b: 2,
      bar: "baz"
    };
  });
  it("matches objects with the expect key/value pairs", function() {
    expect(foo).toEqual(
      jasmine.objectContaining({
        bar: "baz"
      })
    );
    expect(foo).not.toEqual(
      jasmine.objectContaining({
        c: 37
      })
    );
  });
  describe("when used with a spy", function() {
    it("is useful for comparing arguments", function() {
      var callback = jasmine.createSpy("callback");
      callback({
        bar: "baz"
      });
      expect(callback).toHaveBeenCalledWith(
        jasmine.objectContaining({
          bar: "baz"
        })
      );
      expect(callback).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          c: 37
        })
      );
    });
  });
});
```

#### jasmine.clock

* jasmine.clock().install(), 启动时钟控制
* jasmine.clock().uninstall(), 停止时钟控制
* jasmine.clock().tick(), 让时钟往前走多少秒
* jasmine.clock().mockDate(), 可以根据传入的 date 来设置当前时间

```js
describe("test jasmine.clock", function() {
  var timecallback;
  beforeEach(function() {
    timecallback = jasmine.createSpy("timecallback");
    jasmine.clock().install();
  });
  afterEach(function() {
    jasmine.clock().uninstall();
  });
  it("mock setTimeout clock ", function() {
    setTimeout(function() {
      timecallback();
    }, 100);
    expect(timecallback).not.toHaveBeenCalled();
    jasmine.clock().tick(101);
    expect(timecallback).toHaveBeenCalled();
  });
  it("mock setInterval clock ", function() {
    setInterval(function() {
      timecallback();
    }, 100);
    expect(timecallback).not.toHaveBeenCalled();
    jasmine.clock().tick(101);
    expect(timecallback.calls.count()).toEqual(1);
    jasmine.clock().tick(50);
    expect(timecallback.calls.count()).toEqual(1);
    jasmine.clock().tick(50);
    expect(timecallback.calls.count()).toEqual(2);
  });
  it("mock date clock ", function() {
    var baseTime = new Date(2013, 9, 23);
    jasmine.clock().mockDate(baseTime);
    jasmine.clock().tick(50);
    expect(new Date().getTime()).toEqual(baseTime.getTime() + 50);
  });
});
```

### jasmine 异步支持

* beforeEach, it,包装的函数传入 done 参数,只有当 done 函数执行完成之后,beforeEach, it 才算执行完成
* jasmine.DEFAULT_TIMEOUT_INTERVAL, 默认是 5 秒之后就超时,可以修改这个超时时间

```js
describe("test asynchonous ", function() {
  var value = 0,
    originalTimeout;
  beforeEach(function(done) {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    // 设置jasmine超时时间为10秒
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function() {
      value += 1;
      // 只有执行done函数,后面的it才会执行
      done();
    }, 200);
  });
  afterEach(function() {
    // 还原jasmine超时时间
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
  it("expect value toEqual 1", function(done) {
    setTimeout(function() {
      expect(value).toEqual(1);
      // 只有执行这个,后面的it才会执行
      done();
    }, 9000);
  });
  it("until above spec complete ", function() {
    expect(value).toBe(2);
  });
});
```

### 相关链接

* [jasmine 中文指南](https://yq.aliyun.com/articles/53426)
* [jasmine 入门（结合示例讲解）](https://www.cnblogs.com/laixiangran/p/5060922.html)
* [jasmine 官方文档](https://jasmine.github.io/api/2.8/global)

# 端到端测试 protractor

## 环境搭建

* 安装 node
* 安装 JAVA JDK
* 使用 node 全局安装 protractor `npm i -g protractor`
* 执行 `webdriver-manager update` 下载 chromedriver 和 selenium Server，因为网络问题会很慢。如果下载不成功就需要手动去官网下载，然后放到指定的地方。windows 下目录在 `C:\Users\XXX\AppData\Roaming\npm\node_modules\protractor\node_modules\webdriver-manager\selenium`
* 新建 protractor.conf.js 文件（名字随便），配置对应的信息，以下是一个简易版的其余都是默认值：

```js
exports.config = {
  seleniumAddress: "http://localhost:8080/",
  directConnect: true,
  specs: ["example_spec.js"]
};
```

## 运行

* `webdriver-manager start` 启动浏览器驱动
* `protractor protractor.conf.js` 启动测试代码，`protractor.conf.js`是你 protractor 的配置文件

## protractor API 5.3.0

### 浏览器 (Browser)

#### angularAppRoot

> Set the css selector for an element on which to find Angular. This is usually 'body' but if your ng-app is on a subsection of the page it may be a subelement.

> The change will be made within WebDriver's control flow, so that commands after this method is called use the new app root. Pass nothing to get a promise that resolves to the value of the selector.

> 通过一个 css 选择器来找到一个 angular 程序。通常这个指的是 body，如果你的 ng-app 在页面的一个子元素中，他就是指的这个子元素。

> 这个会改变 WebDriver 的控制流，在此之后的所有方法将被新的 angular 程序调用。这个方法的返回一个 promise，resolve 传递的参数就是你写入的 css 选择器的值。

#### waitForAngularEnabled

> If set to false, Protractor will not wait for Angular $http and $timeout tasks to complete before interacting with the browser. This can cause flaky tests, but should be used if, for instance, your app continuously polls an API with $timeout.

> Call waitForAngularEnabled() without passing a value to read the current state without changing it.

> 如果设置为 false，则在与浏览器交互之前，Protractor 不会等待 Angular \$http 和 \$timeout 任务完成。如果你的 app 中使用了一个长轮询的 API($tiemout)，你应该使用这个它，否则会产生古怪的测试。

> 调用 waitForAngularEnabled() 方法返回一个 promise，resolve 传递的参数当前值的状态 (true/false)。

#### getProcessedConfig

> Get the processed configuration object that is currently being run. This will contain the specs and capabilities properties of the current runner instance.

> 获取当前正在运行的已处理的配置对象。 返回一个 promise，resolve 传递一个对象，包括你的测试用例信息和运行的配置文件参数。

#### forkNewDriverInstance

> Fork another instance of browser for use in interactive tests.

> fork 一个 browser 实例用于交叉测试

* 接受三个参数，类型都是 boolen
* 是否在创建时导航到当前网址
* 是否在创建时应用相同的模拟模块
* 是否复制对 baseUrl 的更改以及初始化为配置中的值的类似属性。 默认为 true
* 返回一个 browser 对象

#### restart

> Restart the browser. This is done by closing this browser instance and creating a new one. A promise resolving to the new instance is returned, and if this function was called on the global browser instance then Protractor will automatically overwrite the global browser variable.

> When restarting a forked browser, it is the caller's job to overwrite references to the old instance.

> This function behaves slightly differently depending on if the webdriver control flow is enabled. If the control flow is enabled, the global browser object is synchronously replaced. If the control flow is disabled, the global browser is replaced asynchronously after the old driver quits.

> 重新启动浏览器。 这是通过关闭这个浏览器实例并创建一个新的。 返回解析到新实例的 promise，如果在全局浏览器实例上调用此函数，则 Protractor 将自动覆盖全局浏览器变量。

> 重新启动 forked browser 时，调用者的工作是覆盖对旧实例的引用。

> 此功能的行为稍有不同取决于是否启用了 webdriver 控制流。 如果控制流被启用，则全局浏览器对象被同步替换。 如果控制流被禁用，则在旧驱动程序退出后，全局浏览器将被异步替换。

#### restartSync

> Like restart, but instead of returning a promise resolving to the new browser instance, returns the new browser instance directly. Can only be used when the control flow is enabled.

> 类似于 restart，但不是返回解析到新的浏览器实例的 promise，直接返回新的浏览器实例。只能在控制流程启用时使用。

#### useAllAngular2AppRoots

> Instead of using a single root element, search through all angular apps available on the page when finding elements or waiting for stability. Only compatible with Angular2.

> 在查找元素或等待稳定性时，不要使用单个根元素，而是搜索页面上可用的所有 angular app。 只兼容 Angular2。

#### waitForAngular

> Instruct webdriver to wait until Angular has finished rendering and has no outstanding $http or $timeout calls before continuing. Note that Protractor automatically applies this command before every WebDriver action.

> 指示 webdriver 等待 Angular 完成渲染，并且在继续之前没有未完成的$ http 或$ timeout 过程。 请注意，Protractor 会在每个 WebDriver 操作之前自动应用此命令。

#### findElement/findElements

> Waits for Angular to finish rendering before searching for elements.

> 查找一个元素，在此之前等待 angular 完成渲染

#### isElementPresent

> Tests if an element is present on the page.

> 测试页面上是否存在元素。

#### addMockModule

> Add a module to load before Angular whenever Protractor.get is called. Modules will be registered after existing modules already on the page, so any module registered here will override preexisting modules with the same name.

> 在调用 Protractor.get 时，添加一个在 Angular 之前加载的模块。 模块将在页面上现有的模块之后注册，因此在这里注册的任何模块都将覆盖已有模块的同名。

```js
// 三个参数
// 要加载或覆盖的模块的名称
// 加载模块的JavaScript。 请注意，这将在浏览器上下文中执行，所以它不能访问范围之外的变量。
// 一些额外的参数将被注入，并且可以使用`arguments`对象来引用。
browser.addMockModule("modName", function() {
  angular.module("modName", []).value("foo", "bar");
});
```

#### clearMockModules

> Clear the list of registered mock modules.

> 清除注册模拟模块的列表。

#### removeMockModule

> Remove a registered mock module.

> 删除注册的模拟模块。

```js
browser.removeMockModule("modName");
```

#### getRegisteredMockModules

> Get a list of the current mock modules.

> 获取当前模拟模块的列表。

#### get

> Navigate to the given destination and loads mock modules before Angular. Assumes that the page being loaded uses Angular. If you need to access a page which does not have Angular on load, use the wrapped webdriver directly.

> 假设正在加载的页面使用 Angular, 导航到给定的目的地并在 Angular 之前加载模拟模块。如果你需要访问一个没有加载 Angular 的页面，直接使用包装的 webdriver。

```js
// 两个参数
// url
// 一个毫秒数，用来等待 angular 启动
browser.get("https://angularjs.org/");
expect(browser.getCurrentUrl()).toBe("https://angularjs.org/");
```

#### refresh

> Makes a full reload of the current page and loads mock modules before Angular. Assumes that the page being loaded uses Angular. If you need to access a page which does not have Angular on load, use the wrapped webdriver directly.

> 假设正在加载的页面使用 Angular，刷新页面重新加载并在 Angular 之前加载模拟模块。 。 如果你需要访问一个没有加载 Angular 的页面，直接使用包装的 webdriver。

#### navigate

> Mixin navigation methods back into the navigation object so that they are invoked as before, i.e. driver.navigate().refresh().

> 混合 navigation 方法返回给 navigation 对象，以便像以前那样调用它们。例如：driver.navigate().refresh()。

#### setLocation

> Browse to another page using in-page navigation.

> 使用页内导航浏览到另一个页面。

```js
browser.get("http://angular.github.io/protractor/#/tutorial");
browser.setLocation("api");
expect(browser.getCurrentUrl()).toBe(
  "http://angular.github.io/protractor/#/api"
);
```

#### getLocationAbsUrl

> Deprecated, use browser.getCurrentUrl() instead.

> Despite its name, this function will generally return $location.url(), though in some cases it will return $location.absUrl() instead. This function is only here for legacy users, and will probably be removed in Protractor 6.0.

> 已弃用，请改用 `browser.getCurrentUrl()`

> 尽管它的名字，这个函数通常会返回 `$location.url()`，但在某些情况下，它将返回`$location.absUrl()`。 此功能仅适用于旧版用户，并可能在 Protractor 6.0 中删除。

#### debugger

> Adds a task to the control flow to pause the test and inject helper functions into the browser, so that debugging may be done in the browser console.

> This should be used under node in debug mode, i.e. with protractor debug

> 向控制流添加一个任务来暂停测试并将辅助函数注入到浏览器中，以便可以在浏览器控制台中完成调试。

> 这应该在调试模式下的节点下使用，即 protractor debug

#### enterRepl

> see browser.explore().

#### explore

> Beta (unstable) explore function for entering the repl loop from any point in the control flow. Use browser.explore() in your test. Does not require changes to the command line (no need to add 'debug'). Note, if you are wrapping your own instance of Protractor, you must expose globals 'browser' and 'protractor' for pause to work.

> Beta (unstable) explore 函数从控制流中的任意点进入 repl 循环。 在你的测试中使用 browser.explore()。 不需要修改命令行（不需要添加 'debug'）。 注意，如果你正在包装自己的 Protractor 实例，你必须公开全局的'browser' 和 'protractor' 来暂停工作。

```js
element(by.id("foo")).click();
browser.explore();
// Execution will stop before the next click action.
element(by.id("bar")).click();
```

#### pause

> Beta (unstable) pause function for debugging webdriver tests. Use browser.pause() in your test to enter the protractor debugger from that point in the control flow. Does not require changes to the command line (no need to add 'debug'). Note, if you are wrapping your own instance of Protractor, you must expose globals 'browser' and 'protractor' for pause to work.

> Beta (unstable) 暂停功能，用于调试 webdriver 测试。在你的测试中使用 browser.pause()。 不需要修改命令行（不需要添加 'debug'）。 注意，如果你正在包装自己的 Protractor 实例，你必须公开全局的'browser' 和 'protractor' 来暂停工作。

```js
element(by.id("foo")).click();
browser.pause();
// Execution will stop before the next click action.
element(by.id("bar")).click();
```

#### controlFlowIsEnabled

> Determine if the control flow is enabled.

> 确定是否启用控制流。

#### inherited from ExtendedWebDriver

##### Appium_Commands

> Various appium commands, including the commands implemented by wd. The names may be different however, and commands which are implemented already by selenium-webdriver are not re-implemented by webdriver-js-extender.
> See the [GitHub repo](https://github.com/angular/webdriver-js-extender) for details.

> 各种各样的命令，包括由 wd 执行的命令。 但是名字可能不同，selenium-webdriver 已经实现的命令不会被 webdriver-js-extender 重新实现。

#### inherited from webdriver.WebDriver

##### actions

> Creates a sequence of user actions using this driver. The sequence will not be scheduled for execution until webdriver.ActionSequence#perform is called.

> See the selenium webdriver docs [for more details on action sequences](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions_exports_ActionSequence.html).

> Mouse actions do not work on Chrome with the HTML5 Drag and Drop API due to a known [Chromedriver issue](https://bugs.chromium.org/p/chromedriver/issues/detail?id=841)

> 使用此驱动程序创建一系列用户操作。 在调用 webdriver.ActionSequence#perform 之前，该序列不会被调度执行。

> 有关动作序列的更多详细信息，请参阅 [for more details on action sequences](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions_exports_ActionSequence.html) 文档。

> 鼠标操作在 HTML5 拖放式 API 上无法使用 [Chromedriver issue](https://bugs.chromium.org/p/chromedriver/issues/detail?id=841)

```js
// Dragging one element to another.
browser
  .actions()
  .mouseDown(element1)
  .mouseMove(element2)
  .mouseUp()
  .perform();

// You can also use the `dragAndDrop` convenience action.
browser
  .actions()
  .dragAndDrop(element1, element2)
  .perform();

// Instead of specifying an element as the target, you can specify an offset
// in pixels. This example double-clicks slightly to the right of an element.
browser
  .actions()
  .mouseMove(element)
  .mouseMove({ x: 50, y: 0 })
  .doubleClick()
  .perform();
```

##### touchActions

> Creates a new touch sequence using this driver. The sequence will not be scheduled for execution until actions.TouchSequence#perform is called.

> See the selenium webdriver docs [for more details on action sequences](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions_exports_ActionSequence.html).

> 使用此驱动程序创建新的触摸序列。 序列将不会被调度执行，直到 actions.TouchSequence#perform 被调用。

```js
browser
  .touchActions()
  .tap(element1)
  .doubleTap(element2)
  .perform();
```

##### executeScript

> Schedules a command to execute JavaScript in the context of the currently selected frame or window. The script fragment will be executed as the body of an anonymous function. If the script is provided as a function object, that function will be converted to a string for injection into the target window.

> Any arguments provided in addition to the script will be included as script arguments and may be referenced using the arguments object. Arguments may be a boolean, number, string, or WebElement. Arrays and objects may also be used as script arguments as long as each item adheres to the types previously mentioned.

> The script may refer to any variables accessible from the current window. Furthermore, the script will execute in the window's context, thus document may be used to refer to the current document. Any local variables will not be available once the script has finished executing, though global variables will persist.

> If the script has a return value (i.e. if the script contains a return statement), then the following steps will be taken for resolving this functions return value:

* For a HTML element, the value will resolve to a WebElement
* Null and undefined return values will resolve to null
* Booleans, numbers, and strings will resolve as is
* Functions will resolve to their string representation
* For arrays and objects, each member item will be converted according to the rules above

> 执行一个命令，在当前选定的框架或窗口的上下文中调度执行 JavaScript。脚本片段将作为匿名函数的主体执行。如果脚本是作为函数对象提供的，则该函数将被转换为一个字符串，以便注入到目标窗口中。

> 除脚本之外提供的任何参数都将作为脚本参数包含在内，并可能使用参数对象进行引用。参数可能是一个布尔值，数字，字符串或 WebElement。只要每个项目都符合前面提到的类型，数组和对象也可以用作脚本参数。

> 该脚本可以引用从当前窗口可访问的任何变量。而且，脚本将在窗口的上下文中执行，因此可以使用文档来引用当前文档。一旦脚本执行完成，任何局部变量都将不可用，尽管全局变量将会持续。

> 如果脚本具有返回值（即，如果脚本包含返回语句），则将采取以下步骤来解决此函数的返回值：

* 对于 HTML 元素，该值将解析为 WebElement
* 空和未定义的返回值将解析为 null
* 布尔值，数字和字符串将按原样解析
* 函数将解析为其字符串表示形式
* 对于数组和对象，每个成员项目都将按照上面的规则进行转换

```js
var el = element(by.module("header"));
var tag = browser.executeScript("return arguments[0].tagName", el);
expect(tag).toEqual("h1");
```

##### executeAsyncScript

> Unlike executing synchronous JavaScript with executeScript(), scripts executed with this function must explicitly signal they are finished by invoking the provided callback. This callback will always be injected into the executed function as the last argument, and thus may be referenced with arguments[arguments.length - 1]. The following steps will be taken for resolving this functions return value against the first argument to the script's callback function:

> 与使用 executeScript() 执行同步 JavaScript 不同，使用此函数执行的脚本必须通过调用所提供的回调来明确表示它们已完成。这个回调函数总是作为最后一个参数被注入执行函数，因此可以用 arguments [arguments.length - 1]来引用。

```js
// Example 1
// Performing a sleep that is synchronized with the currently selected window
var start = new Date().getTime();
browser
  .executeAsyncScript(
    "window.setTimeout(arguments[arguments.length - 1], 500);"
  )
  .then(function() {
    console.log("Elapsed time: " + (new Date().getTime() - start) + " ms");
  });

// Example 2
// Synchronizing a test with an AJAX application:
var button = element(by.id("compose-button"));
button.click();
browser.executeAsyncScript(
  "var callback = arguments[arguments.length - 1];" +
    "mailClient.getComposeWindowWidget().onload(callback);"
);
browser.switchTo().frame("composeWidget");
element(by.id("to")).sendKeys("dog@example.com");

// Example 3
// Injecting a XMLHttpRequest and waiting for the result.  In this example,
// the inject script is specified with a function literal. When using this
// format, the function is converted to a string for injection, so it should
// not reference any symbols not defined in the scope of the page under test.
browser
  .executeAsyncScript(function() {
    var callback = arguments[arguments.length - 1];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/resource/data.json", true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        callback(xhr.responseText);
      }
    };
    xhr.send("");
  })
  .then(function(str) {
    console.log(JSON.parse(str)["food"]);
  });
```

##### call

> Schedules a command to execute a custom function within the context of webdriver's control flow.

> Most webdriver actions are asynchronous, but the control flow makes sure that commands are executed in the order they were received. By running your function in the control flow, you can ensure that it is executed before/after other webdriver actions. Additionally, Protractor will wait until the control flow is empty before deeming a test finished.

> 执行一个命令，在 WebDriver 的控制流的上下文中执行一个自定义函数。

> 大多数 webdriver 操作是异步的，但是控制流确保命令按照接收到的顺序执行。 通过在控制流中运行你的函数，你可以确保它在其他 webdriver 动作之前/之后被执行。 此外，Protractor 将等待，直到控制流程为空，然后认为测试完成。

```js
var logText = function(el) {
  return el.getText().then(text => {
    console.log(text);
  });
};
var counter = element(by.id("counter"));
var button = element(by.id("button"));
// Use `browser.call()` to make sure `logText` is run before and after
// `button.click()`
browser.call(logText, counter);
button.click();
browser.call(logText, counter);
```

##### wait

> Schedules a command to wait for a condition to hold or promise to be resolved.

> This function blocks WebDriver's control flow, not the javascript runtime. It will only delay future webdriver commands from being executed (e.g. it will cause Protractor to wait before sending future commands to the selenium server), and only when the webdriver control flow is enabled.

> This function returnes a promise, which can be used if you need to block javascript execution and not just the control flow.

> 执行一个命令，等待条件成立或承诺解决。

> 此功能阻止 WebDriver 的控制流程，而不是运行的 JavaScript。它只会推迟未来的 WebDriver 的命令被执行（例如，在将未来的命令发送到 selenium 服务器之前，它将导致 Protractor 等待），并且只有当 webdriver 控制流程启用时。

> 此函数返回一个 promise，如果您需要阻止 JavaScript 执行而不仅仅是控制流，可以使用该承诺。

```js
var started = startTestServer();
browser.wait(started, 5 * 1000, "Server should start within 5 seconds");
browser.get(getServerUrl());
```

##### sleep

> Schedules a command to make the driver sleep for the given amount of time.

> 执行一个命令，使驱动程序在给定的时间内睡眠。

##### getPageSource

> Schedules a command to retrieve the current page's source. The page source returned is a representation of the underlying DOM: do not expect it to be formatted or escaped in the same way as the response sent from the web server.

> 执行命令，获取当前页的源代码。返回的页源是底层 DOM 的表示：不要期望它以与 Web 服务器发送的响应相同的格式进行格式化或转义。

##### close

> Schedules a command to close the current window.

> 执行一个命令，关闭当前窗口。

##### getCurrentUrl

> Schedules a command to retrieve the URL of the current page.

> 执行一个命令，获取当前页面的 URL。

##### getTitle

> Schedules a command to retrieve the current page's title.

> 执行一个命令，获取当前页面的 title。

##### takeScreenshot

> Schedule a command to take a screenshot. The driver makes a best effort to return a screenshot of the following, in order of preference:

* Entire page
* Current window
* Visible portion of the current frame
* The screenshot of the entire display containing the browser

> 执行一个命令，截图。 驱动程序尽可能按照首选项的顺序返回以下屏幕截图：

* 整个页面
* 当前窗口
* 当前帧的可见部分
* 包含浏览器的整个显示屏幕的屏幕截图

##### switchTo

> Used to switch WebDriver's focus to a frame or window (e.g. an alert, an iframe, another window).

> See [WebDriver's TargetLocator Docs](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_TargetLocator.html) for more information.

> 用于切换 WebDriver 的 focus 到一个框架或窗口。（例如：alert iframe window）

### Locators(by)

> The Protractor Locators. These provide ways of finding elements in Angular applications by binding, model, etc.

> Protractor 定位器。 这些提供了通过绑定，模型等在 Angular 应用程序中查找元素的方法。

#### addLocator

> Add a locator to this instance of ProtractorBy. This locator can then be used with element(by.locatorName(args)).

> 添加一个定位器到这个 ProtractorBy 的实例。 这个定位器可以和元素一起使用 (by.locatorName(args))。

```html
<button ng-click="doAddition()">Go!</button>
```

```js
// Add the custom locator.
by.addLocator("buttonTextSimple", function(
  buttonText,
  opt_parentElement,
  opt_rootSelector
) {
  // This function will be serialized as a string and will execute in the
  // browser. The first argument is the text for the button. The second
  // argument is the parent element, if any.
  var using = opt_parentElement || document,
    buttons = using.querySelectorAll("button");

  // Return an array of buttons with the text.
  return Array.prototype.filter.call(buttons, function(button) {
    return button.textContent === buttonText;
  });
});

// Use the custom locator.
element(by.buttonTextSimple("Go!")).click();
```

#### binding

> Find an element by text binding. Does a partial match, so any elements bound to variables containing the input string will be returned.

> 通过文本绑定查找元素。进行部分匹配，因此返回到包含输入字符串的变量的任何元素都将返回。

```html
<span>{{person.name}}</span>
<span ng-bind="person.email"></span>
```

```js
var span1 = element(by.binding("person.name"));
expect(span1.getText()).toBe("Foo");

var span2 = element(by.binding("person.email"));
expect(span2.getText()).toBe("foo@bar.com");

// You can also use a substring for a partial match
var span1alt = element(by.binding("name"));
expect(span1alt.getText()).toBe("Foo");

// This works for sites using Angular 1.2 but NOT 1.3
var deprecatedSyntax = element(by.binding("{{person.name}}"));
```

#### exactBinding

> Find an element by exact binding.

> 通过精确绑定来查找元素。

```html
<span>{{ person.name }}</span>
<span ng-bind="person-email"></span>
<span>{{person_phone|uppercase}}</span>
```

```js
expect(element(by.exactBinding("person.name")).isPresent()).toBe(true);
expect(element(by.exactBinding("person-email")).isPresent()).toBe(true);
expect(element(by.exactBinding("person")).isPresent()).toBe(false);
expect(element(by.exactBinding("person_phone")).isPresent()).toBe(true);
expect(element(by.exactBinding("person_phone|uppercase")).isPresent()).toBe(
  true
);
expect(element(by.exactBinding("phone")).isPresent()).toBe(false);
```

#### model

> Find an element by ng-model expression.

> 通过 ng-model 表达式查找元素。

```html
<input type="text" ng-model="person.name">
```

```js
var input = element(by.model("person.name"));
input.sendKeys("123");
expect(input.getAttribute("value")).toBe("123");
```

#### buttonText

> Find a button by text.

> 通过文本查找按钮。

```html
<button>Save</button>
```

```js
element(by.buttonText("Save"));
```

#### partialButtonText

> Find a button by partial text.

> 通过部分文本查找按钮。

```html
<button>Save my file</button>
```

```js
element(by.partialButtonText("Save"));
```

#### repeater

> Find elements inside an ng-repeat.

> 在 ng-repeat 中查找元素。

```html
<div ng-repeat="cat in pets">
  <span>{{cat.name}}</span>
  <span>{{cat.age}}</span>
</div>

<div class="book-img" ng-repeat-start="book in library">
  <span>{{$index}}</span>
</div>
<div class="book-info" ng-repeat-end>
  <h4>{{book.name}}</h4>
  <p>{{book.blurb}}</p >
</div>
```

```js
// Returns the DIV for the second cat.
var secondCat = element(by.repeater("cat in pets").row(1));

// Returns the SPAN for the first cat's name.
var firstCatName = element(
  by
    .repeater("cat in pets")
    .row(0)
    .column("cat.name")
);

// Returns a promise that resolves to an array of WebElements from a column
var ages = element.all(by.repeater("cat in pets").column("cat.age"));

// Returns a promise that resolves to an array of WebElements containing
// all top level elements repeated by the repeater. For 2 pets rows
// resolves to an array of 2 elements.
var rows = element.all(by.repeater("cat in pets"));

// Returns a promise that resolves to an array of WebElements containing
// all the elements with a binding to the book's name.
var divs = element.all(by.repeater("book in library").column("book.name"));

// Returns a promise that resolves to an array of WebElements containing
// the DIVs for the second book.
var bookInfo = element.all(by.repeater("book in library").row(1));

// Returns the H4 for the first book's name.
var firstBookName = element(
  by
    .repeater("book in library")
    .row(0)
    .column("book.name")
);

// Returns a promise that resolves to an array of WebElements containing
// all top level elements repeated by the repeater. For 2 books divs
// resolves to an array of 4 elements.
var divs = element.all(by.repeater("book in library"));
```

#### exactRepeater

> Find an element by exact repeater.

> 通过精确 repeater 找到一个元素。

```html
<li ng-repeat="person in peopleWithRedHair"></li>
<li ng-repeat="car in cars | orderBy:year"></li>
```

```js
expect(
  element(by.exactRepeater("person in peopleWithRedHair")).isPresent()
).toBe(true);
expect(element(by.exactRepeater("person in people")).isPresent()).toBe(false);
expect(element(by.exactRepeater("car in cars")).isPresent()).toBe(true);
```

#### cssContainingText

> Find elements by CSS which contain a certain string.

> 通过包含特定字符串的 CSS 查找元素。

```html
<ul>
  <li class="pet">Dog</li>
  <li class="pet">Cat</li>
</ul>
```

```js
var dog = element(by.cssContainingText(".pet", "Dog"));
```

#### options

> Find an element by ng-options expression.

> 通过 ng-options 表达式查找元素。

```html
<select ng-model="color" ng-options="c for c in colors">
  <option value="0" selected="selected">red</option>
  <option value="1">green</option>
</select>
```

```js
var allOptions = element.all(by.options("c for c in colors"));
expect(allOptions.count()).toEqual(2);
var firstOption = allOptions.first();
expect(firstOption.getText()).toEqual("red");
```

#### deepCss

> Find an element by css selector within the Shadow DOM.

> 通过 css 选择器查找一个在 Shadow DOM 中的元素。

> Shadow DOM 它允许在文档（document）渲染时插入一棵 DOM 元素子树，但是这棵子树不在主 DOM 树中。详细信息可以查看 [神奇的 Shadow DOM](http://web.jobbole.com/87088/)

```html
<div>
  <span id="outerspan">
  <"shadow tree">
    <span id="span1"></span>
    <"shadow tree">
      <span id="span2"></span>
    </>
  </>
</div>
```

```js
var spans = element.all(by.deepCss("span"));
expect(spans.count()).toEqual(3);
```

#### Extends webdriver.By

##### className

> Locates elements that have a specific class name. The returned locator is equivalent to searching for elements with the CSS selector ".clazz".

> 找到具有特定类名称的元素。 返回的定位符相当于使用 CSS 选择器“.clazz”搜索元素。

```html
<ul class="pet">
  <li class="dog">Dog</li>
  <li class="cat">Cat</li>
</ul>
```

```js
// Returns the web element for dog
var dog = element(by.className('dog'));
expect(dog.getText()).toBe('Dog'
```

##### css

> Locates elements using a CSS selector. For browsers that do not support CSS selectors, WebDriver implementations may return an invalid selector error. An implementation may, however, emulate the CSS selector API.See [http://www.w3.org/TR/CSS2/selector.html](http://www.w3.org/TR/CSS2/selector.html)

> 使用 CSS 选择器定位元素。对于那些不支持 CSS 选择器的浏览器实现，WebDriver 可能会返回一个无效的选择错误。然而，一个实现可以模拟 CSS 选择器 API。

```html
<ul class="pet">
  <li class="dog">Dog</li>
  <li class="cat">Cat</li>
</ul>
```

```js
// Returns the web element for cat
var cat = element(by.css(".pet .cat"));
expect(cat.getText()).toBe("Cat");
```

##### id

> Locates an element by its ID.

> 通过它的 ID 找到一个元素。

```html
<ul id="pet_id">
  <li id="dog_id">Dog</li>
  <li id="cat_id">Cat</li>
</ul>
```

```js
// Returns the web element for dog
var dog = element(by.id("dog_id"));
expect(dog.getText()).toBe("Dog");
```

##### linkText

> Locates link elements whose visible text matches the given string.

> 定位可见文本与给定字符串匹配的链接元素。

```html
< a href=" ">Google</ a>
```

```js
expect(element(by.linkText("Google")).getTagName()).toBe("a");
```

##### js

> Locates an elements by evaluating a JavaScript expression, which may be either a function or a string. Like webdriver.WebDriver.executeScript, the expression is evaluated in the context of the page and cannot access variables from the test file.The result of this expression must be an element or list of elements.

> 通过评估一个 JavaScript 表达式来定位一个元素，它可以是一个函数，也可以是一个字符串。 像 webdriver.WebDriver.executeScript 一样，表达式在页面的上下文中被计算，并且不能从测试文件访问变量。该表达式的结果必须是元素或元素列表。

```html
<span class="small">One</span>
<span class="medium">Two</span>
<span class="large">Three</span>
```

```js
var wideElement = element(
  by.js(function() {
    var spans = document.querySelectorAll("span");
    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].offsetWidth > 100) {
        return spans[i];
      }
    }
  })
);
expect(wideElement.getText()).toEqual("Three");
```

##### name

> Locates elements whose name attribute has the given value.

> 定位 name 属性具有给定值的元素

```html
<ul>
  <li name="dog_name">Dog</li>
  <li name="cat_name">Cat</li>
</ul>
```

```js
// Returns the web element for dog
var dog = element(by.name("dog_name"));
expect(dog.getText()).toBe("Dog");
```

##### partialLinkText

> Locates link elements whose visible text contains the given substring.

> 找到其可见文本包含给定子字符串的链接元素。

```html
<ul>
  <li>< a href=" ">Doge meme</ a></li>
  <li>Cat</li>
</ul>
```

```js
// Returns the 'a' web element for doge meme and navigate to that link
var doge = element(by.partialLinkText("Doge"));
doge.click();
```

##### tagName

> Locates elements with a given tag name. The returned locator is equivalent to using the getElementsByTagName DOM function.

> 定位具有给定标签名称的元素。 返回的定位符相当于使用 getElementsByTagName DOM 函数。

```html
< a href=" ">Google</ a>
```

```js
expect(element(by.tagName("a")).getText()).toBe("Google");
```

##### xpath

> Locates elements matching a XPath selector. Care should be taken when using an XPath selector with a webdriver.WebElement as WebDriver will respect the context in the specified in the selector. For example, given the selector '//div', WebDriver will search from the document root regardless of whether the locator was used with a WebElement.

> 找到匹配 XPath 选择器的元素。 当使用具有 webdriver.WebElement 的 XPath 选择器时应该小心，因为 WebDriver 将遵守选择器中指定的上下文。 例如，给定选择器 '//div'，WebDriver 将从文档根中进行搜索，而不管定位符是否与 WebElement 一起使用。

```html
<ul>
  <li>< a href=" ">Doge meme</ a></li>
  <li>Cat</li>
</ul>
```

```js
// Returns the 'a' element for doge meme
var li = element(by.xpath("//ul/li/a"));
expect(li.getText()).toBe("Doge meme");
```

### 元素定位 element

#### element.all(locator) ElementArrayFinder

> ElementArrayFinder is used for operations on an array of elements (as opposed to a single element).

> ElementArrayFinder 用于操作数组元素（而不是一个单一的元素）。

> The ElementArrayFinder is used to set up a chain of conditions that identify an array of elements. In particular, you can call all(locator) and filter(filterFn) to return a new ElementArrayFinder modified by the conditions, and you can call get(index) to return a single ElementFinder at position 'index'.

> ElementArrayFinder 用于设置一系列标识元素数组的条件。特别是，你可以调用 all(locator) 和 filter(filterFn) 来返回一个由条件修改的新的 ElementArrayFinder，你可以调用 get(index) 返回位于 'index' 位置的单个 ElementFinder。

> Similar to jquery, ElementArrayFinder will search all branches of the DOM to find the elements that satisfy the conditions (i.e. all, filter, get). However, an ElementArrayFinder will not actually retrieve the elements until an action is called, which means it can be set up in helper files (i.e. page objects) before the page is available, and reused as the page changes.

> 与 jquery 类似，ElementArrayFinder 将搜索 DOM 的所有分支以查找满足条件的元素（即 all，filter，get）。然而，一个 ElementArrayFinder 实际上不会检索元素，直到一个动作被调用，这意味着它可以在页面可用之前在助手文件（即页面对象）中设置，并在页面改变时重新使用。

> You can treat an ElementArrayFinder as an array of WebElements for most purposes, in particular, you may perform actions (i.e. click, getText) on them as you would an array of WebElements. The action will apply to every element identified by the ElementArrayFinder. ElementArrayFinder extends Promise, and once an action is performed on an ElementArrayFinder, the latest result can be accessed using then, and will be returned as an array of the results; the array has length equal to the length of the elements found by the ElementArrayFinder and each result represents the result of performing the action on the element. Unlike a WebElement, an ElementArrayFinder will wait for the angular app to settle before performing finds or actions.

> 您可以将 ElementArrayFinder 视为大多数 WebElements 数组，特别是您可以像对待 WebElements 数组一样对它们执行操作（即 click，getText）。该操作将应用于由 ElementArrayFinder 标识的每个元素。 ElementArrayFinder 扩展了 Promise，一旦在 ElementArrayFinder 上执行了一个动作，最后的结果就可以被访问，并作为结果数组返回。该数组的长度等于 ElementArrayFinder 找到的元素的长度，每个结果表示对元素执行操作的结果。与 WebElement 不同，ElementArrayFinder 将在执行查找或操作之前等待 Protractor 应用程序解决。

```html
<ul class="items">
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
element.all(by.css(".items li")).then(function(items) {
  expect(items.length).toBe(3);
  expect(items[0].getText()).toBe("First");
});
// Or using the shortcut $$() notation instead of element.all(by.css()):
$$(".items li").then(function(items) {
  expect(items.length).toBe(3);
  expect(items[0].getText()).toBe("First");
});
```

##### clone

> Create a shallow copy of ElementArrayFinder.

> 创建 ElementArrayFinder 的浅表副本。

##### all

> Calls to ElementArrayFinder may be chained to find an array of elements using the current elements in this ElementArrayFinder as the starting point. This function returns a new ElementArrayFinder which would contain the children elements found (and could also be empty).

> 对 ElementArrayFinder 的调用可以链接在一起，以此 ElementArrayFinder 中的当前元素为起点来查找元素数组。 这个函数返回一个新的 ElementArrayFinder，它将包含找到的子元素（也可以是空的）。

```html
<div id='id1' class="parent">
  <ul>
    <li class="foo">1a</li>
    <li class="baz">1b</li>
  </ul>
</div>
<div id='id2' class="parent">
  <ul>
    <li class="foo">2a</li>
    <li class="bar">2b</li>
  </ul>
</div>
```

```js
let foo = element.all(by.css(".parent")).all(by.css(".foo"));
expect(foo.getText()).toEqual(["1a", "2a"]);
let baz = element.all(by.css(".parent")).all(by.css(".baz"));
expect(baz.getText()).toEqual(["1b"]);
let nonexistent = element.all(by.css(".parent")).all(by.css(".NONEXISTENT"));
expect(nonexistent.getText()).toEqual([""]);
```

##### filter

> Apply a filter function to each element within the ElementArrayFinder. Returns a new ElementArrayFinder with all elements that pass the filter function. The filter function receives the ElementFinder as the first argument and the index as a second arg. This does not actually retrieve the underlying list of elements, so it can be used in page objects.

> 对 ElementArrayFinder 中的每个元素应用过滤器函数。 返回一个新的 ElementArrayFinder，其中包含所有传递过滤函数的元素。 过滤函数接收 ElementFinder 作为第一个参数，索引作为第二个参数。 这实际上并不检索底层的元素列表，因此可以在页面对象中使用。

```html
<ul class="items">
  <li class="one">First</li>
  <li class="two">Second</li>
  <li class="three">Third</li>
</ul>
```

```js
element
  .all(by.css(".items li"))
  .filter(function(elem, index) {
    return elem.getText().then(function(text) {
      return text === "Third";
    });
  })
  .first()
  .click();
```

##### get

> Get an element within the ElementArrayFinder by index. The index starts at 0. Negative indices are wrapped (i.e. -i means ith element from last) This does not actually retrieve the underlying element.

> 通过索引获取 ElementArrayFinder 中的元素。 索引从 0 开始。包含负索引（即 -i 表示从上一个元素开始）这实际上并不检索基础元素。

```html
<ul class="items">
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
let list = element.all(by.css(".items li"));
expect(list.get(0).getText()).toBe("First");
expect(list.get(1).getText()).toBe("Second");
```

##### first

> Get the first matching element for the ElementArrayFinder. This does not actually retrieve the underlying element.

> 获取 ElementArrayFinder 的第一个匹配元素。 这实际上并不检索底层元素。

##### last

> Get the last matching element for the ElementArrayFinder. This does not actually retrieve the underlying element.

> 获取 ElementArrayFinder 的最后一个匹配元素。 这实际上并不检索底层元素。

##### \$\$

> Shorthand function for finding arrays of elements by css. element.all(by.css('.abc')) is equivalent to \$\$('.abc')

> 由 css 查找元素数组的速记函数。element.all(by.css('.abc')) 相当于 \$\$('.abc')

##### count

> Count the number of elements represented by the ElementArrayFinder.

> 统计 ElementArrayFinder 表示的元素的数量。

##### isPresent

> Returns true if there are any elements present that match the finder.

> 如果存在任何与查找器匹配的元素，则返回 true。

```js
expect($(".item").isPresent()).toBeTruthy();
```

##### locator

> Returns the most relevant locator.

> 返回最相关的定位器。

```js
// returns by.css('#ID1')
$("#ID1").locator();
// returns by.css('#ID2')
$("#ID1")
  .$("#ID2")
  .locator();
// returns by.css('#ID1')
$$("#ID1")
  .filter(filterFn)
  .get(0)
  .click()
  .locator();
```

##### then

> Retrieve the elements represented by the ElementArrayFinder. The input function is passed to the resulting promise, which resolves to an array of ElementFinders.

> 检索由 ElementArrayFinder 表示的元素。 输入函数被传递给所生成的 promise，该 promise 被分解为一个 ElementFinder 数组。

##### each

> Calls the input function on each ElementFinder represented by the ElementArrayFinder.

> 在 ElementArrayFinder 表示的每个 ElementFinder 上调用输入函数。

```html
<ul class="items">
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ul>
```

```js
element.all(by.css(".items li")).each(function(element, index) {
  // Will print 0 First, 1 Second, 2 Third.
  element.getText().then(function(text) {
    console.log(index, text);
  });
});
```

##### map

> Apply a map function to each element within the ElementArrayFinder. The callback receives the ElementFinder as the first argument and the index as a second arg.

> 将一个映射函数应用于 ElementArrayFinder 中的每个元素。 该回调接收 ElementFinder 作为第一个参数，索引作为第二个参数。

```html
<ul class="items">
  <li class="one">First</li>
  <li class="two">Second</li>
  <li class="three">Third</li>
</ul>
```

```js
let items = element.all(by.css(".items li")).map(function(elm, index) {
  return {
    index: index,
    text: elm.getText(),
    class: elm.getAttribute("class")
  };
});
expect(items).toEqual([
  { index: 0, text: "First", class: "one" },
  { index: 1, text: "Second", class: "two" },
  { index: 2, text: "Third", class: "three" }
]);
```

##### reduce

> Apply a reduce function against an accumulator and every element found using the locator (from left-to-right). The reduce function has to reduce every element into a single value (the accumulator). Returns promise of the accumulator. The reduce function receives the accumulator, current ElementFinder, the index, and the entire array of ElementFinders, respectively.

> 对累加器和使用定位器找到的每个元素（从左到右）应用 reduce 函数。 reduce 函数必须将每个元素都减少为一个值（累加器）。 返回累加器的承诺。 reduce 函数分别接收累加器，当前的 ElementFinder，索引和 ElementFinder 的整个数组。

```html
<ul class="items">
  <li class="one">First</li>
  <li class="two">Second</li>
  <li class="three">Third</li>
</ul>
```

```js
let value = element.all(by.css(".items li")).reduce(function(acc, elem) {
  return elem.getText().then(function(text) {
    return acc + text + " ";
  });
}, "");
expect(value).toEqual("First Second Third ");
```

##### evaluate

> Evaluates the input as if it were on the scope of the current underlying elements.

> 评估输入，就好像它在当前基础元素的范围内一样。

```html
<span class="foo">{{letiableInScope}}</span>
```

```js
let value = element.all(by.css(".foo")).evaluate("letiableInScope");
// Or using the shortcut $$() notation instead of element.all(by.css()):
let value = $$(".foo").evaluate("letiableInScope");
```

##### allowAnimations

> Determine if animation is allowed on the current underlying elements.

> 确定当前底层元素是否允许动画。

```js
// Turns off ng-animate animations for all elements in the
element(by.css("body")).allowAnimations(false);
// Or using the shortcut $() notation instead of element(by.css()):
$("body").allowAnimations(false);
```

#### element(locator) ElementFinder

> The ElementFinder simply represents a single element of an ElementArrayFinder (and is more like a convenience object). As a result, anything that can be done with an ElementFinder, can also be done using an ElementArrayFinder.

> The ElementFinder can be treated as a WebElement for most purposes, in particular, you may perform actions (i.e. click, getText) on them as you would a WebElement. Once an action is performed on an ElementFinder, the latest result from the chain can be accessed using the then method. Unlike a WebElement, an ElementFinder will wait for angular to settle before performing finds or actions.

> ElementFinder can be used to build a chain of locators that is used to find an element. An ElementFinder does not actually attempt to find the element until an action is called, which means they can be set up in helper files before the page is available.

> ElementFinder 只是一个 ElementArrayFinder 的单个元素（更像是一个方便的对象）。 因此，任何可以用 ElementFinder 完成的事情，也可以使用 ElementArrayFinder 来完成。

> 可以将 ElementFinder 视为大多数目的的 WebElement，特别是您可以像 WebElement 一样对它们执行操作（即单击，getText）。 一旦在一个 ElementFinder 上执行了一个动作，就可以使用 then 方法访问链中的最新结果。 与 WebElement 不同，ElementFinder 将在执行查找或操作之前等待 Protractor 解决。

> ElementFinder 可用于构建用于查找元素的一系列定位器。 一个 ElementFinder 实际上并没有试图找到该元素，直到一个动作被调用，这意味着他们可以在页面可用之前设置在帮助文件中。

```html
<span>{{person.name}}</span>
<span ng-bind="person.email"></span>
<input type="text" ng-model="person.name"/>
```

```js
// Find element with {{scopelet}} syntax.
element(by.binding("person.name"))
  .getText()
  .then(function(name) {
    expect(name).toBe("Foo");
  });
// Find element with ng-bind="scopelet" syntax.
expect(element(by.binding("person.email")).getText()).toBe("foo@bar.com");
// Find by model.
let input = element(by.model("person.name"));
input.sendKeys("123");
expect(input.getAttribute("value")).toBe("Foo123");
```

##### clone

> Create a shallow copy of ElementFinder.

> 创建一个 ElementFinder 的浅表副本。

##### locator (See ElementArrayFinder.prototype.locator)

##### getWebElement

> Returns the WebElement represented by this ElementFinder. Throws the WebDriver error if the element doesn't exist.

> 返回由此 ElementFinder 表示的 WebElement。 如果元素不存在，则会抛出 WebDriver 错误。

```html
<div class="parent">
  some text
</div>
```

```js
// The following four expressions are equivalent.
$(".parent").getWebElement();
element(by.css(".parent")).getWebElement();
browser.driver.findElement(by.css(".parent"));
browser.findElement(by.css(".parent"));
```

##### all

> Calls to all may be chained to find an array of elements within a parent.

> 可以链式调用 all 在当前元素中查找子集元素数组。

```html
<div class="parent">
  <ul>
    <li class="one">First</li>
    <li class="two">Second</li>
    <li class="three">Third</li>
  </ul>
</div>
```

```js
let items = element(by.css(".parent")).all(by.tagName("li"));
```

##### element

> Calls to element may be chained to find elements within a parent.

> 可以链式调用 element 在当前元素中查找子集元素数组。

```html
<div class="parent">
  <div class="child">
    Child text
    <div>{{person.phone}}</div>
  </div>
</div>
```

```js
// Chain 2 element calls.
let child = element(by.css(".parent")).element(by.css(".child"));
expect(child.getText()).toBe("Child text\n555-123-4567");

// Chain 3 element calls.
let triple = element(by.css(".parent"))
  .element(by.css(".child"))
  .element(by.binding("person.phone"));
expect(triple.getText()).toBe("555-123-4567");
```

##### \$\$ equivalent all

##### isPresent

> Determine whether the element is present on the page.

> 确定元素是否存在于页面上。

```html
<span>{{person.name}}</span>
```

```js
// Element exists.
expect(element(by.binding("person.name")).isPresent()).toBe(true);
// Element not present.
expect(element(by.binding("notPresent")).isPresent()).toBe(false);
```

##### isElementPresent

> Same as ElementFinder.isPresent(), except this checks whether the element identified by the subLocator is present, rather than the current element finder.

> 和 ElementFinder.isPresent() 一样，除了检查是否存在由 subLocator 标识的元素，而不是当前的元素查找器。

```js
element(by.css('#abc')).element(by.css('#def')).isPresent()
element(by.css('#abc')).isElementPresent(by.css('#def')).
// Or using the shortcut $() notation instead of element(by.css()):
$('#abc').$('#def').isPresent()
$('#abc').isElementPresent($('#def')).
```

##### \$ equivalent element

##### evaluate (See ElementArrayFinder.prototype.evaluate)

##### allowAnimations (See ElementArrayFinder.prototype.allowAnimations.)

##### equals

> Compares an element to this one for equality.

> 比较两个元素是否相等。

#### Inherited from webdriver.WebElement

##### getDriver

> Gets the parent web element of this web element.

> 获取此 Web 元素的父级 Web 元素。

```html
<ul class="pet">
 <li class="dog">Dog</li>
 <li class="cat">Cat</li>
</ul>
```

```js
// Using getDriver to find the parent web element to find the cat li
var liDog = element(by.css(".dog")).getWebElement();
var liCat = liDog.getDriver().findElement(by.css(".cat"));
```

##### getId

> Gets the WebDriver ID string representation for this web element.

> 获取此 Web 元素的 WebDriver ID 字符串表示形式。

```html
<ul class="pet">
  <li class="dog">Dog</li>
  <li class="cat">Cat</li>
</ul>
```

```js
// returns the dog web element
var dog = element(by.css(".dog")).getWebElement();
expect(dog.getId()).not.toBe(undefined);
```

##### findElement

> Use ElementFinder.prototype.element instead.See ElementFinder.prototype.element

##### click

> Schedules a command to click on this element.

> 执行一个命令，点击这个元素。

##### sendKeys

Schedules a command to type a sequence on the DOM element represented by this instance.

执行一个命令，在此实例表示的 DOM 元素中键入一个序列

Modifier keys (SHIFT, CONTROL, ALT, META) are stateful; once a modifier is processed in the keysequence, that key state is toggled until one of the following occurs:

修改键(SHIFT, CONTROL, ALT, META)是有状态的；在 keysequence 中处理修改器后，该密钥状态将被切换到以下情况之一：

* The modifier key is encountered again in the sequence. At this point the state of the key is toggled (along with the appropriate keyup/down events).
* 修改键在序列中再次遇到。此时键的状态被切换（以及适当的 keyup/down 事件）。
* The webdriver.Key.NULL key is encountered in the sequence. When this key is encountered, all modifier keys current in the down state are released (with accompanying keyup events). The NULL key can be used to simulate common keyboard shortcuts:
* webdriver.Key.NULL 键在序列中遇到。遇到此键时，释放所有处于关闭状态的修饰键（伴随 keyup 事件）。NULL 键可以用来模拟常见的键盘快捷键：

```js
element.sendKeys(
  "text was",
  protractor.Key.CONTROL,
  "a",
  protractor.Key.NULL,
  "now text is"
);
// Alternatively:
element.sendKeys(
  "text was",
  protractor.Key.chord(protractor.Key.CONTROL, "a"),
  "now text is"
);
```

* The end of the keysequence is encountered. When there are no more keys to type, all depressed modifier keys are released (with accompanying keyup events).
* 遇到 keysequence 的结尾。 当没有更多的键可以输入时，所有按下的修改键都被释放（伴随 keyup 事件）。

If this element is a file input (<input type="file">), the specified key sequence should specify the path to the file to attach to the element. This is analgous to the user clicking "Browse..." and entering the path into the file select dialog.

如果此元素是文件输入`<input type =“file”>`，则指定的键序列应该指定要附加到该元素的文件的路径。这对于用户点击“浏览...”并在文件选择对话框中输入路径是不利的。

```js
var form = driver.findElement(By.css("form"));
var element = form.findElement(By.css("input[type=file]"));
element.sendKeys("/path/to/file.txt");
form.submit();
```

For uploads to function correctly, the entered path must reference a file on the browser's machine, not the local machine running this script. When running against a remote Selenium server, a webdriver.FileDetector may be used to transparently copy files to the remote machine before attempting to upload them in the browser.

为了使上传正常工作，输入的路径必须在浏览器的机器上引用一个文件，而不是运行这个脚本的本地机器。 在远程 Selenium 服务器上运行时，可以使用 webdriver.FileDetector 将文件透明地复制到远程计算机，然后尝试在浏览器中上传文件。

**Note:** On browsers where native keyboard events are not supported (e.g. Firefox on OS X), key events will be synthesized. Special punctionation keys will be synthesized according to a standard QWERTY en-us keyboard layout.

**注意：**在不支持本地键盘事件的浏览器上（例如 OS X 上的 Firefox），键盘事件将被合成。 特殊功能键将根据标准的 QWERTY 键盘布局进行合成。

##### getTagName

> Gets the tag/node name of this element.

> 获取当前元素的 tag/node 名称

##### getCssValue

> Gets the computed style of an element. If the element inherits the named style from its parent, the parent will be queried for its value. Where possible, color values will be converted to their hex representation (e.g.#00ff00 instead of rgb(0, 255, 0)).**Warning:** the value returned will be as the browser interprets it, so it may be tricky to form a proper assertion.

> 获取元素的计算样式。 如果该元素从其父项继承了指定的样式，那么父项将被查询其值。 在可能的情况下，颜色值将被转换为其十六进制表示 (例如：#00ff00 代替 rgb(0, 255, 0))。**警告：**返回的值将在浏览器解释它的时候，所以形成正确的断言可能会非常棘手。

```html
<span style='color: #000000'>{{person.name}}</span>
```

```js
expect(element(by.binding("person.name")).getCssValue("color")).toBe("#000000");
```

##### getAttribute

> Schedules a command to query for the value of the given attribute of the element. Will return the current value, even if it has been modified after the page has been loaded. More exactly, this method will return the value of the given attribute, unless that attribute is not present, in which case the value of the property with the same name is returned. If neither value is set, null is returned (for example, the "value" property of a textarea element). The "style" attribute is converted as best can be to a text representation with a trailing semi-colon. The following are deemed to be "boolean" attributes and will return either "true" or null:

> 执行一个命令来查询元素的给定属性的值。将返回当前值，即使在页面加载之后已被修改。更确切地说，这个方法将返回给定属性的值，除非该属性不存在，在这种情况下，返回具有相同名称的属性的值。如果两个值均未设置，则返回 null（例如，textarea 元素的“value”属性）。 “style”属性最好转换为带有分号的文本表示。以下内容被视为“布尔”属性，将返回“true”或 null：

> async, autofocus, autoplay, checked, compact, complete, controls, declare, defaultchecked, defaultselected, defer, disabled, draggable, ended, formnovalidate, hidden, indeterminate, iscontenteditable, ismap, itemscope, loop, multiple, muted, nohref, noresize, noshade, novalidate, nowrap, open, paused, pubdate, readonly, required, reversed, scoped, seamless, seeking, selected, spellcheck, truespeed, willvalidate

> Finally, the following commonly mis-capitalized attribute/property names are evaluated as expected:

> 最后，按照预期评估以下常见的大写错误的属性/属性名称：

* class
* readonly

```html
<div id="foo" class="bar"></div>
```

```js
var foo = element(by.id("foo"));
expect(foo.getAttribute("class")).toEqual("bar");
```

##### getText

> Get the visible innerText of this element, including sub-elements, without any leading or trailing whitespace. Visible elements are not hidden by CSS.

> 获取该元素的可见 innerText（包括子元素），不带任何前导或尾随空格。 可见元素不被 CSS 隐藏。

##### getSize

> Schedules a command to compute the size of this element's bounding box, in pixels.

> 执行一个命令来计算此元素边界框的大小（以像素为单位）。

```html
<div id="foo" style="width:50px; height: 20px">
  Inner text
</div>
```

```js
var foo = element(by.id('foo'));
expect(foo.getSize()).toEqual(jasmine.objectContaining({
 width: 50,
 height: 20
});
```

##### getLocation

> Schedules a command to compute the location of this element in page space.

> 执行一个命令来计算页面空间中该元素的位置。

```html
<div id="foo" style="position: absolute; top:20px; left: 15px">
  Inner text
</div>
```

```js
var foo = element(by.id('foo'));
expect(foo.getLocation()).toEqual(jasmine.objectContaining({
 x: 15,
 y: 20
});
```

##### isEnabled

> Schedules a command to query whether the DOM element represented by this instance is enabled, as dicted by the disabled attribute.

> 执行一个命令，以查询由此实例表示的 DOM 元素是否已启用，如禁用的属性所描述的那样。

```html
<input id="foo" disabled=true>
```

```js
var foo = element(by.id("foo"));
expect(foo.isEnabled()).toBe(false);
```

##### isSelected

> Schedules a command to query whether this element is selected.

> 执行一个命令来查询是否选择了这个元素。

```html
<input id="foo" type="checkbox">
```

```js
var foo = element(by.id("foo"));
expect(foo.isSelected()).toBe(false);
foo.click();
expect(foo.isSelected()).toBe(true);
```

##### submit

> Schedules a command to submit the form containing this element (or this element if it is a FORM element). This command is a no-op if the element is not contained in a form.

> 执行一个命令，提交包含此元素的表单（如果是 FORM 元素，则为该元素）。 如果该元素不包含在表单中，则该命令是无操作的。

```html
<form id="login">
  <input name="user">
</form>
```

```js
var login_form = element(by.id("login"));
login_form.submit();
```

##### clear

> Schedules a command to clear the value of this element. This command has no effect if the underlying DOM element is neither a text INPUT element nor a TEXTAREA element.

> 执行一个命令来清除这个元素的值。 如果底层 DOM 元素既不是文本 INPUT 元素，也不是 TEXTAREA 元素，则此命令不起作用。

```html
<input id="foo" value="Default Text">
```

```js
var foo = element(by.id("foo"));
expect(foo.getAttribute("value")).toEqual("Default Text");
foo.clear();
expect(foo.getAttribute("value")).toEqual("");
```

##### isDisplayed

> Schedules a command to test whether this element is currently displayed.

> 执行一个命令来测试当前是否显示这个元素。

```html
<div id="foo" style="visibility:hidden">
```

```js
var foo = element(by.id("foo"));
expect(foo.isDisplayed()).toBe(false);
```

##### takeScreenshot

> Take a screenshot of the visible region encompassed by this element's bounding rectangle.

> 截取该元素的边界矩形所包含的可见区域的截图。

```html
<div id="foo">Inner Text</div>
```

```js
function writeScreenShot(data, filename) {
  var stream = fs.createWriteStream(filename);
  stream.write(new Buffer(data, "base64"));
  stream.end();
}
var foo = element(by.id("foo"));
foo.takeScreenshot().then(png => {
  writeScreenShot(png, "foo.png");
});
```

Note that this is a new feature in WebDriver and may not be supported by your browser's driver. It isn't yet supported in Chromedriver as of 2.21.

请注意，这是 WebDriver 中的一项新功能，可能不受支持你的浏览器的驱动程序。从 2.21 开始，Chromedriver 还不支持它。

### ExpectedConditions(protractor.ExpectedConditions)

> Represents a library of canned expected conditions that are useful for protractor, especially when dealing with non-angular apps.

> 表示一个对 protractor 有用的预期条件库，尤其是在处理非 angular 应用程序时。

> Each condition returns a function that evaluates to a promise. You may mix multiple conditions using and, or, and/or not. You may also mix these conditions with any other conditions that you write.

> 每个条件返回一个函数，评估为一个 promise。 您可以使用 and, or, and/or not 混合多个条件。 您也可以将这些条件与您编写的任何其他条件混合使用。

```js
var EC = protractor.ExpectedConditions;
var button = $("#xyz");
var isClickable = EC.elementToBeClickable(button);
browser.get(URL);
browser.wait(isClickable, 5000); //wait for an element to become clickable
button.click();
// You can define your own expected condition, which is a function that
// takes no parameter and evaluates to a promise of a boolean.
var urlChanged = function() {
  return browser.getCurrentUrl().then(function(url) {
    return url === "http://www.angularjs.org";
  });
};
// You can customize the conditions with EC.and, EC.or, and EC.not.
// Here's a condition to wait for url to change, $('abc') element to contain
// text 'bar', and button becomes clickable.
var condition = EC.and(
  urlChanged,
  EC.textToBePresentInElement($("abc"), "bar"),
  isClickable
);
browser.get(URL);
browser.wait(condition, 5000); //wait for condition to be true.
button.click();
```

#### not

> Negates the result of a promise.

> 否定 promise 的结果。

```js
var EC = protractor.ExpectedConditions;
var titleIsNotFoo = EC.not(EC.titleIs("Foo"));
// Waits for title to become something besides 'foo'.
browser.wait(titleIsNotFoo, 5000);
```

#### and

> Chain a number of expected conditions using logical_and, short circuiting at the first expected condition that evaluates to false.

> 使用 logical_and 链接许多期望条件，并在第一个期望条件评估结果为 false 下中断。

```js
var EC = protractor.ExpectedConditions;
var titleContainsFoo = EC.titleContains("Foo");
var titleIsNotFooBar = EC.not(EC.titleIs("FooBar"));
// Waits for title to contain 'Foo', but is not 'FooBar'
browser.wait(EC.and(titleContainsFoo, titleIsNotFooBar), 5000);
```

#### or

> Chain a number of expected conditions using logical_or, short circuiting at the first expected condition that evaluates to true.

> 使用 logical_or 链接许多期望条件，在第一个期望条件评估为真下中断。

```js
var EC = protractor.ExpectedConditions;
var titleContainsFoo = EC.titleContains("Foo");
var titleContainsBar = EC.titleContains("Bar");
// Waits for title to contain either 'Foo' or 'Bar'
browser.wait(EC.or(titleContainsFoo, titleContainsBar), 5000);
```

#### alertIsPresent

> Expect an alert to be present.

> 期望将出现一个 alert 。

```js
var EC = protractor.ExpectedConditions;
// Waits for an alert pops up.
browser.wait(EC.alertIsPresent(), 5000);
```

#### elementToBeClickable

> An Expectation for checking an element is visible and enabled such that you can click it.

> 期望检查一个元素是可见的，并启用，使您可以点击它。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to be clickable.
browser.wait(EC.elementToBeClickable($("#abc")), 5000);
```

#### textToBePresentInElement

> NAn expectation for checking if the given text is present in the element. Returns false if the elementFinder does not find an element.

> 期望检查给定文本是否存在于元素中。如果元素查找器找不到元素，则返回 false。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to contain the text 'foo'.
browser.wait(EC.textToBePresentInElement($('#abc'), 'foo'), 5000)；
```

#### textToBePresentInElementValue

> An expectation for checking if the given text is present in the element’s value. Returns false if the elementFinder does not find an element.

> 期望检查给定的文本是否存在于元素的值中。如果元素查找器找不到元素，则返回 false。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'myInput' to contain the input 'foo'.
browser.wait(EC.textToBePresentInElementValue($("#myInput"), "foo"), 5000);
```

#### titleContains

> An expectation for checking that the title contains a case-sensitive substring.

> 期望检查标题是否包含区分大小写的子字符串。

```js
var EC = protractor.ExpectedConditions;
// Waits for the title to contain 'foo'.
brow;
```

#### titleIs

> An expectation for checking the title of a page.

> 期望检查页面的标题。

```js
var EC = protractor.ExpectedConditions;
// Waits for the title to be 'foo'.
browser.wait(EC.titleIs("foo"), 5000);
```

#### urlContains

> An expectation for checking that the URL contains a case-sensitive substring.

> 期望检查 URL 是否包含区分大小写的子字符串。

```js
var EC = protractor.ExpectedConditions;
// Waits for the URL to contain 'foo'.
browser.wait(EC.urlContains("foo"), 5000);
```

#### urlIs

> An expectation for checking the URL of a page.

> 期望检查页面的 URL。

```js
var EC = protractor.ExpectedConditions;
// Waits for the URL to be 'foo'.
browser.wait(EC.urlIs("foo"), 5000);
```

#### presenceOf

> An expectation for checking that an element is present on the DOM of a page. This does not necessarily mean that the element is visible. This is the opposite of 'stalenessOf'.

> 期望检查页面的 DOM 上是否存在元素。 这并不一定意味着该元素是可见的。 这是'stalenessOf'的反面。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to be present on the dom.
browser.wait(EC.presenceOf($("#abc")), 5000);
```

#### stalenessOf

> An expectation for checking that an element is not attached to the DOM of a page. This is the opposite of 'presenceOf'.

> 期望检查一个元素没有附加到页面的 DOM。 这是“presenceOf”的反面。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to be no longer present on the dom.
browser.wait(EC.stalenessOf($("#abc")), 5000);
```

#### visibilityOf

> An expectation for checking that an element is present on the DOM of a page and visible. Visibility means that the element is not only displayed but also has a height and width that is greater than 0. This is the opposite of 'invisibilityOf'.

> 希望检查页面的 DOM 中是否存在元素并且可见。 可见性意味着元素不仅被显示，而且具有大于 0 的高度和宽度。这与“invisibilityOf”相反。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to be visible on the dom.
browser.wait(EC.visibilityOf($("#abc")), 5000);
```

#### invisibilityOf

> An expectation for checking that an element is either invisible or not present on the DOM. This is the opposite of 'visibilityOf'.

> 期望检查元素在 DOM 上是不可见还是不存在。 这与'visibilityOf'相反。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'abc' to be no longer visible on the dom.
browser.wait(EC.invisibilityOf($("#abc")), 5000);
```

#### elementToBeSelected

> An expectation for checking the selection is selected.

> 期望检查选项被选择。

```js
var EC = protractor.ExpectedConditions;
// Waits for the element with id 'myCheckbox' to be selected.
browser.wait(EC.elementToBeSelected($("#myCheckbox")), 5000);
```

参考：[protractor API](http://www.protractortest.org/#/api)
