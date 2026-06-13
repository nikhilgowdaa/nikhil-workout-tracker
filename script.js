
const workouts={
'Back and Biceps':['Cable Curl','Lat Pulldown','Machine Row'],
'Chest and Triceps':['Bench Press','Incline Bench Press','Tricep Rope Pull Downs'],
'Arms and Shoulders':['Seated DB Shoulder Press','Cable Lateral Raises','Face Pulls'],
'Legs':['Lunges','Leg Curl','Leg Extension'],
'Abs':['Hanging Leg Raise','Cable Crunch With Rope']
};
const compounds=['Bench Press','Incline Bench Press','Seated DB Shoulder Press'];
const app=document.getElementById('app');
const timer=document.getElementById('timer');

function home(){
 app.innerHTML='<div class="header">Workout Tracker v2.2.0</div>';
 Object.keys(workouts).forEach(w=>{
  const d=document.createElement('div');
  d.className='card';
  d.textContent=w;
  d.addEventListener('click',()=>showWorkout(w));
  app.appendChild(d);
 });
}

function showWorkout(w){
 app.innerHTML='<button id="homeBtn">Home</button><div class="header">'+w+'</div>';
 document.getElementById('homeBtn').addEventListener('click',home);
 workouts[w].forEach(ex=>{
   const c=document.createElement('div');
   c.className='card';
   c.textContent=ex;
   c.addEventListener('click',()=>showExercise(w,ex));
   app.appendChild(c);
 });
}

function showExercise(w,ex){
 let hist=JSON.parse(localStorage.getItem(ex)||'[]');
 let prev=hist[hist.length-1];
 app.innerHTML='<button id="backBtn">Back</button><div class="header">'+ex+'</div>';
 document.getElementById('backBtn').addEventListener('click',()=>showWorkout(w));
 if(prev){
   app.innerHTML+= '<div class="card"><b>Previous ('+prev.date+')</b><br>'+prev.sets.map((s,i)=>'Set '+(i+1)+': '+s.weight+' × '+s.reps).join('<br>')+'</div>';
 }
 app.innerHTML+='<table id="tbl"><tr><th>Set</th><th>Wt</th><th>Reps</th><th></th></tr></table><button id="addSet">+ Add Set</button>';
 for(let i=1;i<=Math.max(3, prev?.sets?.length||0);i++) addRow(ex,i,prev?.sets?.[i-1]);
 document.getElementById('addSet').addEventListener('click',()=>addRow(ex,document.querySelectorAll('#tbl tr').length));
}

function addRow(ex,n,data={}){
 const tr=document.createElement('tr');
 tr.innerHTML='<td>'+n+'</td><td><input id="w'+n+'" value="'+(data.weight||'')+'"></td><td><input id="r'+n+'" value="'+(data.reps||'')+'"></td><td><button>LOG</button></td>';
 document.getElementById('tbl').appendChild(tr);
 tr.querySelector('button').addEventListener('click',()=>{
  const wt=document.getElementById('w'+n).value;
  const rp=document.getElementById('r'+n).value;
  if(!wt||!rp){alert('Enter weight and reps');return;}
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  let today=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(!today){today={date:new Date().toLocaleDateString(),sets:[]}; hist.push(today);}
  today.sets[n-1]={weight:wt,reps:rp};
  localStorage.setItem(ex,JSON.stringify(hist));
  tr.classList.add('logged');
  tr.querySelector('button').disabled=true;
  tr.querySelector('button').textContent='LOGGED';
  startTimer(compounds.includes(ex)?120:90);
 });
}

function startTimer(sec){
 clearInterval(window.ti);
 timer.classList.remove('hidden');
 function render(){
  timer.innerHTML='<div>⏱ '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')+'</div><button id="skip">Skip</button><button id="p15">+15</button><button id="p30">+30</button>';
  document.getElementById('skip').onclick=()=>{clearInterval(window.ti);timer.classList.add('hidden');};
  document.getElementById('p15').onclick=()=>sec+=15;
  document.getElementById('p30').onclick=()=>sec+=30;
 }
 render();
 window.ti=setInterval(()=>{sec--; render(); if(sec<=0){clearInterval(window.ti);timer.classList.add('hidden'); alert('Rest complete!');}},1000);
}
home();
