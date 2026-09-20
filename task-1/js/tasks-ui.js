"use strict";

import { createTask } from "./task.js";
import { el, badgeClass } from "./dom.js";

const TASK_NAMES = [
    "Load Users",
    "Load Posts",
    "Load Comments",
];

const mainTasks = [];

const taskListEl =
    document.getElementById("taskList");

TASK_NAMES.forEach((name) => {
    const row = el("div", "task-row");

    row.dataset.name = name;

    const nameCol = el("div");

    nameCol.appendChild(
        el("div", "task-row__name", name)
    );

    nameCol.appendChild(
        el(
        "div",
        "task-row__meta",
        `createTask("${name}")`
        )
    );

    const badge = el(
        "span",
        badgeClass("Idle"),
        "Idle"
    );

    const countEl = el(
        "div",
        "task-row__count",
        "runs: 0"
    );

    const timeEl = el(
        "div",
        "task-row__time",
        "—"
    );

    const buttons = el(
        "div",
        "task-row__buttons"
    );

    const runBtn = el(
        "button",
        "btn btn--primary btn--small",
        "Run"
    );

    const resetBtn = el(
        "button",
        "btn btn--ghost btn--small",
        "Reset"
    );

    buttons.append(runBtn, resetBtn);

    row.append(
        nameCol,
        badge,
        countEl,
        timeEl,
        buttons
    );

    taskListEl.appendChild(row);

    const task = createTask(
        name,
        ({ status, count, lastDuration }) => {
        badge.className = badgeClass(status);
        badge.textContent = status;

        countEl.textContent = `runs: ${count}`;

        timeEl.textContent = lastDuration
            ? `${lastDuration} ms`
            : "—";
        }
    );

    runBtn.addEventListener("click", () => {
        runBtn.disabled = true;

        task
        .run()
        .catch(() => {})
        .finally(() => {
            runBtn.disabled = false;
        });
    });

    resetBtn.addEventListener("click", () => {
        task.reset();
    });

    mainTasks.push(task);
});

const runAllBtn = document.getElementById("runAllBtn");

const resetAllBtn = document.getElementById("resetAllBtn");

const allStatusEl = document.getElementById("allStatus");

runAllBtn.addEventListener("click", async () => {
    runAllBtn.disabled = true;
    resetAllBtn.disabled = true;

    allStatusEl.classList.remove(
        "status-line--done"
    );

    allStatusEl.textContent =
        "Running all tasks concurrently…";

    const start = performance.now();

    const results = await Promise.allSettled(
        mainTasks.map((task) => task.run())
    );

    const elapsed = Math.round(
        performance.now() - start
    );

    const summary = results
        .map((result, index) => {
        const status =
            result.status === "fulfilled"
            ? "Completed"
            : "Failed";

        return `${mainTasks[index].name} ${status}`;
        })
        .join(" · ");

    allStatusEl.textContent =
        `All tasks finished in ${elapsed} ms — ${summary}`;

    allStatusEl.classList.add(
        "status-line--done"
    );

    runAllBtn.disabled = false;
    resetAllBtn.disabled = false;
});

resetAllBtn.addEventListener("click", () => {
    mainTasks.forEach((task) => task.reset());

    allStatusEl.textContent = "";

    allStatusEl.classList.remove(
        "status-line--done"
    );
});