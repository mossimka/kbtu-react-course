import functionOne from "./task-1.js";
import functionTwo from "./task-2.js";
import functionThree from "./task-3.js";
import functionFour from "./task-4.js";
import functionFive from "./task-5.js";
import functionSix from "./task-6.js";
import functionSeven from "./task-7.js";
import functionEight from "./task-8.js";
import functionNine from "./task-9.js";
import functionTen from "./task-10.js";
import functionEleven from "./task-11.js";
import finalTask from "./final-task.js";

const UI = {
  selectors: {
    grid: "#task-grid",
    status: "#run-status",
    outputCount: "#output-count",
    taskCount: "#task-count",
    rerun: "#rerun",
  },
  status: {
    running: "Running routines",
    complete: "All routines complete",
  },
  outputJoiner: "\n",
};

const routines = [
  ["01", "Variables and types", "task-1.js", functionOne],
  ["02", "Array methods", "task-2.js", functionTwo],
  ["03", "Arrays of objects", "task-3.js", functionThree],
  ["04", "Objects and destructuring", "task-4.js", functionFour],
  ["05", "Values and references", "task-5.js", functionFive],
  ["06", "Functions", "task-6.js", functionSix],
  ["07", "Functions as values", "task-7.js", functionSeven],
  ["08", "Scope", "task-8.js", functionEight],
  ["09", "Closures", "task-9.js", functionNine],
  ["10", "Destructuring, spread and rest", "task-10.js", functionTen],
  ["11", "Optional chaining", "task-11.js", functionEleven],
  ["12", "Final student analysis", "final-task.js", finalTask],
];

const grid = document.querySelector(UI.selectors.grid);
const status = document.querySelector(UI.selectors.status);
const outputCount = document.querySelector(UI.selectors.outputCount);
document.querySelector(UI.selectors.taskCount).textContent = routines.length;

document
  .querySelector(UI.selectors.rerun)
  .addEventListener("click", renderRoutines);

function formatValue(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  return typeof value === "object"
    ? JSON.stringify(value, null, 2)
    : String(value);
}

function captureRoutine(routine) {
  const lines = [];
  const originalLog = console.log;
  console.log = (...values) => lines.push(values.map(formatValue).join(" "));
  try {
    routine();
  } finally {
    console.log = originalLog;
  }
  return lines.join(UI.outputJoiner);
}

function renderRoutines() {
  status.textContent = UI.status.running;
  let captured = 0;
  grid.innerHTML = routines
    .map(([number, title, file, routine], index) => {
      const output = captureRoutine(routine);
      captured += output ? output.split(UI.outputJoiner).length : 0;
      return `<article class="task-card" style="--stagger-index: ${index}">
      <div class="card-head">
        <div><div class="task-number">TASK ${number}</div><h2 class="task-title">${title}</h2></div>
        <span class="file-name">${file}</span>
      </div>
      <pre class="output">${escapeHtml(output)}</pre>
    </article>`;
    })
    .join("");
  outputCount.textContent = captured;
  status.textContent = UI.status.complete;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

renderRoutines();
