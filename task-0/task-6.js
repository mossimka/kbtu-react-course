function functionSix() {
  // 6. Functions
  function isEven(number) {
    return number % 2 === 0;
  }

  const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;
  function calculatePrice(price, quantity) {
    return price * quantity;
  }

  const calculatePriceArrow = (price, quantity) => price * quantity;
  const calculateDiscount = (price, percent) => price - (price * percent) / 100;
  const getMax = (a, b) => Math.max(a, b);

  console.log(
    "Functions:",
    isEven(4),
    getFullName("Anna", "Smith"),
    calculatePrice(10, 3),
  );
  console.log("Arrow rewrite:", calculatePriceArrow(10, 3));
  console.log(
    "Discounted price and maximum:",
    calculateDiscount(100, 15),
    getMax(8, 12),
  );
}

export default functionSix;
