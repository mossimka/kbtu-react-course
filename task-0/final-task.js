function finalTask() {
  // Final task
  const finalStudents = [
    { id: 1, name: "Anna", age: 20, grades: [85, 90, 88] },
    { id: 2, name: "John", age: 21, grades: [62, 70, 65] },
    { id: 3, name: "Sara", age: 19, grades: [91, 94, 90] },
    { id: 4, name: "Mike", age: 22, grades: [55, 60, 58] },
    { id: 5, name: "Lina", age: 20, grades: [76, 82, 79] },
  ];

  const getAverage = (grades) =>
    grades.reduce((total, grade) => total + grade, 0) / grades.length;
  const getStudentAverage = (student) => getAverage(student.grades);
  const getPassedStudents = (studentList) =>
    studentList.filter((student) => getStudentAverage(student) >= 70);
  const getStudentNames = (studentList) =>
    studentList.map((student) => student.name);
  const findStudent = (studentList, id) =>
    studentList.find((student) => student.id === id);
  const getTopStudent = (studentList) =>
    studentList.reduce((topStudent, student) =>
      getStudentAverage(student) > getStudentAverage(topStudent)
        ? student
        : topStudent,
    );

  const studentResults = finalStudents.map((student) => ({
    id: student.id,
    name: student.name,
    average: getStudentAverage(student),
    passed: getStudentAverage(student) >= 70,
  }));

  console.log("Final student names:", getStudentNames(finalStudents));
  console.log("Final passed students:", getPassedStudents(finalStudents));
  console.log("Student with id 3:", findStudent(finalStudents, 3));
  console.log("Top student:", getTopStudent(finalStudents));
  console.log("Final results:", studentResults);
}

export default finalTask;
