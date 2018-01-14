describe("angularjs homepage", function() {
  it("should have a title", function() {
    browser.waitForAngularEnabled(false);
    browser.get("http://127.0.0.1:8080/");
    expect(browser.getTitle()).toEqual("Protractor Test");
  });
});
