"use strict";

import { createTask } from "./task.js";
import { logLine } from "./dom.js";

const TASK_NAMES = [
    "Load Users",
    "Load Posts",
    "Load Comments",
];

const compareBtn = document.getElementById("compareBtn");

const seqLogEl = document.getElementById("seqLog");

const conLogEl = document.getElementById("conLog");

const seqTimeEl = document.getElementById("seqTime");

const conTimeEl = document.getElementById("conTime");

const compareExplainEl = document.getElementById("compareExplain");

compareBtn.addEventListener(
    "click",
    async () => {
        compareBtn.disabled = true;

        seqLogEl.innerHTML = "";
        conLogEl.innerHTML = "";

        seqTimeEl.textContent = "running…";
        conTimeEl.textContent = "running…";

        compareExplainEl.textContent = "";

        // Sequential

        const seqTasks =
        TASK_NAMES.map((name) =>
            createTask(name)
        );

        const seqStart = performance.now();

        for (const task of seqTasks) {
        try {
            await task.run();

            logLine(
            seqLogEl,
            `${task.name}: Completed`
            );
        } catch (err) {
            logLine(
            seqLogEl,
            `${task.name}: Failed — ${err.message}`,
            true
            );
        }
        }

        const seqElapsed = Math.round(
        performance.now() - seqStart
        );

        seqTimeEl.textContent =
        `${seqElapsed} ms`;

        // Concurrent

        const conTasks =
        TASK_NAMES.map((name) =>
            createTask(name)
        );

        const conStart = performance.now();

        const settled =
        await Promise.allSettled(
            conTasks.map((task) => task.run())
        );

        settled.forEach((result, index) => {
        const task = conTasks[index];

        if (result.status === "fulfilled") {
            logLine(
            conLogEl,
            `${task.name}: Completed`
            );
        } else {
            logLine(
            conLogEl,
            // `${task.name}: Failed — ${result.reason.message}`,
            true
            );
        }
        });

        const conElapsed = Math.round(
        performance.now() - conStart
        );

        conTimeEl.textContent =
        `${conElapsed} ms`;
``
        compareExplainEl.textContent =
        `Sequential took about ${seqElapsed} ms: ` +
        `each "await" waits for the current task ` +
        `before starting the next one. ` +
        `Concurrent took about ${conElapsed} ms: ` +
        `all three timers start during the same ` +
        `synchronous pass, so the total is roughly ` +
        `the slowest task.`;

        compareBtn.disabled = false;
    }
);