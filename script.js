
const templates={
'Back and biceps':['Cable Curl','Lat Pulldown','Machine Row'],
'Chest, Triceps':['Bench Press','Incline Bench Press','Tricep Rope Pull Downs'],
'Arms and Shoulders':['Seated DB Shoulder Press','Cable Lateral Raises','Face Pulls'],
'Legs':['Lunges','Leg Curl','Leg Extension'],
'Abs':['Hanging Leg Raise','Cable Crunch With Rope']
};
const workouts=document.getElementById('workouts');
const content=document.getElementById('content');
Object.keys(templates).forEach(w=>{
 let d=document.createElement('div');
 d.className='card'; d.textContent=w;
 d.onclick=()=>showWorkout(w);
 workouts.appendChild(d);
});
function showWorkout(w){
 content.innerHTML='<h2>'+w+'</h2>';
 templates[w].forEach(ex=>{
  let c=document.createElement('div');
  c.className='card';
  let last=JSON.parse(localStorage.getItem(ex)||'[]');
  c.innerHTML=ex+'<br><small>'+(last.length?'Last: '+last[last.length-1].date:'Never')+'</small>';
  c.onclick=()=>logExercise(ex);
  content.appendChild(c);
 });
}
function logExercise(ex){
 let hist=JSON.parse(localStorage.getItem(ex)||'[]');
 let last=hist[hist.length-1];
 content.innerHTML='<h2>'+ex+'</h2>'+(last?'<p>Previous: '+JSON.stringify(last.sets)+'</p>':'');
 content.innerHTML+=`Weight <input id=w type=number> Reps <input id=r type=number><button onclick="saveSet('${ex}')">Save Set</button><div class=timer id=timer></div>`;
}
function saveSet(ex){
 let w=document.getElementById('w').value,r=document.getElementById('r').value;
 let hist=JSON.parse(localStorage.getItem(ex)||'[]');
 hist.push({date:new Date().toLocaleDateString(),sets:[{weight:w,reps:r}]});
 localStorage.setItem(ex,JSON.stringify(hist));
 startTimer(['Bench Press','Incline Bench Press','Seated DB Shoulder Press'].includes(ex)?120:90);
}
function startTimer(s){
 if(Notification.permission!=='granted') Notification.requestPermission();
 let t=document.getElementById('timer');
 let i=setInterval(()=>{t.textContent='⏱ '+s;s--; if(s<0){clearInterval(i);t.textContent='Rest Complete!';
 if(navigator.vibrate) navigator.vibrate([300,100,300]);
 if(Notification.permission==='granted') new Notification('Workout Tracker',{body:'Rest complete!'});
}},1000);
}
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
