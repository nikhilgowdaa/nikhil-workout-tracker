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

// ── Navigation ────────────────────────────────────

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

// ── Exercise screen (history-first) ──────────────

function showExercise(w, ex, addingSet = false) {
  lastRestTime = compounds.includes(ex) ? 120 : 90;

  const hist = JSON.parse(localStorage.getItem(ex) || '[]');
  // Newest date first
  const sorted = [...hist].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pre-fill from the very last logged set (today's latest, or previous session's latest)
  let prefill = { weight: '', reps: '' };
  if (sorted.length > 0 && sorted[0].sets.length > 0) {
    const last = sorted[0].sets[sorted[0].sets.length - 1];
    prefill = { weight: last.weight, reps: last.reps };
  }

  // Nav bar – hide + button while the add row is open
  let html =
    '<div class="nav-bar">' +
      '<button class="btn-back" id="backBtn">‹</button>' +
      '<div class="nav-title">' + ex + '</div>' +
      (!addingSet ? '<button class="btn-plus" id="addBtn">+</button>' : '') +
    '</div>';

  // ── Quick-add row ──────────────────────────────
  if (addingSet) {
    html +=
      '<div class="quick-add-wrap">' +
        '<div class="qa-label">New Set</div>' +
        '<div class="qa-row">' +
          '<input class="qa-input" type="number" inputmode="decimal" placeholder="kg" value="' + prefill.weight + '" id="qaWeight">' +
          '<span class="qa-sep">×</span>' +
          '<input class="qa-input" type="number" inputmode="numeric" placeholder="reps" value="' + prefill.reps + '" id="qaReps">' +
          '<button class="log-btn" id="qaLog">LOG</button>' +
          '<button class="qa-cancel" id="qaCancel">✕</button>' +
        '</div>' +
      '</div>';
  }

  // ── Sessions history ───────────────────────────
  if (sorted.length === 0) {
    if (!addingSet) {
      html += '<div class="empty-state">No sets logged yet.<br>Tap + to log your first set.</div>';
    }
  } else {
    html += '<div class="sessions-wrap">';
    sorted.forEach(session => {
      const n = session.sets.length;
      html +=
        '<div class="session-group">' +
          '<div class="session-date-hdr">' +
            '<span class="sd-label">' + formatDate(session.date) + '</span>' +
            '<span class="sd-meta">' + n + (n === 1 ? ' set' : ' sets') + '</span>' +
          '</div>';
      session.sets.forEach((set, i) => {
        html +=
          '<div class="session-set-row">' +
            '<span class="ss-num">Set ' + (i + 1) + '</span>' +
            '<span class="ss-val">' + set.weight + ' kg &nbsp;×&nbsp; ' + set.reps + ' reps</span>' +
            '<span class="ss-time">' + (set.time || '—') + '</span>' +
            '<button class="del-hist-btn" data-date="' + encodeURIComponent(session.date) + '" data-idx="' + i + '">✕</button>' +
          '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
  }

  app.innerHTML = html;

  // ── Wire up events ─────────────────────────────
  document.getElementById('backBtn').addEventListener('click', () => showWorkout(w));

  if (!addingSet) {
    document.getElementById('addBtn').addEventListener('click', () => showExercise(w, ex, true));
  } else {
    const qaWeight = document.getElementById('qaWeight');
    const qaReps = document.getElementById('qaReps');

    document.getElementById('qaLog').addEventListener('click', () => {
      const wt = qaWeight.value.trim();
      const rp = qaReps.value.trim();
      if (!wt || !rp) { alert('Enter weight and reps'); return; }
      logSet(ex, wt, rp);
      startTimer(lastRestTime);
      showExercise(w, ex, false); // back to history view, new set visible at top
    });

    document.getElementById('qaCancel').addEventListener('click', () => showExercise(w, ex, false));

    // Smart focus: if no prefill, start at weight; if pre-filled, jump straight to reps
    if (!prefill.weight) {
      qaWeight.focus();
    } else {
      qaReps.focus();
      qaReps.select();
    }
  }

  // Delete buttons for any historical set
  document.querySelectorAll('.del-hist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = decodeURIComponent(btn.dataset.date);
      const idx = parseInt(btn.dataset.idx);
      deleteHistSet(ex, date, idx);
      showExercise(w, ex, addingSet); // refresh in place
    });
  });
}

// ── Data helpers ──────────────────────────────────

function logSet(ex, weight, reps) {
  const todayStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  let today = hist.find(x => x.date === todayStr);
  if (!today) { today = { date: todayStr, sets: [] }; hist.push(today); }
  today.sets.push({ weight, reps, time: timeStr });
  localStorage.setItem(ex, JSON.stringify(hist));
}

function deleteHistSet(ex, date, idx) {
  let hist = JSON.parse(localStorage.getItem(ex) || '[]');
  const di = hist.findIndex(x => x.date === date);
  if (di !== -1) {
    hist[di].sets.splice(idx, 1);
    if (hist[di].sets.length === 0) hist.splice(di, 1);
    localStorage.setItem(ex, JSON.stringify(hist));
  }
}

function formatDate(dateStr) {
  const todayStr = new Date().toLocaleDateString();
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yStr = yd.toLocaleDateString();
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yStr) return 'Yesterday';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return dateStr; }
}

// ── Audio beep ────────────────────────────────────

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

// ── Rest timer ────────────────────────────────────

function startTimer(sec) {
  lastRestTime = sec;
  clearInterval(window.ti);
  timerEl.classList.remove('hidden');

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

  function visHandler() {
    if (!document.hidden) {
      const remaining = getRemaining();
      render();
      if (remaining === 0) {
        if (!beeped) { beeped = true; playBeep(); }
      } else {
        clearInterval(window.ti);
        window.ti = setInterval(tick, 500);
      }
    }
  }

  if (window.timerVisHandler) {
    document.removeEventListener('visibilitychange', window.timerVisHandler);
  }
  window.timerVisHandler = visHandler;
  document.addEventListener('visibilitychange', visHandler);

  render();
  window.ti = setInterval(tick, 500);
}

home();
