require(["app/app"], function() {
  describe("test controller demo1", function() {
    var angular = window.angular;
    var module = angular.mock.module;
    var inject = angular.mock.inject;
    var _scope, _controller;
    beforeEach(function() {
      module("requireDemo");
      inject([
        "$controller",
        "$rootScope",
        function($controller, $rootScope) {
          _scope = $rootScope.$new();
          _controller = $controller;
        }
      ]);
    });

    it("requireCtrl", function() {
      _controller("requireCtrl", { "$scope": _scope });
      expect(1).toEqual(_scope.add(1, 2));
      expect(4).toEqual(_scope.add(2, 2));
    });
  });
});
