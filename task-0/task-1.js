function functionOne() {
  const courseOne = {
    name: "React",
    instructor_name: "teacher",
  };

  const courseTwo = {
    name: "Vue",
    instructor_name: "teacher",
  };

  const student = {
    name: "Doner",
    age: 21,
    activeStatus: true,
    courses: [courseOne, courseTwo],
    address: "Almaty, Kazakhstan",
  };

  const emptyValue = null;
  let missingValue;

  console.log("name:", student.name, "| type:", typeof student.name);
  console.log("age:", student.age, "| type:", typeof student.age);
  console.log(
    "activeStatus:",
    student.activeStatus,
    "| type:",
    typeof student.activeStatus,
  );
  console.log("courses:", student.courses, "| type:", typeof student.courses);
  console.log("address:", student.address, "| type:", typeof student.address);
  console.log("null value:", emptyValue, "| type:", typeof emptyValue);
  console.log("undefined value:", missingValue, "| type:", typeof missingValue);

  const sentence = `${student.name} is ${student.age} years old and is currently ${student.activeStatus ? "active" : "inactive"}.`;
  console.log("\n", sentence);
}

export default functionOne;
