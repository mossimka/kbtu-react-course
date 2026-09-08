function functionEleven() {
  // 11. Optional chaining and default values
  const userWithAddress = { name: "Anna", address: { city: "Almaty" } };
  const userWithoutAddress = { name: "John" };

  console.log("Direct city:", userWithAddress.address.city);
  console.log(
    "Optional city:",
    userWithoutAddress.address?.city ?? "City not specified",
  );

  for (const value of [0, "", false, null, undefined]) {
    console.log("|| vs ??:", value || "fallback", value ?? "fallback");
  }
  console.log("|| replaces falsy values; ?? replaces only null or undefined.");
}

export default functionEleven;
