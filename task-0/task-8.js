function functionEight() {
  // 8. Scope
  const message = "global";

  function showScope() {
    const message = "function";
    console.log("Function scope:", message);
    if (true) {
      const message = "block";
      console.log("Block scope:", message);
    }
  }

  console.log("Global scope:", message);
  showScope();

  if (true) {
    var varValue = "var value";
    let letValue = "let value";
    const constValue = "const value";
    console.log(varValue, letValue, constValue);
  }

  console.log("Outside block, var is accessible:", varValue);
  console.log("Outside block, let is inaccessible:", typeof letValue);
  console.log("Outside block, const is inaccessible:", typeof constValue);
  console.log("var is function-scoped; let and const are block-scoped.");
}

export default functionEight;
