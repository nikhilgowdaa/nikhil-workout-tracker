// Global variable to persist the user's preferred rest time
let lastRestTime = 90;

const workouts = {
  'Back and Biceps': [
    'Bicep Superset', 'Cable Curl', 'Biceps - Hammer Curls', 'One Arm Dumbbell Row',
    'Seated Cable Rows', 'Lat Pulldown', 'Close Grip Lat Pulldowns', 'Machine Row',
    'Bicep Curl (One Hand)', 'Hammer Curls'
  ],
  'Chest and Triceps': [
    'Single Arm Cable Tricep Ext', 'Tricep Rope Pull Downs', 'Cable Pushdowns Chest',
    'Cable Chest Fly - Upper', 'Bench Press', 'Incline Bench Press', 'Rope Tricep Overhead Extension'
  ],
  'Arms and Shoulders': [
    'Face Pulls', 'Dumbbell Shrugs', 'Seated DB Shoulder Press', 'Cable Lateral Raises',
    'Cable Reverse Fly', 'Wrist Curl', 'Reverse Curl'
  ],
  'Legs': [
    'Lunges', 'Seated Calf Raises', 'Adductor Out to In', 'Hip Abduction In to Out',
    'Leg Curl', 'Leg Extension'
  ],
  'Abs': ['Hanging Leg Raise', 'Cable Crunch With Rope']
};

const icons = {
  'Back and Biceps': '💪',
  'Chest and Triceps': '🏋️',
  'Arms and Shoulders': '🦾',
  'Legs': '🦵',
  'Abs': '🔥'
};

const compounds = ['Bench Press', 'Incline Bench Press', 'Seated DB Shoulder Press', 'One Arm Dumbbell Row', 'Seated Cable Rows', 'Lat Pulldown'];
const app = document.getElementById('app');
const timerEl = document.getElementById('timer');

function home() {
  app.innerHTML =
    '<div class="home-eyebrow">Training</div>' +
    '<div class="home-title">My Workouts</div>' +
    '<div class="workout-list"></div>';
  const list = app.querySelector('.workout-list');
  Object.keys(workouts).forEach(w => {
    const d = document.createElement('div');
    d.className = 'workout-card';
    d.innerHTML =
      '<div class="workout-icon">' + icons[w] + '</div>' +
      '<div class="workout-info">' +
        '<div class="workout-name">' + w + '</div>' +
        '<div class="workout-meta">' + workouts[w].length + ' exercises</div>' +
      '</div>' +
      '<div class="chevron">›</div>';
    d.addEventListener('click', () => showWorkout(w));
    list.appendChild(d);
  });
}

function showWorkout(w) {
  app.innerHTML =
    '<div class="nav-bar">' +
      '<button class="btn-back" id="homeBtn">‹</button>' +
      '<div class="nav-title">' + w + '</div>' +
    '</div>' +
    '<div class="exercise-list"></div>';
  document.getElementById('homeBtn').addEventListener('click', home);
  const list = app.querySelector('.exercise-list');
  workouts[w].forEach(ex => {
    const c = document.createElement('div');
    c.className = 'exercise-card';
    c.innerHTML = '<span class="ex-name">' + ex + '</span><span class="chevron">›</span>';
    c.addEventListener('click', () => showExercise(w, ex));
    list.appendChild(c);
  });
}

function showExercise(w, ex) {
  lastRestTime = compounds.includes(ex) ? 120 : 90;

  let html =
    '<div class="nav-bar">' +
      '<button class="btn-back" id="backBtn">‹</button>' +
      '<div class="nav-title">' + ex + '</div>' +
    '</div>';

  html +=
    '<div class="sets-wrap">' +
      '<table id="tbl">' +
        '<thead><tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th></th><th></th></tr></thead>' +
        '<tbody></tbody>' +
      '</table>' +
      '<button class="btn-add-set" id="addSet">+ Add Set</button>' +
    '</div>';

  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  
  html += '<h2 style="margin: 40px 0 20px 0; font-size: 1.5rem;">History</h2>';
  
  if (hist.length > 0) {
    [...hist].reverse().forEach(session => {
      html +=
        '<div class="prev-card" style="margin-bottom: 20px;">' +
          '<div class="prev-label" style="font-weight: bold; color: #888; margin-bottom: 8px;">' + session.date + '</div>' +
          session.sets.map((s, i) =>
            '<div class="prev-row">' +
              '<span class="prev-set">Set ' + (i + 1) + '</span>' +
              '<span class="prev-val">' + s.weight + ' kg &nbsp;×&nbsp; ' + s.reps + ' reps</span>' +
            '</div>'
          ).join('') +
        '</div>';
    });
  }

  app.innerHTML = html;

  document.getElementById('backBtn').addEventListener('click', () => showWorkout(w));
  document.getElementById('addSet').addEventListener('click', () =>
    addRow(ex, document.querySelectorAll('#tbl tbody tr').length + 1));

  const todayStr = new Date().toLocaleDateString();
  const todayEntry = hist.find(x => x.date === todayStr);
  const n = todayEntry ? todayEntry.sets.length : (hist[hist.length - 1]?.sets.length || 3);
  
  for (let i = 1; i <= n; i++) {
    const data = todayEntry?.sets[i - 1] || hist[hist.length - 1]?.sets[i - 1] || {};
    addRow(ex, i, data, !!todayEntry?.sets[i - 1]);
  }
}

