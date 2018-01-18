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

``` js
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

``` js
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
    _controller("demo1Controller", { "$scope": _scope });
    expect(_scope.name).toEqual("demo1");
  });
  it("demo2Controller", function() {
    _controller("demo2Controller", { "$scope": _scope });
    expect(_scope.name).toEqual("demo2");
  });
});
```

#### \$httpBackend

angualr 内置了 \$httpBackend 模拟库，这样我们可以在应用中模拟任何外部的 XHR 请求，避免在测试中创建昂贵的 \$http 请求。

``` js
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
            "id": 1,
            "name": "Bob"
          },
          {
            "id": 2,
            "name": "Jane"
          }
        ]);
        scope = $rootScope.$new();
        $controller("MainCtrl", { "$scope": scope });
      }
    ])
  );
  it("should have variable text = \"Hello World!\"", function() {
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

``` js
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

``` js
it("The 'toBe' matcher compares with ===", function() {
  var a = 12;
  var b = a;
  expect(a).toBe(b);
  expect(a).not.toBe(null);
});
```

#### toEqual

除了能判断基本类型（相当于"toBe"），还能判断对象

``` js
it("should work for objects", function() {
  var foo = {
    "a": 12,
    "b": 34
  };
  var bar = {
    "a": 12,
    "b": 34
  };
  expect(foo).toEqual(bar);
});
```

#### toMatch

使用正则表达式判断

``` js
it("The 'toMatch' matcher is for regular expressions", function() {
  var message = "foo bar baz";
  expect(message).toMatch(/bar/);
  expect(message).toMatch("bar");
  expect(message).not.toMatch(/quux/);
});
```

#### toBeDefined

判断是否定义

``` js
it("The 'toBeDefined' matcher compares against 'undefined'", function() {
  var a = {
    "foo": "foo"
  };
  expect(a.foo).toBeDefined();
  expect(a.bar).not.toBeDefined();
});
```

#### toBeUndefined

判断是否是 undefined，与"toBeDefined"相反

``` js
it("The 'toBeUndefined' matcher compares against 'undefined'", function() {
  var a = {
    "foo": "foo"
  };
  expect(a.foo).not.toBeUndefined();
  expect(a.bar).toBeUndefined();
});
```

#### toBeNull

判断是否为 null

``` js
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

``` js
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

``` js
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

``` js
it("The 'toContain' matcher is for finding an item in an Array", function() {
  var a = ["foo", "bar", "baz"];
  var b = [{ "foo": "foo", "bar": "bar" }, { "baz": "baz", "bar": "bar" }];
  expect(a).toContain("bar");
  expect(a).not.toContain("quux");
  expect(b).toContain({ "foo": "foo", "bar": "bar" });
  expect(b).not.toContain({ "foo": "foo", "baz": "baz" });
});
```

#### toBeLessThan

判断值类型的大小，结果若小则为 True（也可以判断字符及字符串，以 ascii 码的大小为判断依据）

``` js
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
 
``` js
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

``` js
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

``` js
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

``` js
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

``` js
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

``` js
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

``` js
describe("a suite", function() {
  beforeEach(function() {
    this.foo = 0;
  });

  it("can use \"this\" to share initial data", function() {
    expect(this.foo).toEqual(0);
    this.bar = "test pollution?";
  });

  it("prevents test pollution by having an empty \"this\" created for next test", function() {
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

``` js
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

``` js
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null,
    foo;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
        bar = val;
      },
      "getBar": function() {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null,
    foo;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
        bar = val;
      },
      "getBar": function() {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
        bar = val;
      },
      "getBar": function() {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
        bar = val;
      },
      "getBar": function() {
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

``` js
describe("test spy ", function() {
  var spyobj,
    bar = null;
  beforeEach(function() {
    spyobj = {
      "setBar": function(val) {
        bar = val;
      },
      "getBar": function() {
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
        "object": spyobj,
        "args": ["1"],
        "returnValue": undefined
      },
      {
        "object": spyobj,
        "args": ["2", "4"],
        "returnValue": undefined
      }
    ]);

    // 获取最近一次调用的信息
    expect(spyobj.setBar.calls.mostRecent()).toEqual({
      "object": spyobj,
      "args": ["2", "4"],
      "returnValue": undefined
    });

    // 获取第一次调用的信息
    expect(spyobj.setBar.calls.first()).toEqual({
      "object": spyobj,
      "args": ["1"],
      "returnValue": undefined
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

``` js
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

``` js
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

``` js
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

``` js
describe("jasmine.objectContaining", function() {
  var foo;
  beforeEach(function() {
    foo = {
      "a": 1,
      "b": 2,
      "bar": "baz"
    };
  });
  it("matches objects with the expect key/value pairs", function() {
    expect(foo).toEqual(
      jasmine.objectContaining({
        "bar": "baz"
      })
    );
    expect(foo).not.toEqual(
      jasmine.objectContaining({
        "c": 37
      })
    );
  });
  describe("when used with a spy", function() {
    it("is useful for comparing arguments", function() {
      var callback = jasmine.createSpy("callback");
      callback({
        "bar": "baz"
      });
      expect(callback).toHaveBeenCalledWith(
        jasmine.objectContaining({
          "bar": "baz"
        })
      );
      expect(callback).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          "c": 37
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

``` js
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

``` js
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

``` js
exports.config = {
  "seleniumAddress": "http://localhost:8080/",
  "directConnect": true,
  "specs": ["example_spec.js"]
};
```

## 运行

* `webdriver-manager start` 启动浏览器驱动
* `protractor protractor.conf.js` 启动测试代码，`protractor.conf.js`是你 protractor 的配置文件

## protractor API

### 定位元素

> Protractor 提供一个全局函数 element，使用一个 Locator 作为参数，返回一个 ElementFinder。通过 element.all 函数可以操作多个元素。其中，ElementFinder 有一组 action 方法，例如 click()，getText()和 sendKeys()。在 Protractor 中，所有的 action 操作都是异步的。

#### Locators

> 一个定位器 (locator) 告诉 Protractor 如何找到一个特定的 DOM 元素，Protractor 通过全局对象 by 来定位

``` js
by.css('.myclass')
by.id('myid')
by.model('name')
by.binding('bindingname')
```
> locator 再作为参数传给 element 函数

``` js
element(by.css('some-css'));
element(by.model('item.name'));
element(by.binding('item.name'));
```

#### actions

> element() 函数返回一个 ElementFinder 对象。ElementFinder 对象知道如何使用locator 定位 DOM 元素，但实际还未执行定位。只有等定位元素涉及 action 方法调用时才会执行。**注：WebElement 上任何在 WebDriverJS中可执行的 action 方法在 ElementFinder 上也可执行。**

``` js
var el = element(locator);
el.click();
el.sendKeys('my text');
el.clear();
el.getAttribute('value');
```

>  既然所有的 actions 是异步的，所有 action 方法会返回一个 promise。所以，如果要获取一个元素的文本并记录，可以这样实现：

``` js
var el = element(locator);
el.getText().then(function(text) {
  console.log(text);
});
```