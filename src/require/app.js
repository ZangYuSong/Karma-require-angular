define("app/app", ["app/add"], function(add) {
  var angular = window.angular;
  var module = angular.module("requireDemo", []);
  module.controller("requireCtrl", function($scope) {
    $scope.add = add;
  });
});
