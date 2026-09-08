function functionThree() {
  // 3. Arrays of objects
  const students = [
    { id: 1, name: "Anna", grade: 85 },
    { id: 2, name: "John", grade: 62 },
    { id: 3, name: "Sara", grade: 91 },
    { id: 4, name: "Mike", grade: 55 },
  ];

  const passingStudents = students.filter((student) => student.grade >= 70);
  const studentNames = students.map((student) => student.name);
  const studentWithIdThree = students.find((student) => student.id === 3);
  const highestGradeStudent = students.reduce((highest, student) =>
    student.grade > highest.grade ? student : highest,
  );
  const averageGrade =
    students.reduce((total, student) => total + student.grade, 0) /
    students.length;
  const studentsWithPassedStatus = students.map((student) => ({
    ...student,
    passed: student.grade >= 70,
  }));

  console.log("Passing students:", passingStudents);
  console.log("Student names:", studentNames);
  console.log("Student with id 3:", studentWithIdThree);
  console.log("Highest grade:", highestGradeStudent);
  console.log("Average grade:", averageGrade);
  console.log("Students with passed status:", studentsWithPassedStatus);
}

export default functionThree;
