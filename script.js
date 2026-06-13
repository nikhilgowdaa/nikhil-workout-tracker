
const workouts={'Back and biceps':['Cable Curl','Lat Pulldown','Machine Row']};
const compounds=['Bench Press','Incline Bench Press','Seated DB Shoulder Press'];
const app=document.getElementById('app');
const timer=document.getElementById('timerOverlay');

function home(){
 app.innerHTML='<div class="header">Workout Tracker v2.1.1</div>';
 Object.keys(workouts).forEach(w=>{
  const d=document.createElement('div');
  d.className='card'; d.textContent=w;
  d.addEventListener('click',()=>showWorkout(w));
  app.appendChild(d);
 });
}

function showWorkout(w){
 app.innerHTML=`<button id="back">← Home</button><div class="header">${w}</div>`;
 document.getElementById('back').onclick=home;
 workouts[w].forEach(ex=>{
  const d=document.createElement('div');
  d.className='card'; d.textContent=ex;
  d.addEventListener('click',()=>showExercise(ex,w));
  app.appendChild(d);
 });
}

function showExercise(ex,w){
 const hist=JSON.parse(localStorage.getItem(ex)||'[]');
 const prev=hist[hist.length-1];
 app.innerHTML=`<button id="back">← Back</button><div class="header">${ex}</div>
 <table id="tbl"><tr><th>Set</th><th>Wt</th><th>Reps</th><th></th></tr></table>`;
 document.getElementById('back').onclick=()=>showWorkout(w);

 for(let i=0;i<Math.max(prev?.sets?.length||0,3);i++){
  const s=prev?.sets?.[i]||{};
  addRow(ex,i+1,s.weight||'',s.reps||'');
 }
}

function addRow(ex,n,w,r){
 const tr=document.createElement('tr');
 tr.innerHTML=`<td>${n}</td>
 <td><input value="${w}" id="w${n}"></td>
 <td><input value="${r}" id="r${n}"></td>
 <td><button class="log-btn">LOG SET</button></td>`;
 document.getElementById('tbl').appendChild(tr);

 const btn=tr.querySelector('button');
 btn.addEventListener('click',()=>{
   const wt=document.getElementById('w'+n).value;
   const rp=document.getElementById('r'+n).value;
   if(!wt||!rp){alert('Enter weight and reps'); return;}
   const hist=JSON.parse(localStorage.getItem(ex)||'[]');
   let today=hist.find(x=>x.date===new Date().toLocaleDateString());
   if(!today){ today={date:new Date().toLocaleDateString(),sets:[]}; hist.push(today);}
   today.sets[n-1]={weight:wt,reps:rp};
   localStorage.setItem(ex,JSON.stringify(hist));
   tr.classList.add('logged');
   btn.textContent='✓ LOGGED';
   btn.disabled=true;
   startTimer(compounds.includes(ex)?120:90);
 });
}

function startTimer(sec){
 clearInterval(window.timerInt);
 timer.classList.remove('hidden');
 render(sec);
 window.timerInt=setInterval(()=>{
   sec--; render(sec);
   if(sec<=0){
     clearInterval(window.timerInt);
     timer.classList.add('hidden');
     navigator.vibrate && navigator.vibrate([300,100,300]);
     alert('Rest Complete!');
   }
 },1000);
}

function render(sec){
 timer.innerHTML=`<div>${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</div>
 <button id="skip">Skip</button>`;
 document.getElementById('skip').onclick=()=>{
  clearInterval(window.timerInt);
  timer.classList.add('hidden');
 };
}

home();
