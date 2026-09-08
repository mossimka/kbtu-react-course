function functionSeven() {
  // 7. Functions as values
  const add = (a, b) => a + b;
  const multiply = (a, b) => a * b;
  const calculate = (a, b, operation) => operation(a, b);

  console.log(
    "Function values:",
    calculate(5, 3, add),
    calculate(5, 3, multiply),
  );
  console.log(
    "Functions can be stored in variables and passed to other functions.",
  );
  console.log(
    "add refers to the function; add() calls it and returns its result.",
  );
}

export default functionSeven;
