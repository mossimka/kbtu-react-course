"use strict";

export function createTask(name, onChange) {
    let count = 0;
    let status = "Idle";
    let lastDuration = 0;

    function notify() {
        if (typeof onChange === "function") {
        onChange({
            name,
            status,
            count,
            lastDuration,
        });
        }
    }

    function run() {
        status = "Running";
        notify();

        const duration = 500 + Math.floor(Math.random() * 1501);

        const shouldFail = Math.random() < 0.3;

        const startedAt = performance.now();

        return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
            reject(new Error(`${name} failed to load`));
            } else {
            resolve(`${name} loaded successfully`);
            }
        }, duration);
        })
        .then((message) => {
            status = "Completed";

            return {
            name,
            status,
            message,
            duration,
            };
        })
        .catch((err) => {
            status = "Failed";
            throw err;
        })
        .finally(() => {
            count += 1;

            lastDuration = Math.round(performance.now() - startedAt);

            notify();
        });
    }

    function getCount() {
        return count;
    }

    function getStatus() {
        return status;
    }

    function reset() {
        count = 0;
        status = "Idle";
        lastDuration = 0;

        notify();
    }

    return {
        name,
        run,
        getCount,
        getStatus,
        reset,
    };
}