function addRow(ex, n, data = {}, isLogged = false) {
  const tr = document.createElement('tr');
  const todayStr = new Date().toLocaleDateString();
  
  tr.innerHTML =
    '<td class="set-num">' + n + '</td>' +
    '<td><input class="wt-in" type="number" inputmode="decimal" placeholder="—" value="' + (data.weight || '') + '" ' + (isLogged ? 'disabled' : '') + '></td>' +
    '<td><input class="rp-in" type="number" inputmode="numeric" placeholder="—" value="' + (data.reps || '') + '" ' + (isLogged ? 'disabled' : '') + '></td>' +
    '<td><button class="log-btn" ' + (isLogged ? 'disabled' : '') + '>' + (isLogged ? '✓' : 'LOG') + '</button></td>' +
    '<td><button class="del-btn">✕</button></td>';
    
  if (isLogged) tr.classList.add('logged');
  document.querySelector('#tbl tbody').appendChild(tr);

  const logBtn = tr.querySelector('.log-btn');
  const delBtn = tr.querySelector('.del-btn');
  const wtIn = tr.querySelector('.wt-in');
  const rpIn = tr.querySelector('.rp-in');
  const numCell = tr.querySelector('.set-num');

  logBtn.addEventListener('click', () => {
    const wt = wtIn.value, rp = rpIn.value;
    if (!wt || !rp) { alert('Enter weight and reps'); return; }
    
    const setN = parseInt(numCell.textContent);
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    let today = hist.find(x => x.date === todayStr);
    if (!today) { today = { date: todayStr, sets: [] }; hist.push(today); }
    
    today.sets[setN - 1] = { weight: wt, reps: rp };
    localStorage.setItem(ex, JSON.stringify(hist));
    
    tr.classList.add('logged');
    logBtn.disabled = true;
    logBtn.textContent = '✓';
    wtIn.disabled = true;
    rpIn.disabled = true;
    
    startTimer(lastRestTime);
  });

  delBtn.addEventListener('click', () => {
    const setN = parseInt(numCell.textContent);
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    const ti = hist.findIndex(x => x.date === todayStr);
    
    if (ti !== -1) {
      hist[ti].sets.splice(setN - 1, 1);
      if (hist[ti].sets.length === 0) hist.splice(ti, 1);
      localStorage.setItem(ex, JSON.stringify(hist));
    }
    
    tr.remove();
    document.querySelectorAll('#tbl tbody tr').forEach((row, idx) => {
      row.querySelector('.set-num').textContent = idx + 1;
    });
  });
}

function startTimer(sec) {
  lastRestTime = sec;
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');
  
  function render() {
    const mins = Math.floor(sec / 60);
    const secs = String(sec % 60).padStart(2, '0');
    
    timerEl.innerHTML =
      '<div class="timer-label">' + (sec > 0 ? 'Rest Timer' : 'Rest Finished! 💪') + '</div>' +
      '<div class="timer-time">' + (sec >= 0 ? mins + ':' + secs : '0:00') + '</div>' +
      '<div class="timer-btns">' +
        '<button class="t-skip" id="skip">Close</button>' +
        '<button class="t-add" id="p15">+15s</button>' +
        '<button class="t-add" id="p30">+30s</button>' +
        '<input type="number" id="customTime" placeholder="Custom (s)" style="width:80px; padding:5px; border-radius:4px; border:none;">' +
      '</div>';
      
    document.getElementById('skip').onclick = () => { clearInterval(window.ti); timerEl.classList.add('hidden'); };
    document.getElementById('p15').onclick = () => { sec += 15; lastRestTime = sec; render(); };
    document.getElementById('p30').onclick = () => { sec += 30; lastRestTime = sec; render(); };
    
    const customInput = document.getElementById('customTime');
    customInput.onchange = (e) => {
        sec = parseInt(e.target.value) || sec;
        lastRestTime = sec;
        render();
    };
  }
  
  render();
  window.ti = setInterval(() => {
    if (sec > 0) {
      sec--;
      render();
    } else {
      clearInterval(window.ti);
      render();
    }
  }, 1000);
}

home();  const list = app.querySelector('.exercise-list');
  workouts[w].forEach(ex => {
    const c = document.createElement('div');
    c.className = 'exercise-card';
    c.innerHTML = '<span class="ex-name">' + ex + '</span><span class="chevron">›</span>';
    c.addEventListener('click', () => showExercise(w, ex));
    list.appendChild(c);
  });
}

