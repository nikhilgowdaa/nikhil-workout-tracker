
const workouts={'Back and Biceps':['Lat Pulldown']};
const app=document.getElementById('app');
const timer=document.getElementById('timer');

function home(){
 app.innerHTML='<div class="card"><h2>Back and Biceps</h2><button id="open">Open</button></div>';
 document.getElementById('open').onclick=workout;
}
function workout(){
 app.innerHTML='<button id="home">Home</button><div class="card"><h2>Lat Pulldown</h2><button id="start">Start</button></div>';
 document.getElementById('home').onclick=home;
 document.getElementById('start').onclick=exercise;
}
function exercise(){
 const hist=JSON.parse(localStorage.getItem('latpulldown')||'[]');
 const today=hist.find(x=>x.date===new Date().toLocaleDateString())||{sets:[]};
 app.innerHTML='<button id="back">Back</button><table id="tbl"><tr><th>Set</th><th>Wt</th><th>Reps</th><th>Action</th></tr></table><button id="add">+ Add Set</button>';
 document.getElementById('back').onclick=workout;
 for(let i=0;i<Math.max(today.sets.length,3);i++) row(i+1,today.sets[i]);
 document.getElementById('add').onclick=()=>row(document.querySelectorAll('#tbl tr').length);
}
function row(n,data){
 const tr=document.createElement('tr');
 tr.innerHTML=`<td>${n}</td><td><input value="${data?.weight||''}" id="w${n}"></td><td><input value="${data?.reps||''}" id="r${n}"></td><td><button id="l${n}">${data?'EDIT':'LOG'}</button><button id="d${n}">🗑</button></td>`;
 document.getElementById('tbl').appendChild(tr);

 document.getElementById('l'+n).onclick=()=>{
  let hist=JSON.parse(localStorage.getItem('latpulldown')||'[]');
  let day=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(!day){day={date:new Date().toLocaleDateString(),sets:[]};hist.push(day);}
  day.sets[n-1]={weight:document.getElementById('w'+n).value,reps:document.getElementById('r'+n).value};
  localStorage.setItem('latpulldown',JSON.stringify(hist));
  tr.classList.add('logged');
  document.getElementById('l'+n).textContent='EDIT';
  startTimer(90);
 };

 document.getElementById('d'+n).onclick=()=>{
  let hist=JSON.parse(localStorage.getItem('latpulldown')||'[]');
  let day=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(day) day.sets.splice(n-1,1);
  localStorage.setItem('latpulldown',JSON.stringify(hist));
  exercise();
 };
}

function startTimer(sec){
 clearInterval(window.t);
 timer.classList.remove('hidden');
 window.t=setInterval(()=>{timer.innerHTML='<div>⏱ '+sec+'</div><button id="skip">Skip</button>';document.getElementById('skip').onclick=()=>{clearInterval(window.t);timer.classList.add('hidden');};sec--;if(sec<0){clearInterval(window.t);timer.classList.add('hidden');}},1000);
}
home();
