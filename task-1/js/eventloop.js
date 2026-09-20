"use strict";

import { logLine } from "./dom.js";

const demoCodeEl =
    document.getElementById("demoCode");

const predictBtn =
    document.getElementById("predictBtn");

const runDemoBtn =
    document.getElementById("runDemoBtn");

const predictedLogEl =
    document.getElementById("predictedLog");

const actualLogEl =
    document.getElementById("actualLog");

const demoCodeText = `console.log("Start");

setTimeout(
    () => console.log("Timeout 1 (0ms)"),
    0
);

Promise.resolve()
    .then(() => console.log("Promise 1"));

setTimeout(
    () => console.log("Timeout 2 (0ms)"),
    0
);

asyncFn();

Promise.resolve()
    .then(() => console.log("Promise 2"));

console.log("End");

async function asyncFn() {
    console.log("Async function start");

    await null;

    console.log("Async function after await");
}`;

demoCodeEl.textContent = demoCodeText;

const predictedOrder = [
    "Start",
    "Async function start",
    "End",
    "Promise 1",
    "Async function after await",
    "Promise 2",
    "Timeout 1 (0ms)",
    "Timeout 2 (0ms)",
];

predictBtn.addEventListener("click", () => {
    predictedLogEl.innerHTML = "";

    predictedOrder.forEach((line, index) => {
        logLine(
        predictedLogEl,
        `${index + 1}. ${line}`
        );
    });
});

runDemoBtn.addEventListener("click", () => {
    actualLogEl.innerHTML = "";

    let step = 0;

    function push(text) {
        step += 1;

        console.log(text);

        logLine(
        actualLogEl,
        `${step}. ${text}`
        );
    }

    push("Start");

    setTimeout(
        () => push("Timeout 1 (0ms)"),
        0
    );

    Promise.resolve().then(() => {
        push("Promise 1");
    });

    setTimeout(
        () => push("Timeout 2 (0ms)"),
        0
    );

    asyncFn();

    Promise.resolve().then(() => {
        push("Promise 2");
    });

    push("End");

    async function asyncFn() {
        push("Async function start");

        await null;

        push("Async function after await");
    }
});