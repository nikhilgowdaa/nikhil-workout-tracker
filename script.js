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
  let html =
    '<div class="nav-bar">' +
      '<button class="btn-back" id="backBtn">‹</button>' +
      '<div class="nav-title">' + ex + '</div>' +
    '</div>';

  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  const todayStr = new Date().toLocaleDateString();
  
  // Separate today's progress from historical data
  let todayData = hist.find(x => x.date === todayStr);
  let prevData = hist.slice().reverse().find(x => x.date !== todayStr);

  if (prevData) {
    html +=
      '<div class="prev-card">' +
        '<div class="prev-label">Last session &nbsp;·&nbsp; ' + prevData.date + '</div>' +
        prevData.sets.map((s, i) => {
          if (!s) return ''; // Skip any deleted rows from history
          return '<div class="prev-row">' +
            '<span class="prev-set">Set ' + (i + 1) + '</span>' +
            '<span class="prev-val">' + s.weight + ' kg &nbsp;×&nbsp; ' + s.reps + ' reps</span>' +
          '</div>';
        }).join('') +
      '</div>';
  }

  html +=
    '<div class="sets-wrap">' +
      '<table id="tbl">' +
        '<thead><tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th></th><th></th></tr></thead>' +
        '<tbody></tbody>' +
      '</table>' +
      '<button class="btn-add-set" id="addSet">+ Add Set</button>' +
    '</div>';

  app.innerHTML = html;

  document.getElementById('backBtn').addEventListener('click', () => showWorkout(w));
  document.getElementById('addSet').addEventListener('click', () =>
    addRow(ex, document.querySelectorAll('#tbl tbody tr').length + 1));

  // Render rows based on the max of what was done previously or what is logged today
  const prevCount = prevData?.sets?.length || 3;
  const todayCount = todayData?.sets?.length || 0;
  const n = Math.max(prevCount, todayCount, 3);

  for (let i = 1; i <= n; i++) {
    const tSet = todayData?.sets?.[i - 1]; 
    const pSet = prevData?.sets?.[i - 1];
    addRow(ex, i, tSet, pSet);
  }
}

function addRow(ex, n, todaySet, prevSet) {
  const tr = document.createElement('tr');
  
  // If logged today, load the actual value. If not, use prevSet to create a gray placeholder.
  const isLogged = !!todaySet;
  const wtVal = todaySet ? todaySet.weight : '';
  const rpVal = todaySet ? todaySet.reps : '';
  
  const wtPh = (prevSet && prevSet.weight) ? prevSet.weight : '—';
  const rpPh = (prevSet && prevSet.reps) ? prevSet.reps : '—';

  tr.innerHTML =
    '<td class="set-num">' + n + '</td>' +
    '<td><input class="wt-in" type="number" inputmode="decimal" placeholder="' + wtPh + '" value="' + wtVal + '"></td>' +
    '<td><input class="rp-in" type="number" inputmode="numeric" placeholder="' + rpPh + '" value="' + rpVal + '"></td>' +
    '<td><button class="log-btn">LOG</button></td>' +
    '<td><button class="del-btn">✕</button></td>';
    
  document.querySelector('#tbl tbody').appendChild(tr);

  const logBtn = tr.querySelector('.log-btn');
  const delBtn = tr.querySelector('.del-btn');
  const wtIn = tr.querySelector('.wt-in');
  const rpIn = tr.querySelector('.rp-in');
  const numCell = tr.querySelector('.set-num');

  // Lock UI if row was already logged today
  if (isLogged) {
    tr.classList.add('logged');
    logBtn.disabled = true;
    logBtn.textContent = '✓';
  }

  logBtn.addEventListener('click', () => {
    // Smart Log: Use user input, OR fall back to the placeholder if input is empty
    const wt = wtIn.value || (wtPh !== '—' ? wtPh : '');
    const rp = rpIn.value || (rpPh !== '—' ? rpPh : '');
    
    if (!wt || !rp) { alert('Enter weight and reps'); return; }
    
    // Auto-fill the input so the user visibly sees what was saved
    wtIn.value = wt;
    rpIn.value = rp;

    const setN = parseInt(numCell.textContent);
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    const todayStr = new Date().toLocaleDateString();
    let today = hist.find(x => x.date === todayStr);
    if (!today) { today = { date: todayStr, sets: [] }; hist.push(today); }
    
    today.sets[setN - 1] = { weight: wt, reps: rp };
    localStorage.setItem(ex, JSON.stringify(hist));
    
    tr.classList.add('logged');
    logBtn.disabled = true;
    logBtn.textContent = '✓';
    startTimer(compounds.includes(ex) ? 120 : 90);
  });

  delBtn.addEventListener('click', () => {
    const setN = parseInt(numCell.textContent);
    const todayStr = new Date().toLocaleDateString();
    let hist = JSON.parse(localStorage.getItem(ex) || '[]');
    const ti = hist.findIndex(x => x.date === todayStr);
    
    if (ti !== -1 && hist[ti].sets[setN - 1]) {
      hist[ti].sets[setN - 1] = null; // Set to null to prevent shifting the array indexes
      
      // Clean up trailing nulls if we delete the very last set
      while(hist[ti].sets.length > 0 && hist[ti].sets[hist[ti].sets.length - 1] == null) {
        hist[ti].sets.pop();
      }
      if (hist[ti].sets.length === 0) hist.splice(ti, 1);
      
      localStorage.setItem(ex, JSON.stringify(hist));
    }
    
    tr.remove();
    // Renumber rows neatly
    document.querySelectorAll('#tbl tbody tr').forEach((row, idx) => {
      row.querySelector('.set-num').textContent = idx + 1;
    });
  });
}

function startTimer(sec) {
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');
  function render() {
    timerEl.innerHTML =
      '<div class="timer-label">Rest Timer</div>' +
      '<div class="timer-time">' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') + '</div>' +
      '<div class="timer-btns">' +
        '<button class="t-skip" id="skip">Skip</button>' +
        '<button class="t-add" id="p15">+15s</button>' +
        '<button class="t-add" id="p30">+30s</button>' +
      '</div>';
    document.getElementById('skip').onclick = () => { clearInterval(window.ti); timerEl.classList.add('hidden'); };
    document.getElementById('p15').onclick = () => sec += 15;
    document.getElementById('p30').onclick = () => sec += 30;
  }
  render();
  window.ti = setInterval(() => {
    sec--; render();
    if (sec <= 0) { clearInterval(window.ti); timerEl.classList.add('hidden'); alert('Rest done! 💪'); }
  }, 1000);
}

home();