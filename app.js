const PASSWORD='0801';
let entered='';

const stages=[...document.querySelectorAll('.stage')];
const digitEls=[...document.querySelectorAll('.code-box')];
const keyButtons=[...document.querySelectorAll('.keypad .key')];
const navButtons=[...document.querySelectorAll('[data-go]')];

function showScreen(number){
  stages.forEach(stage=>stage.classList.toggle('active',stage.id===`screen-${number}`));
}

function renderDigits(){
  digitEls.forEach((el,index)=>{el.textContent=entered[index]??'';});
}

function clearDigits(){
  entered='';
  renderDigits();
}

function validatePassword(){
  if(entered.length!==4)return;
  if(entered===PASSWORD){
    clearDigits();
    showScreen(3);
  }else{
    showScreen(2);
  }
}

keyButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    const action=button.dataset.action;
    const key=button.dataset.key;

    if(action==='clear'){
      clearDigits();
      return;
    }
    if(action==='back'){
      entered=entered.slice(0,-1);
      renderDigits();
      return;
    }
    if(!key||entered.length>=4)return;

    entered+=key;
    renderDigits();
    validatePassword();
  });
});

navButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    if(button.classList.contains('ok-btn'))clearDigits();
    showScreen(Number(button.dataset.go));
  });
});

window.addEventListener('keydown',event=>{
  if(/^\d$/.test(event.key)){
    if(entered.length<4){
      entered+=event.key;
      renderDigits();
      validatePassword();
    }
    return;
  }
  if(event.key==='Backspace'||event.key==='Delete'){
    entered=entered.slice(0,-1);
    renderDigits();
  }
  if(event.key==='Escape'){
    clearDigits();
    showScreen(1);
  }
});

renderDigits();
showScreen(1);
