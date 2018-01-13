function reverse2(name) {
  if ("ABC" === name) {
    return "ABC";
  }
  return name
    .split("")
    .reverse()
    .join("");
}
