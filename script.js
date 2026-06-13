const workouts={
'Back and Biceps':[
  'Bicep Superset','Cable Curl','Biceps - Hammer Curls','One Arm Dumbbell Row',
  'Seated Cable Rows','Lat Pulldown','Close Grip Lat Pulldowns','Machine Row',
  'Bicep Curl (One Hand)','Hammer Curls'
],
'Chest and Triceps':[
  'Single Arm Cable Tricep Ext','Tricep Rope Pull Downs','Cable Pushdowns Chest',
  'Cable Chest Fly - Upper','Bench Press','Incline Bench Press','Rope Tricep Overhead Extension'
],
'Arms and Shoulders':[
  'Face Pulls','Dumbbell Shrugs','Seated DB Shoulder Press','Cable Lateral Raises',
  'Cable Reverse Fly','Wrist Curl','Reverse Curl'
],
'Legs':[
  'Lunges','Seated Calf Raises','Adductor Out to In','Hip Abduction In to Out',
  'Leg Curl','Leg Extension'
],
'Abs':['Hanging Leg Raise','Cable Crunch With Rope']
};
const icons={'Back and Biceps':'💪','Chest and Triceps':'🏋️','Arms and Shoulders':'🦾','Legs':'🦵','Abs':'🔥'};
const compounds=['Bench Press','Incline Bench Press','Seated DB Shoulder Press','One Arm Dumbbell Row','Seated Cable Rows','Lat Pulldown'];
const app=document.getElementById('app');
const timerEl=document.getElementById('timer');

function home(){
  app.innerHTML=
    '<div class="home-eyebrow">Training</div>'+
    '<div class="home-title">My Workouts</div>'+
    '<div class="workout-list"></div>';
  const list=app.querySelector('.workout-list');
  Object.keys(workouts).forEach(w=>{
    const d=document.createElement('div');
    d.className='workout-card';
    d.innerHTML=
      '<div class="workout-icon">'+icons[w]+'</div>'+
      '<div class="workout-info">'+
        '<div class="workout-name">'+w+'</div>'+
        '<div class="workout-meta">'+workouts[w].length+' exercises</div>'+
      '</div>'+
      '<div class="chevron">›</div>';
    d.addEventListener('click',()=>showWorkout(w));
    list.appendChild(d);
  });
}

function showWorkout(w){
  app.innerHTML=
    '<div class="nav-bar">'+
      '<button class="btn-back" id="homeBtn">‹</button>'+
      '<div class="nav-title">'+w+'</div>'+
    '</div>'+
    '<div class="exercise-list"></div>';
  document.getElementById('homeBtn').addEventListener('click',home);
  const list=app.querySelector('.exercise-list');
  workouts[w].forEach(ex=>{
    const c=document.createElement('div');
    c.className='exercise-card';
    c.innerHTML='<span class="ex-name">'+ex+'</span><span class="chevron">›</span>';
    c.addEventListener('click',()=>showExercise(w,ex));
    list.appendChild(c);
  });
}

function showExercise(w,ex){
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  let prev=hist[hist.length-1];

  let html=
    '<div class="nav-bar">'+
      '<button class="btn-back" id="backBtn">‹</button>'+
      '<div class="nav-title">'+ex+'</div>'+
    '</div>';

  if(prev){
    html+=
      '<div class="prev-card">'+
        '<div class="prev-label">Last session &nbsp;·&nbsp; '+prev.date+'</div>'+
        prev.sets.map((s,i)=>
          '<div class="prev-row">'+
            '<span class="prev-set">Set '+(i+1)+'</span>'+
            '<span class="prev-val">'+s.weight+' kg &nbsp;×&nbsp; '+s.reps+' reps</span>'+
          '</div>'
        ).join('')+
      '</div>';
  }

  html+=
    '<div class="sets-wrap">'+
      '<table id="tbl">'+
        '<thead><tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th></th><th></th></tr></thead>'+
        '<tbody></tbody>'+
      '</table>'+
      '<button class="btn-add-set" id="addSet">+ Add Set</button>'+
    '</div>';

  app.innerHTML=html;

  document.getElementById('backBtn').addEventListener('click',()=>showWorkout(w));
  document.getElementById('addSet').addEventListener('click',()=>
    addRow(ex, document.querySelectorAll('#tbl tbody tr').length+1));

  const n=prev?.sets?.length||3;
  for(let i=1;i<=n;i++) addRow(ex,i,prev?.sets?.[i-1]);
}

