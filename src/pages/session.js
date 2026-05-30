/**
 * session.js — Active Workout Session (route: #/session/:phaseId)
 *
 * The CORE screen — a full guided workout session from warm-up
 * through main workout to cooldown and celebration.
 *
 * State machine: PRE_WORKOUT → WARMUP → MAIN_WORKOUT → COOLDOWN → COMPLETE
 */

import { getUserProfile, saveSession, savePhaseProgress, getSessionCountByPhase } from '../db/database.js';
import PHOENIX_PROTOCOL from '../data/workouts.js';

// ─── Session State ───────────────────────────────────────────

let sessionState = {
  phaseId: 1,
  stage: 'PRE_WORKOUT',
  currentExerciseIndex: 0,
  currentSet: 1,
  currentRound: 1,
  currentGroupIndex: 0,
  exerciseLog: [],
  startTime: null,
  endTime: null,
  isResting: false,
  restTimeRemaining: 0,
  timerInterval: null,
  exerciseTimerInterval: null,
  maxRepsCount: 0,
};

let currentPhase = null;

// ─── Helpers ─────────────────────────────────────────────────

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function getExerciseIllustration(name) {
  // SVG stick-figure illustrations for exercises
  const illustrations = {
    'incline-pushups': `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="85" cy="20" r="8" stroke="#F97316" stroke-width="2"/><line x1="85" y1="28" x2="60" y2="45" stroke="#F97316" stroke-width="2"/><line x1="60" y1="45" x2="40" y2="65" stroke="#F97316" stroke-width="2"/><line x1="40" y1="65" x2="30" y2="70" stroke="#F97316" stroke-width="2"/><line x1="60" y1="45" x2="90" y2="55" stroke="#F97316" stroke-width="2"/><line x1="90" y1="55" x2="100" y2="60" stroke="#F97316" stroke-width="2"/><rect x="25" y="60" width="10" height="20" rx="2" stroke="#F97316" stroke-width="1.5" fill="rgba(249,115,22,0.1)"/></svg>`,
    'pushups': `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="90" cy="25" r="8" stroke="#F97316" stroke-width="2"/><line x1="90" y1="33" x2="60" y2="40" stroke="#F97316" stroke-width="2"/><line x1="60" y1="40" x2="30" y2="40" stroke="#F97316" stroke-width="2"/><line x1="90" y1="40" x2="95" y2="55" stroke="#F97316" stroke-width="2"/><line x1="95" y1="55" x2="90" y2="65" stroke="#F97316" stroke-width="2"/><line x1="30" y1="40" x2="25" y2="55" stroke="#F97316" stroke-width="2"/><line x1="25" y1="55" x2="20" y2="65" stroke="#F97316" stroke-width="2"/></svg>`,
    'default': `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="15" r="10" stroke="#F97316" stroke-width="2"/><line x1="60" y1="25" x2="60" y2="50" stroke="#F97316" stroke-width="2"/><line x1="60" y1="50" x2="45" y2="70" stroke="#F97316" stroke-width="2"/><line x1="60" y1="50" x2="75" y2="70" stroke="#F97316" stroke-width="2"/><line x1="60" y1="32" x2="40" y2="42" stroke="#F97316" stroke-width="2"/><line x1="60" y1="32" x2="80" y2="42" stroke="#F97316" stroke-width="2"/></svg>`
  };
  return illustrations[name] || illustrations['default'];
}

function clearTimers() {
  if (sessionState.timerInterval) {
    clearInterval(sessionState.timerInterval);
    sessionState.timerInterval = null;
  }
  if (sessionState.exerciseTimerInterval) {
    clearInterval(sessionState.exerciseTimerInterval);
    sessionState.exerciseTimerInterval = null;
  }
}

// ─── Stage: PRE_WORKOUT ──────────────────────────────────────

