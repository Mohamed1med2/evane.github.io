"use strict";

const PASSWORD = "0801";
let entered = "";
let unlocked = false;
let current = "password";

const pages = [...document.querySelectorAll(".page")];
const dialog = document.querySelector("#wrong");
const slots = document.querySelector(".slots");
const keypad = document.querySelector(".keypad");
const keys = ["1","2","3","4","5","6","7","8","9","clear","0","back"];

const memoryPhoto = document.querySelector("#memory-photo");
if (memoryPhoto && window.MEMORY_PHOTO) memoryPhoto.src = window.MEMORY_PHOTO;

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
  const scrollFrame = document.querySelector(".letter-scroll");
  if (scrollFrame) scrollFrame.scrollTop = 0;
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
  requestAnimationFrame(() => document.querySelector(".letter-scroll").focus({ preventScroll: true }));
});

function retry() {
  dialog.close();
  entered = "";
  renderCode();
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
