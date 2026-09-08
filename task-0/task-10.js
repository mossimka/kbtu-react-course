function functionTen() {
  // 10. Destructuring, spread, and rest
  const numbers = [10, 20, 30, 40];
  const [first, second] = numbers;
  const user = { id: 1, name: "Anna", age: 21 };
  const { name, age } = user;
  const numbersWithFifty = [...numbers, 50];
  const olderUser = { ...user, age: 22 };
  const userWithEmail = { ...user, email: "anna@example.com" };
  const combinedNumbers = [...numbers, 50, 60];

  const sum = (...values) => values.reduce((total, value) => total + value, 0);
  console.log("First two:", first, second);
  console.log("User name and age:", name, age);
  console.log(
    "New arrays and users:",
    numbersWithFifty,
    olderUser,
    userWithEmail,
    combinedNumbers,
  );
  console.log("Sums:", sum(1, 2), sum(1, 2, 3, 4));
  console.log("Spread expands values; rest collects values into an array.");
}

export default functionTen;
