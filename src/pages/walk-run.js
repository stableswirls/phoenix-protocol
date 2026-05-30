/**
 * walk-run.js — Walk/Run Logger (route: #/walk-run)
 *
 * Clean page for logging walk/run sessions with a stopwatch,
 * distance input, pace calculation, and session history.
 */

import { saveWalkRunSession, getWalkRunSessions } from '../db/database.js';

// ─── Module State ────────────────────────────────────────────

let stopwatchState = {
  isRunning: false,
  startTime: null,
  elapsed: 0, // ms
  interval: null,
  type: 'walk', // 'walk' | 'run'
  unit: 'km',
};

// ─── Helpers ─────────────────────────────────────────────────

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatStopwatch(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatPace(durationMs, distanceKm) {
  if (!distanceKm || distanceKm <= 0) return '--:--';
  const totalMinutes = (durationMs / 1000) / 60;
  const paceMin = totalMinutes / distanceKm;
  const mins = Math.floor(paceMin);
  const secs = Math.round((paceMin - mins) * 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatSessionDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── Page Export ──────────────────────────────────────────────

export default async function WalkRunPage() {
  const recentSessions = await getWalkRunSessions();
  const last5 = recentSessions.slice(0, 5);

  const historyHtml = last5.length > 0 ? last5.map(s => `
    <div class="card card-compact mb-sm">
      <div class="flex-between">
        <div>
          <div class="flex items-center gap-sm">
            <span style="font-size: 16px;">${s.type === 'run' ? '🏃' : '🚶'}</span>
            <span class="text-sm" style="font-weight: 600;">${s.type === 'run' ? 'Run' : 'Walk'}</span>
          </div>
          <div class="text-xs text-muted mt-xs">${formatDate(s.date)}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-primary" style="font-weight: 600;">
            ${s.duration ? formatSessionDuration(s.duration) : '—'}
          </div>
          <div class="text-xs text-muted">
            ${s.distance ? `${s.distance} km` : ''}
            ${s.pace ? ` · ${s.pace} /km` : ''}
          </div>
        </div>
      </div>
      ${s.notes ? `<div class="text-xs text-muted mt-sm" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">"${s.notes}"</div>` : ''}
    </div>
  `).join('') : `
    <div class="card text-center" style="padding: 32px;">
      <div style="font-size: 32px; margin-bottom: 8px;">🚶</div>
      <div class="text-sm text-muted">No sessions yet. Log your first walk or run!</div>
    </div>
  `;

  return `
    <div class="page">
      <div class="container">
        <!-- Header -->
        <div style="padding: 16px 0;">
          <button class="btn btn-ghost" id="walkrun-back-btn" style="min-height: 44px; padding: 8px 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
        </div>

        <h1 class="heading-lg mb-lg">Walk / Run</h1>

        <!-- Type Toggle -->
        <div style="
          display: flex; background: var(--color-surface);
          border-radius: var(--radius-md); padding: 4px;
          border: 1px solid rgba(255,255,255,0.06);
        ">
          <button class="btn flex-1" id="toggle-walk" style="
            padding: 12px; border-radius: var(--radius-sm);
            ${stopwatchState.type === 'walk' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
            min-height: 44px;
          ">🚶 Walk</button>
          <button class="btn flex-1" id="toggle-run" style="
            padding: 12px; border-radius: var(--radius-sm);
            ${stopwatchState.type === 'run' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
            min-height: 44px;
          ">🏃 Run</button>
        </div>

        <!-- Stopwatch -->
        <div class="card mt-lg text-center">
          <div id="stopwatch-display" class="heading-xl" style="font-size: 4rem; font-variant-numeric: tabular-nums;">
            ${formatStopwatch(stopwatchState.elapsed)}
          </div>

          <div class="flex-center gap-md mt-lg">
            <button class="btn btn-primary btn-lg" id="stopwatch-start-btn" style="
              width: 72px; height: 72px; border-radius: 50%;
              font-size: 1.25rem; padding: 0;
              ${stopwatchState.isRunning ? 'display: none;' : ''}
            ">▶</button>

            <button class="btn btn-outline btn-lg" id="stopwatch-pause-btn" style="
              width: 72px; height: 72px; border-radius: 50%;
              font-size: 1.25rem; padding: 0;
              ${!stopwatchState.isRunning ? 'display: none;' : ''}
            ">⏸</button>

            <button class="btn btn-danger btn-lg" id="stopwatch-stop-btn" style="
              width: 56px; height: 56px; border-radius: 50%;
              font-size: 1rem; padding: 0;
              ${stopwatchState.elapsed === 0 ? 'display: none;' : ''}
            ">⏹</button>
          </div>
        </div>

        <!-- Distance Input -->
        <div class="card mt-md">
          <div class="flex-between mb-sm">
            <label class="label" style="margin-bottom: 0;">Distance</label>
            <div style="display: flex; background: var(--color-surface-2); border-radius: var(--radius-sm); padding: 2px;">
              <button class="btn text-xs" id="unit-km" style="
                padding: 4px 10px; border-radius: var(--radius-sm);
                ${stopwatchState.unit === 'km' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
                min-height: 28px;
              ">km</button>
              <button class="btn text-xs" id="unit-miles" style="
                padding: 4px 10px; border-radius: var(--radius-sm);
                ${stopwatchState.unit === 'miles' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
                min-height: 28px;
              ">miles</button>
            </div>
          </div>
          <input type="number" class="input" id="distance-input" placeholder="0.0" step="0.1" min="0" inputmode="decimal"
            style="font-size: 1.25rem; text-align: center;">

          <!-- Pace display -->
          <div class="flex-between mt-md" style="padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.06);">
            <span class="text-sm text-muted">Pace</span>
            <span class="text-sm text-primary" id="pace-display" style="font-weight: 600;">--:-- /${stopwatchState.unit}</span>
          </div>
        </div>

        <!-- Notes -->
        <div class="mt-md">
          <label class="label">How did you feel?</label>
          <textarea class="input" id="notes-input" rows="3" placeholder="Any notes about your session..."
            style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <!-- Save Button -->
        <button class="btn btn-accent btn-lg btn-full mt-lg" id="save-walkrun-btn" style="padding: 18px;">
          💾 Save Session
        </button>

        <!-- Recent History -->
        <div class="mt-xl mb-xl">
          <h3 class="heading-sm mb-md">Recent Sessions</h3>
          ${historyHtml}
        </div>
      </div>
    </div>
  `;
}

export function setup() {
  // Back button
  const backBtn = document.getElementById('walkrun-back-btn');
  if (backBtn) backBtn.addEventListener('click', () => window.history.back());

  // Type toggle
  const walkBtn = document.getElementById('toggle-walk');
  const runBtn = document.getElementById('toggle-run');
  if (walkBtn && runBtn) {
    walkBtn.addEventListener('click', () => {
      stopwatchState.type = 'walk';
      walkBtn.style.background = 'var(--color-primary)';
      walkBtn.style.color = '#fff';
      runBtn.style.background = 'none';
      runBtn.style.color = 'var(--color-text-muted)';
    });
    runBtn.addEventListener('click', () => {
      stopwatchState.type = 'run';
      runBtn.style.background = 'var(--color-primary)';
      runBtn.style.color = '#fff';
      walkBtn.style.background = 'none';
      walkBtn.style.color = 'var(--color-text-muted)';
    });
  }

  // Unit toggle
  const kmBtn = document.getElementById('unit-km');
  const milesBtn = document.getElementById('unit-miles');
  const paceDisplay = document.getElementById('pace-display');
  if (kmBtn && milesBtn) {
    kmBtn.addEventListener('click', () => {
      stopwatchState.unit = 'km';
      kmBtn.style.background = 'var(--color-primary)';
      kmBtn.style.color = '#fff';
      milesBtn.style.background = 'none';
      milesBtn.style.color = 'var(--color-text-muted)';
      if (paceDisplay) paceDisplay.textContent = `${formatPace(stopwatchState.elapsed, getDistanceInKm())} /km`;
    });
    milesBtn.addEventListener('click', () => {
      stopwatchState.unit = 'miles';
      milesBtn.style.background = 'var(--color-primary)';
      milesBtn.style.color = '#fff';
      kmBtn.style.background = 'none';
      kmBtn.style.color = 'var(--color-text-muted)';
      if (paceDisplay) paceDisplay.textContent = `${formatPace(stopwatchState.elapsed, getDistanceInKm())} /mi`;
    });
  }

  // Stopwatch controls
  const startBtn = document.getElementById('stopwatch-start-btn');
  const pauseBtn = document.getElementById('stopwatch-pause-btn');
  const stopBtn = document.getElementById('stopwatch-stop-btn');
  const display = document.getElementById('stopwatch-display');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      stopwatchState.isRunning = true;
      stopwatchState.startTime = Date.now() - stopwatchState.elapsed;

      startBtn.style.display = 'none';
      pauseBtn.style.display = '';
      stopBtn.style.display = '';

      stopwatchState.interval = setInterval(() => {
        stopwatchState.elapsed = Date.now() - stopwatchState.startTime;
        if (display) display.textContent = formatStopwatch(stopwatchState.elapsed);
        updatePace();
      }, 100);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      stopwatchState.isRunning = false;
      if (stopwatchState.interval) {
        clearInterval(stopwatchState.interval);
        stopwatchState.interval = null;
      }
      pauseBtn.style.display = 'none';
      startBtn.style.display = '';
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopwatchState.isRunning = false;
      if (stopwatchState.interval) {
        clearInterval(stopwatchState.interval);
        stopwatchState.interval = null;
      }
      // Don't reset elapsed — keep it for saving
      pauseBtn.style.display = 'none';
      startBtn.style.display = '';
    });
  }

  // Distance input -> pace update
  const distanceInput = document.getElementById('distance-input');
  if (distanceInput) {
    distanceInput.addEventListener('input', updatePace);
  }

  // Save button
  const saveBtn = document.getElementById('save-walkrun-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const durationSec = Math.round(stopwatchState.elapsed / 1000);
      const distanceVal = parseFloat(document.getElementById('distance-input')?.value) || 0;
      const distanceKm = stopwatchState.unit === 'miles' ? distanceVal * 1.60934 : distanceVal;
      const notes = document.getElementById('notes-input')?.value || '';
      const pace = formatPace(stopwatchState.elapsed, distanceKm);

      if (durationSec < 1 && distanceVal <= 0) {
        showToast('Please start the timer or enter a distance', 'warning');
        return;
      }

      try {
        await saveWalkRunSession({
          date: toDateString(new Date()),
          type: stopwatchState.type,
          duration: durationSec,
          distance: Math.round(distanceKm * 100) / 100,
          pace: distanceKm > 0 ? pace : null,
          notes,
        });

        showToast('Session saved! 🎉', 'success');

        // Reset
        stopwatchState.elapsed = 0;
        stopwatchState.isRunning = false;
        if (stopwatchState.interval) clearInterval(stopwatchState.interval);
        if (display) display.textContent = formatStopwatch(0);

        // Reload page after delay
        setTimeout(() => {
          window.location.hash = '/walk-run';
        }, 1200);
      } catch (e) {
        console.error('[WalkRun] Save failed:', e);
        showToast('Failed to save session', 'error');
      }
    });
  }
}

function getDistanceInKm() {
  const val = parseFloat(document.getElementById('distance-input')?.value) || 0;
  return stopwatchState.unit === 'miles' ? val * 1.60934 : val;
}

function updatePace() {
  const paceDisplay = document.getElementById('pace-display');
  if (!paceDisplay) return;
  const distKm = getDistanceInKm();
  const label = stopwatchState.unit === 'miles' ? '/mi' : '/km';
  const paceKm = formatPace(stopwatchState.elapsed, distKm);
  if (stopwatchState.unit === 'miles') {
    const distMi = parseFloat(document.getElementById('distance-input')?.value) || 0;
    paceDisplay.textContent = `${formatPace(stopwatchState.elapsed, distMi)} ${label}`;
  } else {
    paceDisplay.textContent = `${paceKm} ${label}`;
  }
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