function showExercise(w, ex) {
  // Set default time for this exercise if it's a compound move
  lastRestTime = compounds.includes(ex) ? 120 : 90;

  let html =
    '<div class="nav-bar">' +
      '<button class="btn-back" id="backBtn">‹</button>' +
      '<div class="nav-title">' + ex + '</div>' +
    '</div>';

  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  let prev = hist[hist.length - 1];

  // 1. Current Session Logging Area
  html +=
    '<div class="sets-wrap">' +
      '<table id="tbl">' +
        '<thead><tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th></th><th></th></tr></thead>' +
        '<tbody></tbody>' +
      '</table>' +
      '<button class="btn-add-set" id="addSet">+ Add Set</button>' +
    '</div>';

  // 2. Last Session Details below
  if (prev) {
    html +=
      '<div class="prev-card" style="margin-top: 32px;">' +
        '<div class="prev-label">Last session &nbsp;·&nbsp; ' + prev.date + '</div>' +
        prev.sets.map((s, i) =>
          '<div class="prev-row">' +
            '<span class="prev-set">Set ' + (i + 1) + '</span>' +
            '<span class="prev-val">' + s.weight + ' kg &nbsp;×&nbsp; ' + s.reps + ' reps</span>' +
          '</div>'
        ).join('') +
      '</div>';
  }

  app.innerHTML = html;

  document.getElementById('backBtn').addEventListener('click', () => showWorkout(w));
  document.getElementById('addSet').addEventListener('click', () =>
    addRow(ex, document.querySelectorAll('#tbl tbody tr').length + 1));

  const n = prev?.sets?.length || 3;
  for (let i = 1; i <= n; i++) addRow(ex, i, prev?.sets?.[i - 1]);
}

function addRow(ex, n, data = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML =
    '<td class="set-num">' + n + '</td>' +
    '<td><input class="wt-in" type="number" inputmode="decimal" placeholder="—" value="' + (data.weight || '') + '"></td>' +
    '<td><input class="rp-in" type="number" inputmode="numeric" placeholder="—" value="' + (data.reps || '') + '"></td>' +
    '<td><button class="log-btn">LOG</button></td>' +
    '<td><button class="del-btn">✕</button></td>';
  document.querySelector('#tbl tbody').appendChild(tr);

  const logBtn = tr.querySelector('.log-btn');
  const delBtn = tr.querySelector('.del-btn');
  const wtIn = tr.querySelector('.wt-in');
  const rpIn = tr.querySelector('.rp-in');
  const numCell = tr.querySelector('.set-num');

  logBtn.addEventListener('click', () => {
    const wt = wtIn.value, rp = rpIn.value;
    if (!wt || !rp) { alert('Enter weight and reps'); return; }
    const setN = parseInt(numCell.textContent);
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    let today = hist.find(x => x.date === new Date().toLocaleDateString());
    if (!today) { today = { date: new Date().toLocaleDateString(), sets: [] }; hist.push(today); }
    today.sets[setN - 1] = { weight: wt, reps: rp };
    localStorage.setItem(ex, JSON.stringify(hist));
    tr.classList.add('logged');
    logBtn.disabled = true;
    logBtn.textContent = '✓';
    
    // Start timer using the persisted lastRestTime
    startTimer(lastRestTime);
  });

  delBtn.addEventListener('click', () => {
    const setN = parseInt(numCell.textContent);
    const todayStr = new Date().toLocaleDateString();
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    const ti = hist.findIndex(x => x.date === todayStr);
    if (ti !== -1) {
      hist[ti].sets.splice(setN - 1, 1);
      if (hist[ti].sets.length === 0) hist.splice(ti, 1);
      localStorage.setItem(ex, JSON.stringify(hist));
    }
    tr.remove();
    document.querySelectorAll('#tbl tbody tr').forEach((row, idx) => {
      row.querySelector('.set-num').textContent = idx + 1;
    });
  });
}

function startTimer(sec) {
  lastRestTime = sec;
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');
  
  function render() {
    const mins = Math.floor(sec / 60);
    const secs = String(sec % 60).padStart(2, '0');
    
    timerEl.innerHTML =
      '<div class="timer-label">' + (sec > 0 ? 'Rest Timer' : 'Rest Finished! 💪') + '</div>' +
      '<div class="timer-time">' + (sec >= 0 ? mins + ':' + secs : '0:00') + '</div>' +
      '<div class="timer-btns">' +
        '<button class="t-skip" id="skip">Close</button>' +
        '<button class="t-add" id="p15">+15s</button>' +
        '<button class="t-add" id="p30">+30s</button>' +
        '<input type="number" id="customTime" placeholder="Custom (s)" style="width:80px; padding:5px; border-radius:4px; border:none;">' +
      '</div>';
      
    document.getElementById('skip').onclick = () => { clearInterval(window.ti); timerEl.classList.add('hidden'); };
    document.getElementById('p15').onclick = () => { sec += 15; lastRestTime = sec; render(); };
    document.getElementById('p30').onclick = () => { sec += 30; lastRestTime = sec; render(); };
    
    const customInput = document.getElementById('customTime');
    customInput.onchange = (e) => {
        sec = parseInt(e.target.value) || sec;
        lastRestTime = sec;
        render();
    };
  }
  
  render();
  window.ti = setInterval(() => {
    if (sec > 0) {
      sec--;
      render();
    } else {
      clearInterval(window.ti);
      render(); // Final render to show "Rest Finished!"
    }
  }, 1000);
}

home();
