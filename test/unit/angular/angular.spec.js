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
