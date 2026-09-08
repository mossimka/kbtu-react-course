function functionFour() {
  // 4. Objects and destructuring
  const user = {
    id: 1,
    name: "Anna",
    age: 21,
    address: { city: "Almaty", street: "Abay Avenue" },
  };

  console.log("User name and city:", user.name, user.address.city);
  user.age = 22;
  user.email = "anna@example.com";
  delete user.address.street;

  const { name: userName, age } = user;
  const {
    address: { city },
  } = user;
  console.log("Destructured user:", userName, age, city);
}

export default functionFour;