function addRow(ex,n,data={}){
  const tr=document.createElement('tr');
  tr.innerHTML=
    '<td class="set-num">'+n+'</td>'+
    '<td><input class="wt-in" type="number" inputmode="decimal" placeholder="—" value="'+(data.weight||'')+'"></td>'+
    '<td><input class="rp-in" type="number" inputmode="numeric" placeholder="—" value="'+(data.reps||'')+'"></td>'+
    '<td><button class="log-btn">LOG</button></td>'+
    '<td><button class="del-btn">✕</button></td>';
  document.querySelector('#tbl tbody').appendChild(tr);

  const logBtn=tr.querySelector('.log-btn');
  const delBtn=tr.querySelector('.del-btn');
  const wtIn=tr.querySelector('.wt-in');
  const rpIn=tr.querySelector('.rp-in');
  const numCell=tr.querySelector('.set-num');

  logBtn.addEventListener('click',()=>{
    const wt=wtIn.value, rp=rpIn.value;
    if(!wt||!rp){alert('Enter weight and reps');return;}
    const setN=parseInt(numCell.textContent);
    let hist=JSON.parse(localStorage.getItem(ex)||'[]');
    let today=hist.find(x=>x.date===new Date().toLocaleDateString());
    if(!today){today={date:new Date().toLocaleDateString(),sets:[]};hist.push(today);}
    today.sets[setN-1]={weight:wt,reps:rp};
    localStorage.setItem(ex,JSON.stringify(hist));
    tr.classList.add('logged');
    logBtn.disabled=true;
    logBtn.textContent='✓';
    startTimer(compounds.includes(ex)?120:90);
  });

  delBtn.addEventListener('click',()=>{
    const setN=parseInt(numCell.textContent);
    const todayStr=new Date().toLocaleDateString();
    let hist=JSON.parse(localStorage.getItem(ex)||'[]');
    const ti=hist.findIndex(x=>x.date===todayStr);
    if(ti!==-1){
      hist[ti].sets.splice(setN-1,1);
      if(hist[ti].sets.length===0) hist.splice(ti,1);
      localStorage.setItem(ex,JSON.stringify(hist));
    }
    tr.remove();
    document.querySelectorAll('#tbl tbody tr').forEach((row,idx)=>{
      row.querySelector('.set-num').textContent=idx+1;
    });
  });
}

function startTimer(sec){
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');
  function render(){
    timerEl.innerHTML=
      '<div class="timer-label">Rest Timer</div>'+
      '<div class="timer-time">'+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')+'</div>'+
      '<div class="timer-btns">'+
        '<button class="t-skip" id="skip">Skip</button>'+
        '<button class="t-add" id="p15">+15s</button>'+
        '<button class="t-add" id="p30">+30s</button>'+
      '</div>';
    document.getElementById('skip').onclick=()=>{clearInterval(window.ti);timerEl.classList.add('hidden');};
    document.getElementById('p15').onclick=()=>sec+=15;
    document.getElementById('p30').onclick=()=>sec+=30;
  }
  render();
  window.ti=setInterval(()=>{
    sec--;render();
    if(sec<=0){clearInterval(window.ti);timerEl.classList.add('hidden');alert('Rest done! 💪');}
  },1000);
}

home();   c.className='card';
   c.textContent=ex;
   c.addEventListener('click',()=>showExercise(w,ex));
   app.appendChild(c);
 });
}

function showExercise(w,ex){
 let hist=JSON.parse(localStorage.getItem(ex)||'[]');
 let prev=hist[hist.length-1];

 // FIX: build ALL html in one shot before attaching any listeners.
 // Using innerHTML+= after addEventListener destroys the element and
 // silently kills the listener — that was the back-button bug.
 let html='<button id="backBtn">Back</button><div class="header">'+ex+'</div>';
 if(prev){
   html+='<div class="card"><b>Previous ('+prev.date+')</b><br>'+
         prev.sets.map((s,i)=>'Set '+(i+1)+': '+s.weight+' × '+s.reps).join('<br>')+
         '</div>';
 }
 html+='<table id="tbl"><tr><th>Set</th><th>Wt</th><th>Reps</th><th></th><th></th></tr></table>'+
       '<button id="addSet">+ Add Set</button>';
 app.innerHTML=html;

 // Attach listeners now that the DOM is stable
 document.getElementById('backBtn').addEventListener('click',()=>showWorkout(w));
 document.getElementById('addSet').addEventListener('click',()=>
   addRow(ex, document.querySelectorAll('#tbl tr').length));

 for(let i=1;i<=(prev?.sets?.length||3);i++) addRow(ex,i,prev?.sets?.[i-1]);
}

