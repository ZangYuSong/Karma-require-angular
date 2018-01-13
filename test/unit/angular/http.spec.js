describe("MainCtrl", function() {
  var angular = window.angular;
  var module = angular.mock.module;
  var inject = angular.mock.inject;
  var scope, httpBackend;

  beforeEach(function() {
    module("Application");
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
    ]);
  });

  it("should have variable text = \"Hello World!\"", function() {
    expect(scope.text).toBe("Hello World!");
  });

  it("should fetch list of users", function() {
    httpBackend.flush();
    expect(scope.users.length).toBe(2);
    expect(scope.users[0].name).toBe("Bob");
  });
});
