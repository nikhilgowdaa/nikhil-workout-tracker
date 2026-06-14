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

  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  let prev = hist[hist.length - 1];

  html +=
    '<div class="sets-wrap">' +
      '<table id="tbl">' +
        '<thead><tr><th>SET</th><th>WEIGHT</th><th>REPS</th><th></th><th></th></tr></thead>' +
        '<tbody></tbody>' +
      '</table>' +
      '<button class="btn-add-set" id="addSet">+ Add Set</button>' +
    '</div>';

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

// Play a short beep when rest is done using Web Audio API
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18, 0.36].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.15);
    });
  } catch (e) {}
}

function startTimer(sec) {
  lastRestTime = sec;
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');

  // KEY FIX: store absolute end time instead of counting down a variable.
  // When iOS backgrounds the PWA and kills setInterval, we can still
  // calculate the correct remaining time when the app comes back.
  window.timerEndTime = Date.now() + sec * 1000;
  let beeped = false;

  function getRemaining() {
    return Math.max(0, Math.round((window.timerEndTime - Date.now()) / 1000));
  }

  function render() {
    const remaining = getRemaining();
    const finished = remaining === 0;
    const mins = Math.floor(remaining / 60);
    const secs = String(remaining % 60).padStart(2, '0');

    timerEl.innerHTML =
      '<div class="timer-label">' + (finished ? 'Rest Complete! 💪' : 'Rest Timer') + '</div>' +
      '<div class="timer-time">' + mins + ':' + secs + '</div>' +
      '<div class="timer-btns">' +
        '<button class="t-skip" id="tSkip">Close</button>' +
        '<button class="t-preset' + (lastRestTime === 60 ? ' t-selected' : '') + '" data-s="60">60s</button>' +
        '<button class="t-preset' + (lastRestTime === 90 ? ' t-selected' : '') + '" data-s="90">90s</button>' +
        '<button class="t-preset' + (lastRestTime === 120 ? ' t-selected' : '') + '" data-s="120">120s</button>' +
      '</div>';

    document.getElementById('tSkip').onclick = () => {
      clearInterval(window.ti);
      document.removeEventListener('visibilitychange', window.timerVisHandler);
      timerEl.classList.add('hidden');
    };

    // Preset buttons: selecting restarts timer AND updates lastRestTime for future sets
    document.querySelectorAll('.t-preset').forEach(btn => {
      btn.onclick = () => {
        const newSec = parseInt(btn.dataset.s);
        lastRestTime = newSec;
        window.timerEndTime = Date.now() + newSec * 1000;
        beeped = false;
        clearInterval(window.ti);
        window.ti = setInterval(tick, 500);
        render();
      };
    });
  }

  function tick() {
    const remaining = getRemaining();
    render();
    if (remaining === 0) {
      clearInterval(window.ti);
      if (!beeped) { beeped = true; playBeep(); }
    }
  }

  // visibilitychange fires when user returns to the PWA.
  // We recalculate from the stored end timestamp so the display is always accurate.
  function visHandler() {
    if (!document.hidden) {
      const remaining = getRemaining();
      render();
      if (remaining === 0) {
        if (!beeped) { beeped = true; playBeep(); }
      } else {
        // Restart the interval since iOS may have killed it
        clearInterval(window.ti);
        window.ti = setInterval(tick, 500);
      }
    }
  }

  // Remove any existing handler before attaching a new one
  if (window.timerVisHandler) {
    document.removeEventListener('visibilitychange', window.timerVisHandler);
  }
  window.timerVisHandler = visHandler;
  document.addEventListener('visibilitychange', visHandler);

  render();
  window.ti = setInterval(tick, 500);
}

home();
