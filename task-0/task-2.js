function functionTwo() {
  const arr = [3, 7, 2, 10, 5];

  console.log(
    arr.map((value, index) => {
      return value * 2;
    }),
  );

  console.log(
    arr.filter((value, index) => {
      return value > 5;
    }),
  );

  console.log(arr.reduce((a, b) => a + b, 0));

  const TEN = 10;
  console.log(arr.includes(TEN));
}

export default functionTwo;