function renderPreWorkout() {
  const phase = currentPhase;
  const rules = PHOENIX_PROTOCOL.goldenRules;

  return `
    <div class="page">
      <div class="container">
        <div style="text-align: center; padding: 32px 0 16px;">
          <div style="font-size: 48px;">💧</div>
          <h1 class="heading-lg" style="margin-top: 12px;">Pre-Workout Checklist</h1>
          <p class="text-sm text-muted mt-sm">${phase.name} — ${phase.method.name}</p>
        </div>

        <!-- Hydration Checklist -->
        <div class="card mt-lg">
          <h3 class="heading-sm mb-md">Before You Begin</h3>
          <label class="flex items-center gap-md" style="padding: 12px 0; cursor: pointer; min-height: 44px;">
            <input type="checkbox" id="check-water" style="width: 22px; height: 22px; accent-color: var(--color-accent);">
            <span>Drank a glass of water 💧</span>
          </label>
          <div class="divider" style="margin: 0;"></div>
          <label class="flex items-center gap-md" style="padding: 12px 0; cursor: pointer; min-height: 44px;">
            <input type="checkbox" id="check-space" style="width: 22px; height: 22px; accent-color: var(--color-accent);">
            <span>Clear workout space 🧹</span>
          </label>
          <div class="divider" style="margin: 0;"></div>
          <label class="flex items-center gap-md" style="padding: 12px 0; cursor: pointer; min-height: 44px;">
            <input type="checkbox" id="check-feel" style="width: 22px; height: 22px; accent-color: var(--color-accent);">
            <span>Feeling good to train 💪</span>
          </label>
        </div>

        <!-- Golden Rules Reminder -->
        <div class="card mt-md">
          <h3 class="heading-sm mb-md">📜 Remember</h3>
          ${rules.map(rule => `
            <div class="flex items-start gap-sm" style="padding: 6px 0;">
              <span class="text-primary" style="font-weight: 700; min-width: 20px;">•</span>
              <span class="text-sm"><strong>${rule.title}</strong> — ${rule.description}</span>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-fire btn-lg btn-full mt-xl" id="begin-warmup-btn" style="padding: 18px;">
          🔥 Begin Warm-Up
        </button>

        <button class="btn btn-ghost btn-full mt-md" id="cancel-session-btn" style="min-height: 44px;">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  `;
}

// ─── Stage: WARMUP ───────────────────────────────────────────

function renderWarmup() {
  const warmup = PHOENIX_PROTOCOL.warmup;
  const exercises = warmup.exercises;
  const idx = sessionState.currentExerciseIndex;
  const exercise = exercises[idx];
  const total = exercises.length;

  return `
    <div class="page">
      <div class="container">
        <!-- Stage header -->
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-warning">WARM-UP</span>
          <span class="text-sm text-muted">${idx + 1} / ${total}</span>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar mb-lg">
          <div class="progress-bar-fill" style="width: ${((idx + 1) / total) * 100}%; background: var(--color-warning);"></div>
        </div>

        <!-- Exercise illustration -->
        <div style="display: flex; justify-content: center; padding: 16px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <!-- Exercise info -->
        <div class="text-center">
          <h2 class="heading-md">${exercise.name}</h2>
          <p class="text-sm text-muted mt-sm">${exercise.description}</p>
        </div>

        <!-- Timer or reps info -->
        <div class="card mt-lg text-center">
          ${exercise.type === 'timed' ? `
            <div id="warmup-timer-display" class="heading-xl text-primary" style="font-size: 3rem;">${formatTime(exercise.duration)}</div>
            <div class="text-sm text-muted mt-sm">${exercise.duration} seconds</div>
            <button class="btn btn-primary btn-lg btn-full mt-md" id="warmup-timer-btn">
              ▶ Start Timer
            </button>
          ` : `
            <div class="heading-xl text-primary" style="font-size: 2rem;">${exercise.reps}</div>
            <div class="text-sm text-muted mt-sm">reps</div>
          `}
        </div>

        <!-- Nav buttons -->
        <div class="flex gap-md mt-lg">
          ${idx > 0 ? `<button class="btn btn-ghost flex-1" id="warmup-prev-btn" style="min-height: 48px;">← Prev</button>` : '<div class="flex-1"></div>'}
          <button class="btn btn-primary flex-1" id="warmup-next-btn" style="min-height: 48px;">
            ${idx === total - 1 ? 'Start Workout →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── Stage: MAIN_WORKOUT (Phase-specific) ────────────────────

function renderMainWorkout() {
  const phase = currentPhase;

  if (phase.id === 1) return renderPhase1Workout();
  if (phase.id === 2) return renderPhase2Workout();
  if (phase.id === 3) return renderPhase3Workout();

  return renderPhase1Workout(); // fallback
}

// Phase 1: Straight Sets
function renderPhase1Workout() {
  const exercises = currentPhase.exercises;
  const idx = sessionState.currentExerciseIndex;
  const exercise = exercises[idx];
  const total = exercises.length;
  const currentSet = sessionState.currentSet;
  const totalSets = exercise.sets;

  if (sessionState.isResting) {
    return renderRestTimer(exercise.rest, `Set ${currentSet - 1}/${totalSets} complete`, exercise.name);
  }

  const overallProgress = ((idx * totalSets + currentSet - 1) / (total * totalSets)) * 100;

  return `
    <div class="page">
      <div class="container">
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-primary">STRAIGHT SETS</span>
          <span class="text-sm text-muted">Exercise ${idx + 1}/${total} · Set ${currentSet}/${totalSets}</span>
        </div>

        <div class="progress-bar mb-md">
          <div class="progress-bar-fill" style="width: ${overallProgress}%;"></div>
        </div>

        <div style="display: flex; justify-content: center; padding: 12px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <div class="text-center">
          <h2 class="heading-md">${exercise.name}</h2>
          <div class="flex-center gap-sm mt-sm">
            <span class="badge badge-primary">Set ${currentSet}/${totalSets}</span>
          </div>
        </div>

        <!-- Exercise target -->
        <div class="card mt-lg text-center">
          ${exercise.type === 'timed' ? `
            <div id="exercise-timer-display" class="heading-xl text-primary" style="font-size: 3rem;">${formatTime(exercise.durationMin || parseInt(exercise.duration))}</div>
            <div class="text-sm text-muted mt-sm">${exercise.duration} seconds</div>
            <button class="btn btn-primary btn-lg btn-full mt-md" id="exercise-timer-btn">
              ▶ Start Timer
            </button>
          ` : `
            <div class="heading-xl text-primary" style="font-size: 3rem;">${exercise.reps}</div>
            <div class="text-sm text-muted mt-sm">reps</div>
          `}
        </div>

        <!-- Form cues -->
        ${exercise.formCues ? `
          <div class="card mt-md">
            <h4 class="text-sm text-muted mb-sm">💡 Form Cues</h4>
            ${exercise.formCues.map(cue => `
              <div class="flex items-start gap-sm" style="padding: 4px 0;">
                <span class="text-primary">•</span>
                <span class="text-sm">${cue}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <button class="btn btn-accent btn-lg btn-full mt-lg" id="complete-set-btn" style="padding: 18px;">
          ✓ Complete Set ${currentSet}/${totalSets}
        </button>

        <button class="btn btn-ghost btn-full mt-sm" id="skip-exercise-btn" style="min-height: 44px;">
          Skip Exercise
        </button>
      </div>
    </div>
  `;
}

// Phase 2: Supersets
function renderPhase2Workout() {
  const groups = currentPhase.exerciseGroups;
  const groupIdx = sessionState.currentGroupIndex;
  const group = groups[groupIdx];

  if (!group) return renderCooldown();

  if (group.type === 'finisher') {
    return renderFinisher(group.exercises[0]);
  }

  const exercises = group.exercises;
  const exIdx = sessionState.currentExerciseIndex;
  const exercise = exercises[exIdx];
  const round = sessionState.currentRound;
  const totalRounds = group.rounds;

  if (sessionState.isResting) {
    return renderRestTimer(group.rest, `${group.label} — Round ${round - 1}/${totalRounds} complete`, group.label);
  }

  const label = exercise.label || `${groupIdx + 1}${exIdx === 0 ? 'A' : 'B'}`;
  const overallProgress = ((groupIdx * totalRounds + round - 1) / (groups.length * totalRounds)) * 100;

  return `
    <div class="page">
      <div class="container">
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-primary">SUPERSET</span>
          <span class="text-sm text-muted">${group.label} · Round ${round}/${totalRounds}</span>
        </div>

        <div class="progress-bar mb-md">
          <div class="progress-bar-fill" style="width: ${overallProgress}%;"></div>
        </div>

        <!-- Superset header -->
        <div class="card-compact text-center" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), transparent); border-radius: var(--radius-md); padding: 10px;">
          <span class="heading-sm text-primary">${group.label} — Round ${round}/${totalRounds}</span>
        </div>

        <div style="display: flex; justify-content: center; padding: 12px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <div class="text-center">
          <div class="badge badge-warning mb-sm">${label}</div>
          <h2 class="heading-md">${exercise.name}</h2>
        </div>

        <div class="card mt-lg text-center">
          <div class="heading-xl text-primary" style="font-size: 3rem;">${exercise.reps}</div>
          <div class="text-sm text-muted mt-sm">reps</div>
        </div>

        ${exercise.formCues ? `
          <div class="card mt-md">
            <h4 class="text-sm text-muted mb-sm">💡 Form Cues</h4>
            ${exercise.formCues.map(cue => `
              <div class="flex items-start gap-sm" style="padding: 4px 0;">
                <span class="text-primary">•</span>
                <span class="text-sm">${cue}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <button class="btn btn-accent btn-lg btn-full mt-lg" id="complete-set-btn" style="padding: 18px;">
          ${exIdx < exercises.length - 1 ? '✓ Done, Next Exercise →' : '✓ Done, Rest'}
        </button>
      </div>
    </div>
  `;
}

// Phase 3: Circuit
function renderPhase3Workout() {
  const circuit = currentPhase.circuit;
  const exercises = circuit.exercises;
  const idx = sessionState.currentExerciseIndex;
  const exercise = exercises[idx];
  const round = sessionState.currentRound;
  const maxRounds = circuit.rounds.max;

  if (sessionState.isResting) {
    return renderRestTimer(circuit.restBetweenRounds, `Round ${round - 1}/${maxRounds} complete`, 'Circuit');
  }

  const overallProgress = (((round - 1) * exercises.length + idx) / (maxRounds * exercises.length)) * 100;

  return `
    <div class="page">
      <div class="container">
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-primary">CIRCUIT</span>
          <span class="text-sm text-muted">Round ${round}/${maxRounds} · ${idx + 1}/${exercises.length}</span>
        </div>

        <div class="progress-bar mb-md">
          <div class="progress-bar-fill" style="width: ${overallProgress}%;"></div>
        </div>

        <div class="card-compact text-center" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), transparent); border-radius: var(--radius-md); padding: 10px;">
          <span class="heading-sm text-primary">ROUND ${round}/${maxRounds}</span>
        </div>

        <div style="display: flex; justify-content: center; padding: 12px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <div class="text-center">
          <h2 class="heading-md">${exercise.name}</h2>
        </div>

        <div class="card mt-lg text-center">
          ${exercise.type === 'timed' ? `
            <div id="exercise-timer-display" class="heading-xl text-primary" style="font-size: 3rem;">${formatTime(exercise.durationMin || parseInt(exercise.duration))}</div>
            <button class="btn btn-primary btn-lg btn-full mt-md" id="exercise-timer-btn">
              ▶ Start Timer
            </button>
          ` : exercise.type === 'max-reps' ? `
            <div class="heading-xl text-primary" style="font-size: 2.5rem;">MAX REPS</div>
            <div class="text-sm text-muted mt-sm">${exercise.tips}</div>
          ` : `
            <div class="heading-xl text-primary" style="font-size: 3rem;">${exercise.reps}</div>
            <div class="text-sm text-muted mt-sm">reps</div>
          `}
        </div>

        ${exercise.formCues ? `
          <div class="card mt-md">
            <h4 class="text-sm text-muted mb-sm">💡 Form Cues</h4>
            ${exercise.formCues.map(cue => `
              <div class="flex items-start gap-sm" style="padding: 4px 0;">
                <span class="text-primary">•</span>
                <span class="text-sm">${cue}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <button class="btn btn-accent btn-lg btn-full mt-lg" id="complete-set-btn" style="padding: 18px;">
          ✓ Done${idx < exercises.length - 1 ? ', Next →' : ', End Round'}
        </button>
      </div>
    </div>
  `;
}

// Finisher (Phase 2)
function renderFinisher(exercise) {
  return `
    <div class="page">
      <div class="container">
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-danger">🔥 FINISHER</span>
        </div>

        <div style="display: flex; justify-content: center; padding: 12px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <div class="text-center">
          <h2 class="heading-md">${exercise.name}</h2>
          <p class="text-sm text-muted mt-sm">${exercise.tips}</p>
        </div>

        <div class="card mt-lg text-center">
          <div class="text-sm text-muted mb-sm">Rep Counter</div>
          <div class="heading-xl text-primary" id="max-reps-display" style="font-size: 4rem;">${sessionState.maxRepsCount}</div>

          <div class="flex-center gap-lg mt-lg">
            <button class="btn btn-outline btn-icon" id="reps-minus-btn" style="width: 56px; height: 56px; font-size: 1.5rem; border-radius: 50%;">−</button>
            <button class="btn btn-primary btn-icon" id="reps-plus-btn" style="width: 72px; height: 72px; font-size: 2rem; border-radius: 50%;">+</button>
          </div>
        </div>

        <button class="btn btn-accent btn-lg btn-full mt-lg" id="finisher-done-btn" style="padding: 18px;">
          ✓ Finisher Complete
        </button>
      </div>
    </div>
  `;
}

// ─── Rest Timer ──────────────────────────────────────────────

function renderRestTimer(restSeconds, message, context) {
  return `
    <div class="page">
      <div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;">
        <div class="text-center">
          <div style="font-size: 48px; margin-bottom: 12px;">⏱️</div>
          <h2 class="heading-lg">Rest</h2>
          <p class="text-sm text-muted mt-sm">${message}</p>
        </div>

        <div class="card mt-xl text-center" style="width: 100%; max-width: 280px;">
          <div id="rest-timer-display" class="heading-xl" style="font-size: 4rem; color: var(--color-primary);">
            ${formatTime(restSeconds)}
          </div>
          <div class="progress-bar mt-lg" style="height: 6px;">
            <div id="rest-progress-fill" class="progress-bar-fill" style="width: 100%; background: var(--color-primary); transition: width 1s linear;"></div>
          </div>
        </div>

        <button class="btn btn-outline mt-xl" id="skip-rest-btn" style="min-height: 48px; padding: 14px 32px;">
          Skip Rest →
        </button>
      </div>
    </div>
  `;
}

// ─── Stage: COOLDOWN ─────────────────────────────────────────

function renderCooldown() {
  const cooldowns = currentPhase.cooldown;
  const idx = sessionState.currentExerciseIndex;
  const exercise = cooldowns[idx];
  const total = cooldowns.length;

  if (!exercise) {
    advanceStage('COMPLETE');
    return '';
  }

  return `
    <div class="page">
      <div class="container">
        <div class="flex-between" style="padding: 16px 0;">
          <span class="badge badge-accent">COOLDOWN</span>
          <span class="text-sm text-muted">${idx + 1} / ${total}</span>
        </div>

        <div class="progress-bar mb-lg">
          <div class="progress-bar-fill" style="width: ${((idx + 1) / total) * 100}%; background: var(--color-accent);"></div>
        </div>

        <div style="display: flex; justify-content: center; padding: 16px 0;">
          <div style="width: 160px; height: 120px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration(exercise.illustration)}
          </div>
        </div>

        <div class="text-center">
          <h2 class="heading-md">${exercise.name}</h2>
          <p class="text-sm text-muted mt-sm">${exercise.description}</p>
        </div>

        <div class="card mt-lg text-center">
          <div id="cooldown-timer-display" class="heading-xl text-primary" style="font-size: 3rem;">${formatTime(exercise.duration)}</div>
          <button class="btn btn-accent btn-lg btn-full mt-md" id="cooldown-timer-btn">
            ▶ Start Timer
          </button>
        </div>

        <div class="flex gap-md mt-lg">
          <div class="flex-1"></div>
          <button class="btn btn-accent flex-1" id="cooldown-next-btn" style="min-height: 48px;">
            ${idx === total - 1 ? 'Finish Workout 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── Stage: COMPLETE ─────────────────────────────────────────

async function renderComplete() {
  sessionState.endTime = Date.now();
  const durationSec = Math.round((sessionState.endTime - sessionState.startTime) / 1000);
  const exerciseCount = sessionState.exerciseLog.length;

  // Save session to database
  try {
    await saveSession({
      date: toDateString(new Date()),
      phaseId: sessionState.phaseId,
      exercises: sessionState.exerciseLog,
      duration: durationSec,
      completedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Session] Failed to save:', e);
  }

  // Check if graduation test should be shown
  const sessionsCompleted = await getSessionCountByPhase(sessionState.phaseId);
  const totalExpected = currentPhase.schedule.workDaysPerWeek * currentPhase.weeks.total;
  const showGraduation = currentPhase.graduationTest && sessionsCompleted >= totalExpected * 0.7;

  return `
    <div class="page">
      <div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh;">
        <!-- Celebration -->
        <div class="text-center animate-bounceIn">
          <div style="font-size: 80px; margin-bottom: 8px;" id="celebration-emoji">🔥</div>
          <h1 class="heading-xl text-fire">Session Complete!</h1>
        </div>

        <!-- Confetti effect -->
        <div id="confetti-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></div>

        <!-- Stats -->
        <div class="grid-2 mt-xl" style="width: 100%;">
          <div class="card text-center">
            <div class="heading-lg text-primary">${formatDuration(durationSec)}</div>
            <div class="text-xs text-muted mt-xs">Duration</div>
          </div>
          <div class="card text-center">
            <div class="heading-lg text-accent">${exerciseCount}</div>
            <div class="text-xs text-muted mt-xs">Exercises</div>
          </div>
        </div>

        <div class="card mt-md text-center" style="width: 100%;">
          <div class="text-sm text-muted">Phase</div>
          <div class="heading-sm mt-xs">${currentPhase.name}</div>
          <div class="text-xs text-muted mt-xs">${currentPhase.method.name}</div>
        </div>

        ${showGraduation ? `
          <a href="#/graduation/${sessionState.phaseId}" class="btn btn-fire btn-lg btn-full mt-lg" style="padding: 18px;">
            🏆 Take Graduation Test
          </a>
        ` : ''}

        <button class="btn btn-primary btn-lg btn-full mt-lg" id="back-to-dashboard-btn" style="padding: 18px;">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  `;
}

// ─── Confetti Effect ─────────────────────────────────────────

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = ['#F97316', '#FB923C', '#F59E0B', '#EF4444', '#22C55E', '#DC2626'];

  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 600;
    const size = Math.random() * 8 + 4;
    const duration = Math.random() * 2000 + 1500;

    confetti.style.cssText = `
      position: absolute;
      top: -10px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${duration}ms ease-in ${delay}ms forwards;
    `;
    container.appendChild(confetti);
  }

  // Inject keyframe if not exists
  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Remove after animation
  setTimeout(() => {
    if (container) container.innerHTML = '';
  }, 3500);
}

// ─── State Machine Logic ─────────────────────────────────────

function advanceStage(newStage) {
  clearTimers();
  sessionState.stage = newStage;

  if (newStage === 'WARMUP' || newStage === 'COOLDOWN') {
    sessionState.currentExerciseIndex = 0;
  }
  if (newStage === 'MAIN_WORKOUT') {
    sessionState.currentExerciseIndex = 0;
    sessionState.currentSet = 1;
    sessionState.currentRound = 1;
    sessionState.currentGroupIndex = 0;
    sessionState.startTime = sessionState.startTime || Date.now();
  }

  renderCurrentStage();
}

async function renderCurrentStage() {
  const app = document.getElementById('app');
  if (!app) return;

  let html = '';

  switch (sessionState.stage) {
    case 'PRE_WORKOUT':
      html = renderPreWorkout();
      break;
    case 'WARMUP':
      html = renderWarmup();
      break;
    case 'MAIN_WORKOUT':
      html = renderMainWorkout();
      break;
    case 'COOLDOWN':
      sessionState.currentExerciseIndex = sessionState.stage === 'COOLDOWN' ? sessionState.currentExerciseIndex : 0;
      html = renderCooldown();
      break;
    case 'COMPLETE':
      html = await renderComplete();
      break;
  }

  if (html) {
    app.innerHTML = html;
    const page = app.querySelector('.page');
    if (page) page.classList.add('animate-fadeIn');
    setupStageListeners();
  }
}

// ─── Phase-specific advance logic ────────────────────────────

function advancePhase1() {
  const exercises = currentPhase.exercises;
  const exercise = exercises[sessionState.currentExerciseIndex];

  if (sessionState.currentSet < exercise.sets) {
    // More sets remaining — rest then next set
    sessionState.currentSet++;
    sessionState.isResting = true;
    renderCurrentStage();
    startRestCountdown(exercise.rest);
  } else {
    // All sets done — log exercise and move to next
    sessionState.exerciseLog.push({
      exerciseId: exercise.id,
      name: exercise.name,
      setsCompleted: exercise.sets,
      repsPerSet: exercise.reps,
    });
    sessionState.currentSet = 1;
    sessionState.currentExerciseIndex++;

    if (sessionState.currentExerciseIndex >= exercises.length) {
      advanceStage('COOLDOWN');
    } else {
      renderCurrentStage();
    }
  }
}

function advancePhase2() {
  const groups = currentPhase.exerciseGroups;
  const group = groups[sessionState.currentGroupIndex];

  if (group.type === 'finisher') {
    sessionState.exerciseLog.push({
      exerciseId: group.exercises[0].id,
      name: group.exercises[0].name,
      setsCompleted: 1,
      repsPerSet: sessionState.maxRepsCount,
    });
    advanceStage('COOLDOWN');
    return;
  }

  const exercises = group.exercises;
  const exIdx = sessionState.currentExerciseIndex;

  if (exIdx < exercises.length - 1) {
    // Next exercise in superset
    sessionState.currentExerciseIndex++;
    renderCurrentStage();
  } else {
    // Completed both exercises in superset
    exercises.forEach(ex => {
      sessionState.exerciseLog.push({
        exerciseId: ex.id,
        name: ex.name,
        setsCompleted: 1,
        repsPerSet: ex.reps,
      });
    });

    if (sessionState.currentRound < group.rounds) {
      // More rounds — rest then restart superset
      sessionState.currentRound++;
      sessionState.currentExerciseIndex = 0;
      sessionState.isResting = true;
      renderCurrentStage();
      startRestCountdown(group.rest);
    } else {
      // Move to next group
      sessionState.currentGroupIndex++;
      sessionState.currentRound = 1;
      sessionState.currentExerciseIndex = 0;

      if (sessionState.currentGroupIndex >= groups.length) {
        advanceStage('COOLDOWN');
      } else {
        renderCurrentStage();
      }
    }
  }
}

function advancePhase3() {
  const circuit = currentPhase.circuit;
  const exercises = circuit.exercises;
  const idx = sessionState.currentExerciseIndex;

  // Log exercise
  const exercise = exercises[idx];
  sessionState.exerciseLog.push({
    exerciseId: exercise.id,
    name: exercise.name,
    setsCompleted: 1,
    repsPerSet: exercise.reps,
  });

  if (idx < exercises.length - 1) {
    // Next exercise in circuit (no rest)
    sessionState.currentExerciseIndex++;
    renderCurrentStage();
  } else {
    // End of round
    if (sessionState.currentRound < circuit.rounds.max) {
      sessionState.currentRound++;
      sessionState.currentExerciseIndex = 0;
      sessionState.isResting = true;
      renderCurrentStage();
      startRestCountdown(circuit.restBetweenRounds);
    } else {
      advanceStage('COOLDOWN');
    }
  }
}

// ─── Rest Countdown ──────────────────────────────────────────

function startRestCountdown(seconds) {
  sessionState.restTimeRemaining = seconds;
  const totalSeconds = seconds;

  sessionState.timerInterval = setInterval(() => {
    sessionState.restTimeRemaining--;

    const display = document.getElementById('rest-timer-display');
    const progressFill = document.getElementById('rest-progress-fill');

    if (display) display.textContent = formatTime(sessionState.restTimeRemaining);
    if (progressFill) progressFill.style.width = `${(sessionState.restTimeRemaining / totalSeconds) * 100}%`;

    if (sessionState.restTimeRemaining <= 0) {
      clearInterval(sessionState.timerInterval);
      sessionState.timerInterval = null;
      sessionState.isResting = false;
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(200);
      renderCurrentStage();
    }
  }, 1000);
}

// ─── Timer for Exercises ─────────────────────────────────────

function startExerciseTimer(seconds, displayId, btnId) {
  let remaining = seconds;
  const btn = document.getElementById(btnId);
  const display = document.getElementById(displayId);

  if (btn) btn.textContent = '⏸ Pause';
  let isPaused = false;

  sessionState.exerciseTimerInterval = setInterval(() => {
    if (isPaused) return;
    remaining--;
    if (display) display.textContent = formatTime(remaining);

    if (remaining <= 0) {
      clearInterval(sessionState.exerciseTimerInterval);
      sessionState.exerciseTimerInterval = null;
      if (display) display.textContent = '00:00';
      if (display) display.style.color = 'var(--color-accent)';
      if (btn) btn.textContent = '✓ Done';
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }, 1000);

  if (btn) {
    btn.onclick = () => {
      if (remaining <= 0) return;
      isPaused = !isPaused;
      btn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
    };
  }
}

// ─── Event Listeners per Stage ───────────────────────────────

function setupStageListeners() {
  const stage = sessionState.stage;

  if (stage === 'PRE_WORKOUT') {
    const beginBtn = document.getElementById('begin-warmup-btn');
    if (beginBtn) {
      beginBtn.addEventListener('click', () => {
        sessionState.startTime = Date.now();
        advanceStage('WARMUP');
      });
    }
    const cancelBtn = document.getElementById('cancel-session-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        clearTimers();
        window.location.hash = '/';
      });
    }
  }

  if (stage === 'WARMUP') {
    const nextBtn = document.getElementById('warmup-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearTimers();
        const warmup = PHOENIX_PROTOCOL.warmup;
        if (sessionState.currentExerciseIndex < warmup.exercises.length - 1) {
          sessionState.currentExerciseIndex++;
          renderCurrentStage();
        } else {
          advanceStage('MAIN_WORKOUT');
        }
      });
    }

    const prevBtn = document.getElementById('warmup-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        clearTimers();
        if (sessionState.currentExerciseIndex > 0) {
          sessionState.currentExerciseIndex--;
          renderCurrentStage();
        }
      });
    }

    const timerBtn = document.getElementById('warmup-timer-btn');
    if (timerBtn) {
      const exercise = PHOENIX_PROTOCOL.warmup.exercises[sessionState.currentExerciseIndex];
      timerBtn.addEventListener('click', () => {
        startExerciseTimer(exercise.duration, 'warmup-timer-display', 'warmup-timer-btn');
      });
    }
  }

  if (stage === 'MAIN_WORKOUT') {
    const completeBtn = document.getElementById('complete-set-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        clearTimers();
        if (currentPhase.id === 1) advancePhase1();
        else if (currentPhase.id === 2) advancePhase2();
        else if (currentPhase.id === 3) advancePhase3();
      });
    }

    const skipBtn = document.getElementById('skip-exercise-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        clearTimers();
        sessionState.currentSet = 1;
        sessionState.currentExerciseIndex++;
        if (sessionState.currentExerciseIndex >= currentPhase.exercises.length) {
          advanceStage('COOLDOWN');
        } else {
          renderCurrentStage();
        }
      });
    }

    const skipRestBtn = document.getElementById('skip-rest-btn');
    if (skipRestBtn) {
      skipRestBtn.addEventListener('click', () => {
        clearTimers();
        sessionState.isResting = false;
        renderCurrentStage();
      });
    }

    const exerciseTimerBtn = document.getElementById('exercise-timer-btn');
    if (exerciseTimerBtn) {
      exerciseTimerBtn.addEventListener('click', () => {
        let dur = 30;
        if (currentPhase.id === 1) {
          const ex = currentPhase.exercises[sessionState.currentExerciseIndex];
          dur = ex.durationMin || parseInt(ex.duration) || 30;
        } else if (currentPhase.id === 3) {
          const ex = currentPhase.circuit.exercises[sessionState.currentExerciseIndex];
          dur = ex.durationMin || parseInt(ex.duration) || 30;
        }
        startExerciseTimer(dur, 'exercise-timer-display', 'exercise-timer-btn');
      });
    }

    // Finisher rep counter
    const plusBtn = document.getElementById('reps-plus-btn');
    const minusBtn = document.getElementById('reps-minus-btn');
    const repsDisplay = document.getElementById('max-reps-display');
    const finisherDoneBtn = document.getElementById('finisher-done-btn');

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        sessionState.maxRepsCount++;
        if (repsDisplay) repsDisplay.textContent = sessionState.maxRepsCount;
        if (navigator.vibrate) navigator.vibrate(30);
      });
    }
    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        if (sessionState.maxRepsCount > 0) sessionState.maxRepsCount--;
        if (repsDisplay) repsDisplay.textContent = sessionState.maxRepsCount;
      });
    }
    if (finisherDoneBtn) {
      finisherDoneBtn.addEventListener('click', () => {
        advancePhase2();
      });
    }
  }

  if (stage === 'COOLDOWN') {
    const nextBtn = document.getElementById('cooldown-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        clearTimers();
        const cooldowns = currentPhase.cooldown;
        if (sessionState.currentExerciseIndex < cooldowns.length - 1) {
          sessionState.currentExerciseIndex++;
          renderCurrentStage();
        } else {
          advanceStage('COMPLETE');
        }
      });
    }

    const timerBtn = document.getElementById('cooldown-timer-btn');
    if (timerBtn) {
      const exercise = currentPhase.cooldown[sessionState.currentExerciseIndex];
      timerBtn.addEventListener('click', () => {
        startExerciseTimer(exercise.duration, 'cooldown-timer-display', 'cooldown-timer-btn');
      });
    }
  }

  if (stage === 'COMPLETE') {
    spawnConfetti();

    const backBtn = document.getElementById('back-to-dashboard-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '/';
      });
    }
  }
}

// ─── Page Export ──────────────────────────────────────────────

export default async function SessionPage(params) {
  const phaseId = parseInt(params.phaseId) || 1;
  currentPhase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId) || PHOENIX_PROTOCOL.phases[0];

  // Reset session state
  sessionState = {
    phaseId,
    stage: 'PRE_WORKOUT',
    currentExerciseIndex: 0,
    currentSet: 1,
    currentRound: 1,
    currentGroupIndex: 0,
    exerciseLog: [],
    startTime: null,
    endTime: null,
    isResting: false,
    restTimeRemaining: 0,
    timerInterval: null,
    exerciseTimerInterval: null,
    maxRepsCount: 0,
  };

  return renderPreWorkout();
}

export function setup() {
  setupStageListeners();
}
