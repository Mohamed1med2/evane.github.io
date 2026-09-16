const PASSWORD='0801';
let entered='';
const DESIGN_W=268, DESIGN_H=590;
const stages=[...document.querySelectorAll('.stage')];
const artboards=[...document.querySelectorAll('.artboard')];
const digits=[...document.querySelectorAll('.code-box')];
function layout(){const vw=window.innerWidth,vh=window.innerHeight;const scale=Math.min(vw/DESIGN_W,vh/DESIGN_H);artboards.forEach(a=>a.style.transform=`translate(-50%,-50%) scale(${scale})`)}
function show(n){stages.forEach(s=>s.classList.toggle('active',s.id===`screen-${n}`))}
function render(){digits.forEach((d,i)=>d.textContent=entered[i]||'')}
function clear(){entered='';render()}
function validate(){if(entered.length!==4)return;if(entered===PASSWORD){clear();show(3)}else show(2)}
document.querySelectorAll('.key').forEach(btn=>btn.addEventListener('click',()=>{const a=btn.dataset.action,k=btn.dataset.key;if(a==='clear'){clear();return}if(a==='back'){entered=entered.slice(0,-1);render();return}if(k&&entered.length<4){entered+=k;render();validate()}}));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.classList.contains('ok-btn'))clear();show(Number(btn.dataset.go))}));
window.addEventListener('keydown',e=>{if(/^\d$/.test(e.key)&&entered.length<4){entered+=e.key;render();validate();return}if(e.key==='Backspace'||e.key==='Delete'){entered=entered.slice(0,-1);render();return}if(e.key==='Escape'){clear();show(1)}});
window.addEventListener('resize',layout,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(layout,80),{passive:true});
render();show(1);layout();
