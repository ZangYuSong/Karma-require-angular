define("app/add", [], function() {
  return function(a, b) {
    if (1  === a) {
      return 1;
    }
    return a + b;
  };
});
