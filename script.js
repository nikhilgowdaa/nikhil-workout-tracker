
const workouts={
'Back and biceps':['Bicep superset','Cable Curl','Biceps - Hammer Curls','One Arm Dumbbell Row','Seated Cable Rows','Lat Pulldown','Close Grip Lat Pulldowns','Machine Row','Bicep Curl (One Hand)','Hammer Curls'],
'Chest, Triceps':['Single Arm Cable Tricep Extension','Tricep Rope Pull Downs','Cable Pushdowns Chest','Cable Chest Fly - Upper','Bench Press','Incline Bench Press','Rope Tricep Overhead Extension'],
'Arms and Shoulders':['Face Pulls','Dumbbell Shrugs','Seated DB Shoulder Press','Cable Lateral Raises','Cable Reverse Fly','Wrist Curl','Reverse Curl'],
'Legs':['Lunges','Seated Calf Raises','Adductor out to in','Hip Abduction in to out','Leg Curl','Leg Extension'],
'Abs':['Hanging Leg Raise','Cable Crunch With Rope']
};
const compounds=['Bench Press','Incline Bench Press','Seated DB Shoulder Press'];
const app=document.getElementById('app');
renderHome();
function renderHome(){
app.innerHTML='<div class=header>🏋️ Workout Tracker</div>';
Object.keys(workouts).forEach(w=>{
let c=document.createElement('div'); c.className='card';
c.innerHTML=`<b>${w}</b><div class=small>${workouts[w].length} exercises</div>`;
c.onclick=()=>renderWorkout(w); app.appendChild(c);});
}
function renderWorkout(w){
app.innerHTML=`<div class=header>${w}</div><button onclick='renderHome()'>← Home</button>`;
workouts[w].forEach(ex=>{
let h=JSON.parse(localStorage.getItem(ex)||'[]');
let last=h.length?h[h.length-1].date:'Never';
let c=document.createElement('div'); c.className='card';
c.innerHTML=`${ex}<div class=small>Last: ${last}</div>`;
c.onclick=()=>renderExercise(ex); app.appendChild(c);
});
}
function renderExercise(ex){
let h=JSON.parse(localStorage.getItem(ex)||'[]');
let prev=h.length?h[h.length-1]:null;
app.innerHTML=`<div class=header>${ex}</div><button onclick='history.back()'>← Back</button>`;
if(prev){
app.innerHTML+=`<div class=card><b>Previous (${prev.date})</b><br>`+
prev.sets.map((s,i)=>`Set ${i+1}: ${s.weight}×${s.reps}`).join('<br>')+'</div>';
}
app.innerHTML+=`<div class=card><table id=t><tr><th>Set</th><th>Weight</th><th>Reps</th><th>✓</th></tr></table><button onclick='addRow()'>+ Add Set</button></div>`;
window.currentEx=ex; window.currentSets=[]; addRow(); addRow(); addRow();
}
function addRow(){
let t=document.getElementById('t'); if(!t) return;
let i=t.rows.length;
let r=t.insertRow();
r.innerHTML=`<td>${i}</td><td><input id=w${i} type=number style='width:70px'></td><td><input id=r${i} type=number style='width:70px'></td><td><button onclick='completeSet(${i})'>✓</button></td>`;
}
function completeSet(i){
let w=document.getElementById('w'+i).value,r=document.getElementById('r'+i).value;
if(!w||!r){alert('Enter weight and reps');return;}
currentSets.push({weight:w,reps:r});
let hist=JSON.parse(localStorage.getItem(currentEx)||'[]');
hist=hist.filter(x=>x.date!==new Date().toLocaleDateString());
hist.push({date:new Date().toLocaleDateString(),sets:currentSets});
localStorage.setItem(currentEx,JSON.stringify(hist));
startTimer(compounds.includes(currentEx)?120:90);
}
function startTimer(s){
Notification.requestPermission();
let d=document.createElement('div'); d.className='timer'; document.body.appendChild(d);
let t=setInterval(()=>{d.innerHTML='⏱ '+s; s--; if(s<0){clearInterval(t); d.remove();
if(navigator.vibrate) navigator.vibrate([300,100,300]);
if(Notification.permission==='granted') new Notification('Rest complete!');
alert('Rest complete!');}},1000);
}
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
