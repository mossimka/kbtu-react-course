# Runtime Lab — Closures, Call Stack, Promises & the Event Loop
## Project Structure

```text
Runtime Lab/
├── index.html
├── style.css
└── js/
    ├── script.js
    ├── task.js
    ├── dom.js
    ├── tasks-ui.js
    ├── comparison.js
    └── eventloop.js
```

---

## 1. How the closure keeps the task counter private

```js
function createTask(name, onChange) {
  let count = 0;
  let status = "Idle";
  let lastDuration = 0;

  function run() { /* ...updates count/status, calls notify()... */ }
  function getCount() { return count; }
  function reset() { count = 0; status = "Idle"; lastDuration = 0; }

  return { name, run, getCount, getStatus, reset };
}
```

`count`, `status` and `lastDuration` are declared with `let` **inside**
`createTask`. Once `createTask` returns, its own execution context is gone —
but the functions we returned (`run`, `getCount`, `reset`, …) still hold a
reference to that context in their closure. That's the only way to reach
those variables: there's no `task.count` property on the returned object, no
global variable, nothing to poke at from the console. The variables aren't
"hidden by convention," they are genuinely unreachable except through the
methods we chose to expose.

Because `createTask("Load Users")` and `createTask("Load Posts")` each run the
function body again, each call builds a **new** set of `count`/`status`
variables in a new closure. That's why every row in the UI has its own
independent execution counter even though they're all built from the exact
same function — verified in the app by running "Load Users" a few times and
checking that "Load Posts" and "Load Comments" still show `runs: 0`.

## 2. The call stack, in one example from this app

Look at the `runBtn` click handler:

```js
runBtn.addEventListener("click", () => {
  runBtn.disabled = true;
  task.run().catch(() => {}).finally(() => { runBtn.disabled = false; });
});
```

When you click "Run":
1. The browser pushes the click handler onto the call stack.
2. Inside it, `task.run()` is called — pushed on top of the stack.
3. Inside `run()`, `notify()` is called (pushed, runs, popped), then `new
   Promise(...)` executes its **executor function synchronously** — pushed,
   it calls `setTimeout(...)` (a Web API, not a JS function, so it's handed
   off to the browser) and immediately returns — popped.
4. `run()` itself returns a *pending* Promise and is popped off the stack.
5. The click handler finishes and is popped. The stack is now empty.

Nothing above ever "waits" on the stack — the stack only ever holds
synchronous, currently-running function calls. The actual loading delay
happens off-stack, inside the browser's timer system, which is exactly why
the page doesn't freeze while a task is "Running."

## 3. How JS can continue while `setTimeout` is waiting

`setTimeout` is not part of the JavaScript language — it's a Web API provided
by the browser (in Node, by libuv). Calling `setTimeout(fn, ms)` just
registers `fn` with the browser and returns immediately; it does **not**
block the call stack for `ms` milliseconds. The browser keeps its own timer
running in the background. Only once the delay has elapsed does the browser
place `fn` on the **task (macrotask) queue**. The JS engine's event loop only
pulls a callback off that queue once the call stack is completely empty. That
one rule — "never touch the queue while the stack is busy" — is the entire
reason JS looks single-threaded and non-blocking at the same time: the main
thread is free to keep running other code (handling clicks, updating other
task rows, running other timers) while any number of timers count down
concurrently.

## 4. Predicted vs. actual event loop output

The demo (section 03 in the app) runs:

```js
console.log("Start");
setTimeout(() => console.log("Timeout 1 (0ms)"), 0);
Promise.resolve().then(() => console.log("Promise 1"));
setTimeout(() => console.log("Timeout 2 (0ms)"), 0);
asyncFn();
Promise.resolve().then(() => console.log("Promise 2"));
console.log("End");

async function asyncFn() {
  console.log("Async function start");
  await null;
  console.log("Async function after await");
}
```

**Predicted (and actual) output:**

```
1. Start
2. Async function start
3. End
4. Promise 1
5. Async function after await
6. Promise 2
7. Timeout 1 (0ms)
8. Timeout 2 (0ms)
```

**Why, tracing Call Stack → Microtask Queue → Task Queue → Event Loop:**

- The whole script body runs first, synchronously, on the **call stack**:
  `"Start"` logs immediately. Both `setTimeout` calls just register their
  callbacks with the browser and return — their callbacks go to the **task
  queue** once 0ms elapses, they don't run yet. The first
  `Promise.resolve().then(cb1)` schedules `cb1` on the **microtask queue**
  (queue: `[cb1]`).
