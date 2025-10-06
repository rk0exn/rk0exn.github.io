const clockEl = document.getElementById("clock");
const fsBtn = document.getElementById("fullscreenBtn");

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    let text = `${h}:${m}:${s}`;

    clockEl.textContent = text;

    const jitter = Math.floor(Math.random() * 61) - 30;
    setTimeout(updateClock, 127 + jitter);
}

fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
    else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        fsBtn.textContent = "Exit Fullscreen";
    }
    else {
        fsBtn.textContent = "Fullscreen";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const scope = document.querySelector("body");
    scope.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
    });
});

document.addEventListener("mousedown", e => {
    if (e.button === 2) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
}, true);

updateClock();