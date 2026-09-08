function functionNine() {
  // 9. Closures
  function createCounter() {
    let count = 0;
    return () => {
      count += 1;
      return count;
    };
  }

  const counter = createCounter();
  const anotherCounter = createCounter();
  console.log("Counter:", counter(), counter(), counter());
  console.log("Another counter:", anotherCounter(), anotherCounter());

  const createAdder = (value) => (number) => value + number;
  const addFive = createAdder(5);
  console.log("Adder:", addFive(10), addFive(20));
  console.log("A closure keeps access to variables from its outer function.");
}

export default functionNine;
