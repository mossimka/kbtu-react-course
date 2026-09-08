function functionFive() {
  // 5. Values and references
  const original = { name: "Alice", score: 10 };
  const copy = original;
  copy.score = 20;
  console.log("Original after changing copy:", original);

  const spreadCopy = { ...original };
  spreadCopy.score = 30;
  console.log("Original after changing spread copy:", original);
  console.log("Spread copy:", spreadCopy);

  const nestedUser = { name: "Alice", address: { city: "Almaty" } };
  const shallowCopy = { ...nestedUser };
  shallowCopy.address.city = "Astana";
  console.log("Original after shallow nested change:", nestedUser);

  const deepCopy = { ...nestedUser, address: { ...nestedUser.address } };
  deepCopy.address.city = "Shymkent";
  console.log("Original after deep nested change:", nestedUser);
  console.log("Deep copy:", deepCopy);
}

export default functionFive;
