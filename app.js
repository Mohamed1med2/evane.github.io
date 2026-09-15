const PASSWORD = '0801';
let entered = '';

const stages = Array.from(document.querySelectorAll('.stage'));
const digitEls = Array.from(document.querySelectorAll('.code-box'));
const keyButtons = Array.from(document.querySelectorAll('.keypad .key'));
const navButtons = Array.from(document.querySelectorAll('[data-go]'));

function showScreen(n) {
  stages.forEach(stage => {
    stage.classList.toggle('active', stage.id === `screen-${n}`);
  });
}

function renderDigits() {
  digitEls.forEach((el, i) => {
    el.textContent = entered[i] ?? '';
  });
}

function clearDigits() {
  entered = '';
  renderDigits();
}

function submitIfReady() {
  if (entered.length < 4) return;
  if (entered === PASSWORD) {
    clearDigits();
    showScreen(3);
  } else {
    showScreen(2);
  }
}

keyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.key;
    const action = btn.dataset.action;

    if (action === 'clear') {
      clearDigits();
      return;
    }

    if (action === 'back') {
      entered = entered.slice(0, -1);
      renderDigits();
      return;
    }

    if (!key || entered.length >= 4) return;

    entered += key;
    renderDigits();
    submitIfReady();
  });
});

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = Number(btn.dataset.go);
    if (btn.classList.contains('ok-btn')) {
      clearDigits();
    }
    showScreen(target);
  });
});

window.addEventListener('keydown', (e) => {
  if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'Enter', 'Escape'].includes(e.key)) return;

  if (e.key === 'Backspace' || e.key === 'Delete') {
    entered = entered.slice(0, -1);
    renderDigits();
    return;
  }

  if (e.key === 'Escape') {
    clearDigits();
    showScreen(1);
    return;
  }

  if (e.key === 'Enter') {
    submitIfReady();
    return;
  }

  if (entered.length < 4) {
    entered += e.key;
    renderDigits();
    submitIfReady();
  }
});

renderDigits();
showScreen(1);
