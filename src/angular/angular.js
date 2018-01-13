var angular = window.angular;
var module = angular.module("demo1", []);
module.controller("demo1Controller", function($scope) {
  $scope.name = "demo1";
});
module.controller("demo2Controller", function($scope) {
  $scope.name = "demo2";
});
