let taps=0, power=1, autoTps=0, multi=1, record=0;
const UPG=[
  {cost:50,  ca:2, aa:0, mx:false},
  {cost:120, ca:0, aa:1, mx:false},
  {cost:400, ca:5, aa:0, mx:false},
  {cost:900, ca:0, aa:5, mx:false},
  {cost:2500,ca:0, aa:0, mx:true },
];
const bought=[false,false,false,false,false];
const MS=[1,10,50,100,500,1000,5000];
const t0=Date.now();
 
// Fix: block key repeat on spacebar
let spaceDown=false;
document.addEventListener('keydown', e=>{
  if(e.code==='Space'){
    e.preventDefault();
    if(spaceDown) return; // block auto-repeat
    spaceDown=true;
    const w=document.getElementById('bwrap');
    const r=w.getBoundingClientRect();
    tap({clientX:r.left+r.width/2, clientY:r.top+r.height/2});
  }
});
document.addEventListener('keyup', e=>{
  if(e.code==='Space') spaceDown=false;
});
 
function g(id){return document.getElementById(id);}
function fmt(n){return Math.floor(n).toLocaleString('uk-UA');}
 
function ui(){
  const t=Math.floor(taps);
  g('cnt').textContent=fmt(t);
  g('ht').textContent=fmt(t);
  g('sp').textContent=power*multi;
  g('sa').textContent=(autoTps*multi).toFixed(1);
  g('sr').textContent=fmt(record);
  g('hr').textContent=fmt(record);
  g('fp').textContent=power*multi;
  g('cc').textContent=power*multi;
  g('ca').textContent=(autoTps*multi).toFixed(1);
 
  MS.forEach(m=>{
    const bar=g('ab'+m), el=g('a'+m);
    if(!bar||!el) return;
    bar.style.width=Math.min(100,(t/m)*100)+'%';
    if(t>=m) el.classList.add('on');
  });
 
  UPG.forEach((_,i)=>{
    if(bought[i]) return;
    taps>=UPG[i].cost
      ? g('u'+i).classList.remove('off')
      : g('u'+i).classList.add('off');
  });
}
 
function tap(e){
  const gain=power*multi;
  taps+=gain;
  if(taps>record) record=Math.floor(taps);
 
  const c=g('cnt');
  c.classList.remove('bump');
  void c.offsetWidth;
  c.classList.add('bump');
 
  const b=g('ball');
  b.classList.add('pressed');
  setTimeout(()=>b.classList.remove('pressed'),95);
 
  const wrap=g('bwrap');
  const rect=wrap.getBoundingClientRect();
  const f=document.createElement('div');
  f.className='floater';
  f.textContent='+'+gain;
  f.style.left=(e.clientX-rect.left-22+(Math.random()*30-15))+'px';
  f.style.top=(e.clientY-rect.top-10)+'px';
  wrap.appendChild(f);
  setTimeout(()=>f.remove(),860);
 
  ui();
}
 
function buy(i){
  if(bought[i]) return;
  const u=UPG[i];
  if(taps<u.cost){
    const el=g('u'+i);
    el.style.borderColor='rgba(255,60,60,.4)';
    setTimeout(()=>el.style.borderColor='',450);
    return;
  }
  taps-=u.cost;
  bought[i]=true;
  if(u.mx) multi*=2;
  else { power+=u.ca; autoTps+=u.aa; }
  const el=g('u'+i);
  el.classList.add('done');
  el.onclick=null;
  ui();
}
 
function reset(){
  if(!confirm('Скинути прогрес?')) return;
  taps=0; power=1; autoTps=0; multi=1; record=0;
  bought.fill(false);
  UPG.forEach((_,i)=>{
    const el=g('u'+i);
    el.classList.remove('done');
    el.onclick=()=>buy(i);
    i===0 ? el.classList.remove('off') : el.classList.add('off');
  });
  ui();
}
 
setInterval(()=>{
  if(autoTps>0){
    taps+=(autoTps*multi)/20;
    if(taps>record) record=Math.floor(taps);
    ui();
  }
},50);
 
setInterval(()=>{
  const s=Math.floor((Date.now()-t0)/1000);
  g('fs').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
},1000);
 
ui();
