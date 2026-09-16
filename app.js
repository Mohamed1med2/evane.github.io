"use strict";

const PASSWORD = "0801";
let entered = "";
let unlocked = false;
let current = "password";

const pages = [...document.querySelectorAll(".page")];
const dialog = document.querySelector("#wrong");
const slots = document.querySelector(".slots");
const keypad = document.querySelector(".keypad");
const letterShell = document.querySelector("#letter .page-shell");
const letterScroll = document.querySelector(".letter-scroll");
const keys = ["1","2","3","4","5","6","7","8","9","clear","0","back"];
const RELATIONSHIP_START = Date.parse("2026-01-08T00:00:00Z");

for (let i = 0; i < 4; i += 1) {
  const slot = document.createElement("span");
  slot.className = "slot empty";
  slots.append(slot);
}

for (const key of keys) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.key = key;
  button.textContent = key === "clear" ? "♡" : key === "back" ? "←" : key;
  button.setAttribute("aria-label", key === "clear" ? "Clear code" : key === "back" ? "Delete last digit" : `Number ${key}`);
  button.addEventListener("click", () => enter(key));
  keypad.append(button);
}

function setLetterReadingState(isReading) {
  if (!letterShell) return;
  letterShell.classList.toggle("reading-letter", isReading);
}

function padTimer(value) {
  return String(value).padStart(2, "0");
}

function updateLoveTimer() {
  const daysEl = document.querySelector("#timer-days");
  const hoursEl = document.querySelector("#timer-hours");
  const minutesEl = document.querySelector("#timer-minutes");
  const secondsEl = document.querySelector("#timer-seconds");
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const totalSeconds = Math.max(0, Math.floor((Date.now() - RELATIONSHIP_START) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = padTimer(days);
  hoursEl.textContent = padTimer(hours);
  minutesEl.textContent = padTimer(minutes);
  secondsEl.textContent = padTimer(seconds);
}

function renderCode() {
  [...slots.children].forEach((slot, index) => {
    slot.textContent = entered[index] || "";
    slot.classList.toggle("empty", !entered[index]);
  });
}

function enter(key) {
  if (current !== "password" || dialog.open) return;

  if (key === "clear") entered = "";
  else if (key === "back") entered = entered.slice(0, -1);
  else if (entered.length < 4) entered += key;

  renderCode();

  if (entered.length === 4) {
    if (entered === PASSWORD) {
      unlocked = true;
      entered = "";
      renderCode();
      go("hello");
    } else {
      dialog.showModal();
    }
  }
}

function resetLetter() {
  const paper = document.querySelector(".letter-paper");
  const envelope = document.querySelector("#open-letter");
  const tap = document.querySelector(".tap");
  paper.hidden = true;
  envelope.hidden = false;
  envelope.setAttribute("aria-expanded", "false");
  tap.hidden = false;
  setLetterReadingState(false);
  if (letterScroll) letterScroll.scrollTop = 0;
}

function stopEmbeddedSongs() {
  document.querySelectorAll("#song iframe").forEach((frame) => {
    const src = frame.src;
    frame.src = "about:blank";
    requestAnimationFrame(() => {
      frame.src = src;
    });
  });
}

function go(id) {
  const next = document.getElementById(id);
  if (!next || (!unlocked && id !== "password")) return;

  if (current === "song" && id !== "song") stopEmbeddedSongs();

  current = id;
  pages.forEach((page) => {
    const active = page.id === id;
    page.classList.toggle("active", active);
    page.inert = !active;
    if (active) {
      const shell = page.querySelector(".page-shell");
      if (shell) shell.scrollTop = 0;
    }
  });

  if (id === "letter") resetLetter();

  const title = next.querySelector("h1, h2");
  if (title) {
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => go(button.dataset.go));
});

document.querySelector("#open-letter").addEventListener("click", (event) => {
  event.currentTarget.hidden = true;
  event.currentTarget.setAttribute("aria-expanded", "true");
  document.querySelector(".letter-paper").hidden = false;
  document.querySelector(".tap").hidden = true;
  setLetterReadingState(true);
  requestAnimationFrame(() => {
    if (letterScroll) {
      letterScroll.scrollTop = 0;
      letterScroll.focus({ preventScroll: true });
    }
  });
});

function retry() {
  dialog.close();
  entered = "";
  renderCode();
  const shell = document.querySelector("#password .page-shell");
  if (shell) shell.scrollTo({ top: 0, behavior: "smooth" });
  keypad.querySelector("button")?.focus();
}
document.querySelector("#retry").addEventListener("click", retry);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  retry();
});

window.addEventListener("keydown", (event) => {
  if (current !== "password" || dialog.open || event.ctrlKey || event.metaKey || event.altKey) return;
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    enter(event.key);
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    enter("back");
  } else if (event.key === "Escape") {
    enter("clear");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && current === "song") stopEmbeddedSongs();
});

renderCode();
go("password");

letterScroll?.addEventListener("touchmove", (event) => event.stopPropagation(), { passive: true });
letterScroll?.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });

updateLoveTimer();
setInterval(updateLoveTimer, 1000);