- `asyncFn()` is called synchronously. Everything before its first `await`
  runs like a normal function call on the stack, so `"Async function start"`
  logs immediately. `await null` then suspends `asyncFn`: the rest of the
  function is scheduled as a microtask (queue: `[cb1, resumeAsyncFn]`), and
  control returns *synchronously* to the line right after `asyncFn()` was
  called.
- The second `.then(cb2)` schedules `cb2` (queue: `[cb1, resumeAsyncFn,
  cb2]`). `"End"` logs. The synchronous script is now finished and the call
  stack is empty.
- The event loop's rule is: **drain the entire microtask queue before running
  even one task from the task queue.** So it runs, in FIFO order: `cb1`
  ("Promise 1"), then `resumeAsyncFn` ("Async function after await"), then
  `cb2` ("Promise 2").
- Only once the microtask queue is empty does the event loop take the next
  **macrotask** off the task queue: the two `setTimeout` callbacks, in the
  order they were registered — "Timeout 1", then "Timeout 2".

This is the classic surprise for newcomers: even a `setTimeout(fn, 0)` always
runs *after* every microtask that was already queued, no matter how many
microtasks that is.

## 5. Tasks vs. microtasks

| | Microtasks | Tasks (macrotasks) |
|---|---|---|
| Examples | `.then`/`.catch`/`.finally`, code after `await`, `queueMicrotask` | `setTimeout`/`setInterval` callbacks, UI events, `fetch` network callback registration |
| When they run | Immediately after the current synchronous code finishes, **before** the browser repaints or handles the next task | One at a time, only after the microtask queue is completely empty |
| Queue draining | The **entire** microtask queue is drained before moving on — including microtasks added *while* draining | Only **one** macrotask is taken per turn of the event loop, then the loop checks microtasks again |
| Effect in this app | Marking a task's status "Completed"/"Failed" happens in `.then/.catch/.finally`, so UI state updates as soon as possible after the timer fires | The simulated network delay itself (`setTimeout`) is a macrotask — that's the part that actually takes 500–2000ms |

## 6. Handling multiple promises and errors

- Each `task.run()` returns a promise that **rejects** if the simulated load
  fails, but its `status` is set to `"Failed"` inside a `.catch()`/`finally()`
  *before* the rejection is allowed to propagate, so the UI always reflects
  the outcome regardless of whether anything else is listening.
- For "Run All Tasks" and the concurrent half of the comparison, the app uses
  **`Promise.allSettled`**, not `Promise.all`. `Promise.all` rejects and
  stops waiting the instant *any* one promise rejects, which would hide the
  results of tasks that hadn't finished yet. `Promise.allSettled` always
  waits for every promise to either resolve or reject and gives back an array
  of `{status, value|reason}` for each one — exactly what's needed to report
  "Load Users Completed / Load Posts Failed / Load Comments Completed" as one
  summary once *everything* is done.
- Individual "Run" buttons attach a `.catch(() => {})` so a single failed
  task never becomes an unhandled promise rejection in the console — the
  failure is still fully visible through the status badge.

## 7. Sequential vs. concurrent execution

```js
// Sequential
await task1.run();
await task2.run();
await task3.run();

// Concurrent
await Promise.allSettled([task1.run(), task2.run(), task3.run()]);
```

In the **sequential** version, each `.run()` call — and the `setTimeout`
inside it — only *starts* once the previous `await` has resumed. So if the
three tasks take 900ms, 1400ms and 700ms, the total is roughly
`900 + 1400 + 700 ≈ 3000ms`: the delays stack up.

In the **concurrent** version, all three `.run()` calls execute synchronously
in the same pass (each one starts its own `setTimeout` timer immediately),
and only *then* does the code `await` on all of them together. The three
timers count down in parallel, so the total time is roughly the duration of
the *slowest* one (~1400ms here), not the sum. The "Run Comparison" button in
the app measures both with `performance.now()` and prints the real numbers,
which are consistently close to "sum of durations" for sequential and
"max of durations" for concurrent (plus a little overhead).

The trade-off: sequential is simpler to reason about and guarantees strict
ordering (useful if task 2 depends on task 1's result), while concurrent is
faster whenever the tasks are independent of each other.