function addRow(ex,n,data={}){
 const tr=document.createElement('tr');
 tr.innerHTML=
   '<td class="set-num">'+n+'</td>'+
   '<td><input class="wt-in" value="'+(data.weight||'')+'"></td>'+
   '<td><input class="rp-in" value="'+(data.reps||'')+'"></td>'+
   '<td><button class="log-btn">LOG</button></td>'+
   '<td><button class="del-btn">🗑</button></td>';
 document.getElementById('tbl').appendChild(tr);

 const logBtn=tr.querySelector('.log-btn');
 const delBtn=tr.querySelector('.del-btn');
 const wtIn=tr.querySelector('.wt-in');
 const rpIn=tr.querySelector('.rp-in');
 const numCell=tr.querySelector('.set-num');

 logBtn.addEventListener('click',()=>{
  const wt=wtIn.value, rp=rpIn.value;
  if(!wt||!rp){alert('Enter weight and reps');return;}
  const setN=parseInt(numCell.textContent);
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  let today=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(!today){today={date:new Date().toLocaleDateString(),sets:[]};hist.push(today);}
  today.sets[setN-1]={weight:wt,reps:rp};
  localStorage.setItem(ex,JSON.stringify(hist));
  tr.classList.add('logged');
  logBtn.disabled=true;
  logBtn.textContent='LOGGED';
  startTimer(compounds.includes(ex)?120:90);
 });

 // FIX: delete a set — removes row from UI, syncs localStorage, renumbers remaining sets
 delBtn.addEventListener('click',()=>{
  const setN=parseInt(numCell.textContent);
  const todayStr=new Date().toLocaleDateString();
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  const ti=hist.findIndex(x=>x.date===todayStr);
  if(ti!==-1){
   hist[ti].sets.splice(setN-1,1);
   if(hist[ti].sets.length===0) hist.splice(ti,1);
   localStorage.setItem(ex,JSON.stringify(hist));
  }
  tr.remove();
  // Renumber remaining data rows so set numbers stay sequential
  document.querySelectorAll('#tbl tr:not(:first-child)').forEach((row,idx)=>{
   row.querySelector('.set-num').textContent=idx+1;
  });
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
 window.ti=setInterval(()=>{sec--;render();if(sec<=0){clearInterval(window.ti);timer.classList.add('hidden');alert('Rest complete!');}},1000);
}
home();   c.className='card';
   c.textContent=ex;
   c.addEventListener('click',()=>showExercise(w,ex));
   app.appendChild(c);
 });
}

function showExercise(w,ex){
 let hist=JSON.parse(localStorage.getItem(ex)||'[]');
 let prev=hist[hist.length-1];

 // FIX: build ALL html in one shot before attaching any listeners.
 // Using innerHTML+= after addEventListener destroys the element and
 // silently kills the listener — that was the back-button bug.
 let html='<button id="backBtn">Back</button><div class="header">'+ex+'</div>';
 if(prev){
   html+='<div class="card"><b>Previous ('+prev.date+')</b><br>'+
         prev.sets.map((s,i)=>'Set '+(i+1)+': '+s.weight+' × '+s.reps).join('<br>')+
         '</div>';
 }
 html+='<table id="tbl"><tr><th>Set</th><th>Wt</th><th>Reps</th><th></th><th></th></tr></table>'+
       '<button id="addSet">+ Add Set</button>';
 app.innerHTML=html;

 // Attach listeners now that the DOM is stable
 document.getElementById('backBtn').addEventListener('click',()=>showWorkout(w));
 document.getElementById('addSet').addEventListener('click',()=>
   addRow(ex, document.querySelectorAll('#tbl tr').length));

 for(let i=1;i<=Math.max(3,prev?.sets?.length||0);i++) addRow(ex,i,prev?.sets?.[i-1]);
}

