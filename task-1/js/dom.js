"use strict";

export function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    if (text !== undefined) {
        node.textContent = text;
    }

    return node;
}

export function logLine(preEl, text, muted = false) {
    const line = document.createElement("div");

    line.className =
        "log__line" +
        (muted ? " log__line--muted" : "");

    line.textContent = text;

    preEl.appendChild(line);
    preEl.scrollTop = preEl.scrollHeight;
}

export function badgeClass(status) {
    return (
        {
        Idle: "badge badge--idle",
        Running: "badge badge--running",
        Completed: "badge badge--completed",
        Failed: "badge badge--failed",
        }[status] || "badge badge--idle"
    );
}