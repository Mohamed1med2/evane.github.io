const PASSWORD='0801';
let entered='';
const pages={password:'page-password',wrong:'page-wrong',hello:'page-hello',note:'page-note',gifts:'page-gifts',letter:'page-letter',final:'page-final'};
const slots=[...document.querySelectorAll('.slot')];

function go(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===pages[name]));
  window.scrollTo(0,0);
}
function render(){slots.forEach((s,i)=>s.textContent=entered[i]||'');}
function clearCode(){entered='';render();}
function validate(){
  if(entered.length!==4)return;
  if(entered===PASSWORD){clearCode();go('hello');}
  else{go('wrong');}
}

document.querySelectorAll('.key').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.action;
  const key=btn.dataset.key;
  if(action==='clear'){clearCode();return;}
  if(action==='back'){entered=entered.slice(0,-1);render();return;}
  if(key&&entered.length<4){entered+=key;render();validate();}
}));

document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>{
  const target=btn.dataset.go;
  if(target==='password')clearCode();
  go(target);
}));

const giftCopy={
  letter:{title:'A letter ♡',text:'I wanted to write something small, but somehow every sentence turns into another reason I am grateful you are here.'},
  song:{title:'Our song ♫',text:'Some songs sound different when they remind you of one person. This space is for the one that feels like us.'},
  memory:{title:'A memory ✦',text:'There are little moments that probably looked ordinary from the outside, but I kept them because they had you in them.'}
};
document.querySelectorAll('[data-gift]').forEach(btn=>btn.addEventListener('click',()=>{
  const item=giftCopy[btn.dataset.gift];
  document.getElementById('gift-title').textContent=item.title;
  document.getElementById('gift-text').textContent=item.text;
  go('letter');
}));

window.addEventListener('keydown',e=>{
  if(!document.getElementById('page-password').classList.contains('active'))return;
  if(/^\d$/.test(e.key)&&entered.length<4){entered+=e.key;render();validate();return;}
  if(e.key==='Backspace'||e.key==='Delete'){entered=entered.slice(0,-1);render();}
  if(e.key==='Escape')clearCode();
});
render();
go('password');
