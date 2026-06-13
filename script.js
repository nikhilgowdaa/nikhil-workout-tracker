
const app=document.getElementById('app');
const timer=document.getElementById('timer');

function home(){
app.innerHTML='<div class="card"><h2>Back and biceps</h2><button id="openWorkout">Open</button></div>';
document.getElementById('openWorkout').addEventListener('click', workout);
}

function workout(){
app.innerHTML='<button id="back">← Home</button><div class="card"><h2>Lat Pulldown</h2><button id="openExercise">Start</button></div>';
document.getElementById('back').addEventListener('click', home);
document.getElementById('openExercise').addEventListener('click', exercise);
}

function exercise(){
const prev=JSON.parse(localStorage.getItem('latpulldown')||'{}');
app.innerHTML=`
<button id="back">← Back</button>
<div class="card">
<h2>Lat Pulldown</h2>
<p>Previous: ${prev.weight||'-'} × ${prev.reps||'-'}</p>
<input id="weight" type="number" placeholder="Weight" value="${prev.weight||''}">
<input id="reps" type="number" placeholder="Reps" value="${prev.reps||''}">
<br><br>
<button id="logBtn">LOG SET</button>
<p id="status"></p>
</div>`;
document.getElementById('back').addEventListener('click', workout);

document.getElementById('logBtn').addEventListener('click', ()=>{
const weight=document.getElementById('weight').value;
const reps=document.getElementById('reps').value;
if(!weight || !reps){
alert('Enter weight and reps');
return;
}

localStorage.setItem('latpulldown', JSON.stringify({
weight,reps,date:new Date().toLocaleString()
}));

document.querySelector('.card').classList.add('logged');
document.getElementById('status').textContent='✓ Logged successfully';

startTimer(10);
});
}

function startTimer(sec){
timer.classList.remove('hidden');

function render(){
timer.innerHTML=`<div>${sec}</div><button id="skip">Skip</button>`;
document.getElementById('skip').addEventListener('click', ()=>{
clearInterval(window.timerInt);
timer.classList.add('hidden');
});
}

render();

clearInterval(window.timerInt);
window.timerInt=setInterval(()=>{
sec--;
render();
if(sec<=0){
clearInterval(window.timerInt);
timer.classList.add('hidden');
alert('Rest complete!');
}
},1000);
}

home();
