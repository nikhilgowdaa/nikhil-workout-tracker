
const templates={"Back and biceps":["Bicep superset","Cable Curl","Biceps - Hammer Curls","One Arm Dumbbell Row","Seated Cable Rows","Lat Pulldown","Close Grip Lat Pulldowns","Machine Row","Bicep Curl (One Hand)","Hammer Curls"],"Chest, Triceps":["Single Arm Cable Tricep Extension","Tricep Rope Pull Downs","Cable Pushdowns Chest","Cable Chest Fly - Upper","Bench Press","Incline Bench Press","Rope Tricep Overhead Extension"],"Arms and Shoulders":["Face Pulls","Dumbbell Shrugs","Seated DB Shoulder Press","Cable Lateral Raises","Cable Reverse Fly","Wrist Curl","Reverse Curl"],"Legs":["Lunges","Seated Calf Raises","Adductor out to in","Hip Abduction in to out","Leg Curl","Leg Extension"],"Abs":["Hanging Leg Raise","Cable Crunch With Rope"]};
const compounds=["Bench Press","Incline Bench Press","Seated DB Shoulder Press"]; let workout="";
function home(){app.innerHTML='<div class=header>Workout Tracker v2.1</div>'; Object.keys(templates).forEach(w=>app.innerHTML+=`<div class=card onclick='showWorkout("${w}")'>${w}</div>`);}
function showWorkout(w){workout=w; app.innerHTML=`<button onclick='home()'>← Home</button><div class=header>${w}</div>`;
let order=JSON.parse(localStorage.getItem(w+"_order")||"null")||templates[w];
let completed=JSON.parse(localStorage.getItem(w+"_done")||"[]");
order.sort((a,b)=>completed.includes(a)-completed.includes(b));
order.forEach(ex=>app.innerHTML+=`<div class='card ${completed.includes(ex)?"done":""}' onclick='exercise("${ex}")'>${completed.includes(ex)?"✓ ":""}${ex}</div>`);
}
function exercise(ex){window.ex=ex; let hist=JSON.parse(localStorage.getItem(ex)||"[]"), prev=hist.at(-1);
app.innerHTML=`<button onclick='showWorkout(workout)'>← Back</button><div class=header>${ex}</div>`;
if(prev) app.innerHTML+=`<div class=card><b>Previous (${prev.date})</b><br>${prev.sets.map((s,i)=>`Set ${i+1}: ${s.weight}×${s.reps}`).join("<br>")}</div>`;
app.innerHTML+='<div class=card><table id=t><tr><th>Set</th><th>Weight</th><th>Reps</th><th>Status</th></tr></table><button onclick="row()">+ Add Set</button></div>';
window.sets=[]; for(let i=0;i<Math.max(prev?.sets?.length||0,3);i++) row(prev?.sets?.[i]);}
function row(p){let t=document.getElementById("t"), i=t.rows.length; let r=t.insertRow(); r.id="r"+i;
r.innerHTML=`<td>${i}</td><td><input id=w${i} value='${p?.weight||""}'></td><td><input id=rep${i} value='${p?.reps||""}'></td><td><button onclick='log(${i})'>✓</button><span id=s${i}></span></td>`;}
function log(i){let w=w=document.getElementById("w"+i).value,r=document.getElementById("rep"+i).value;if(!w||!r)return alert("Enter values");
sets[i-1]={weight:w,reps:r}; document.getElementById("r"+i).classList.add("logged"); document.getElementById("s"+i).innerHTML=" ✓ Logged";
let hist=JSON.parse(localStorage.getItem(ex)||"[]").filter(x=>x.date!==new Date().toLocaleDateString()); hist.push({date:new Date().toLocaleDateString(),sets:sets.filter(Boolean)}); localStorage.setItem(ex,JSON.stringify(hist));
let done=JSON.parse(localStorage.getItem(workout+"_done")||"[]"); if(!done.includes(ex)){done.push(ex); localStorage.setItem(workout+"_done",JSON.stringify(done));}
localStorage.setItem(workout+"_order",JSON.stringify([...templates[workout]].sort((a,b)=>done.includes(a)-done.includes(b))));
timer(compounds.includes(ex)?120:90);}
function timer(s){Notification.requestPermission(); let t=document.getElementById("timer"); t.classList.remove("hidden");
function draw(){t.innerHTML=`<div>${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</div><div><button onclick='skip()'>Skip</button><button onclick='s+=15'>+15</button><button onclick='s+=30'>+30</button></div>`;} draw();
window.int=setInterval(()=>{s--; draw(); if(s<=0){clearInterval(int); skip(); navigator.vibrate?.([300,100,300]); alert("Rest complete!");}},1000);}
function skip(){clearInterval(window.int); document.getElementById("timer").classList.add("hidden");}
const app=document.getElementById("app"); home();