function addRow(ex,n,data={}){
 const tr=document.createElement('tr');
 tr.innerHTML=
   '<td class="set-num">'+n+'</td>'+
   '<td><input class="wt-in" value="'+(data.weight||'')+'"></td>'+
   '<td><input class="rp-in" value="'+(data.reps||'')+'"></td>'+
   '<td><button class="log-btn">LOG</button></td>'+
   '<td><button class="del-btn">🗑</button></td>';
 document.getElementById('tbl').appendChild(tr);

 const logBtn=tr.querySelector('.log-btn');
 const delBtn=tr.querySelector('.del-btn');
 const wtIn=tr.querySelector('.wt-in');
 const rpIn=tr.querySelector('.rp-in');
 const numCell=tr.querySelector('.set-num');

 logBtn.addEventListener('click',()=>{
  const wt=wtIn.value, rp=rpIn.value;
  if(!wt||!rp){alert('Enter weight and reps');return;}
  const setN=parseInt(numCell.textContent);
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  let today=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(!today){today={date:new Date().toLocaleDateString(),sets:[]};hist.push(today);}
  today.sets[setN-1]={weight:wt,reps:rp};
  localStorage.setItem(ex,JSON.stringify(hist));
  tr.classList.add('logged');
  logBtn.disabled=true;
  logBtn.textContent='LOGGED';
  startTimer(compounds.includes(ex)?120:90);
 });

 // FIX: delete a set — removes row from UI, syncs localStorage, renumbers remaining sets
 delBtn.addEventListener('click',()=>{
  const setN=parseInt(numCell.textContent);
  const todayStr=new Date().toLocaleDateString();
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  const ti=hist.findIndex(x=>x.date===todayStr);
  if(ti!==-1){
   hist[ti].sets.splice(setN-1,1);
   if(hist[ti].sets.length===0) hist.splice(ti,1);
   localStorage.setItem(ex,JSON.stringify(hist));
  }
  tr.remove();
  // Renumber remaining data rows so set numbers stay sequential
  document.querySelectorAll('#tbl tr:not(:first-child)').forEach((row,idx)=>{
   row.querySelector('.set-num').textContent=idx+1;
  });
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
 window.ti=setInterval(()=>{sec--;render();if(sec<=0){clearInterval(window.ti);timer.classList.add('hidden');alert('Rest complete!');}},1000);
}
home();   '<td><input class="rp-in" value="'+(data.reps||'')+'"></td>'+
   '<td><button class="log-btn">LOG</button></td>'+
   '<td><button class="del-btn">🗑</button></td>';
 document.getElementById('tbl').appendChild(tr);

 const logBtn=tr.querySelector('.log-btn');
 const delBtn=tr.querySelector('.del-btn');
 const wtIn=tr.querySelector('.wt-in');
 const rpIn=tr.querySelector('.rp-in');
 const numCell=tr.querySelector('.set-num');

 logBtn.addEventListener('click',()=>{
  const wt=wtIn.value, rp=rpIn.value;
  if(!wt||!rp){alert('Enter weight and reps');return;}
  const setN=parseInt(numCell.textContent);
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  let today=hist.find(x=>x.date===new Date().toLocaleDateString());
  if(!today){today={date:new Date().toLocaleDateString(),sets:[]};hist.push(today);}
  today.sets[setN-1]={weight:wt,reps:rp};
  localStorage.setItem(ex,JSON.stringify(hist));
  tr.classList.add('logged');
  logBtn.disabled=true;
  logBtn.textContent='LOGGED';
  startTimer(compounds.includes(ex)?120:90);
 });

 // FIX: delete a set — removes row from UI, syncs localStorage, renumbers remaining sets
 delBtn.addEventListener('click',()=>{
  const setN=parseInt(numCell.textContent);
  const todayStr=new Date().toLocaleDateString();
  let hist=JSON.parse(localStorage.getItem(ex)||'[]');
  const ti=hist.findIndex(x=>x.date===todayStr);
  if(ti!==-1){
   hist[ti].sets.splice(setN-1,1);
   if(hist[ti].sets.length===0) hist.splice(ti,1);
   localStorage.setItem(ex,JSON.stringify(hist));
  }
  tr.remove();
  // Renumber remaining data rows so set numbers stay sequential
  document.querySelectorAll('#tbl tr:not(:first-child)').forEach((row,idx)=>{
   row.querySelector('.set-num').textContent=idx+1;
  });
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
 window.ti=setInterval(()=>{sec--;render();if(sec<=0){clearInterval(window.ti);timer.classList.add('hidden');alert('Rest complete!');}},1000);
}
home();
