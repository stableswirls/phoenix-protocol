/**
 * history.js — History & Stats (route: #/history)
 *
 * Three-tab view: Workouts, Walk/Run, and Stats.
 * Shows session history and aggregate statistics.
 */

import { getAllSessions, getWalkRunSessions, getTotalStats, getUserProfile } from '../db/database.js';
import { calculateStreak } from '../db/streak-engine.js';
import PHOENIX_PROTOCOL from '../data/workouts.js';

// ─── Module State ────────────────────────────────────────────

let activeTab = 'workouts';

// ─── Helpers ─────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return '—';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeekKey(dateStr) {
  const date = new Date(dateStr);
  const monday = new Date(date);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

function getPhaseNameById(phaseId) {
  const phase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId);
  return phase ? phase.name : `Phase ${phaseId}`;
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Tab: Workouts ───────────────────────────────────────────

function renderWorkoutsTab(sessions) {
  if (sessions.length === 0) {
    return `
      <div class="card text-center" style="padding: 48px 24px;">
        <div style="font-size: 40px; margin-bottom: 12px;">💪</div>
        <div class="heading-sm">No Workouts Yet</div>
        <div class="text-sm text-muted mt-sm">Complete your first workout to see it here.</div>
        <a href="#/session/1" class="btn btn-primary mt-lg">Start First Workout</a>
      </div>
    `;
  }

  // Group sessions by week
  const grouped = {};
  sessions.forEach(s => {
    const weekKey = getWeekKey(s.date);
    if (!grouped[weekKey]) grouped[weekKey] = [];
    grouped[weekKey].push(s);
  });

  const weeks = Object.keys(grouped).sort().reverse();

  return weeks.map(weekKey => {
    const weekSessions = grouped[weekKey];
    const weekLabel = `Week of ${formatDateShort(weekKey)}`;

    return `
      <div class="mb-lg">
        <div class="flex-between mb-sm">
          <span class="text-xs text-muted text-uppercase">${weekLabel}</span>
          <span class="text-xs text-muted">${weekSessions.length} sessions</span>
        </div>
        ${weekSessions.map(s => `
          <div class="card card-compact mb-sm">
            <div class="flex-between">
              <div>
                <div class="flex items-center gap-sm">
                  <span class="text-sm" style="font-weight: 600;">${getPhaseNameById(s.phaseId)}</span>
                  <span class="badge badge-primary" style="font-size: 0.6rem;">Phase ${s.phaseId}</span>
                </div>
                <div class="text-xs text-muted mt-xs">${formatDate(s.date)}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-primary" style="font-weight: 600;">${formatDuration(s.duration)}</div>
                <div class="text-xs text-muted">${s.exercises?.length || 0} exercises</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// ─── Tab: Walk/Run ───────────────────────────────────────────

function renderWalkRunTab(sessions) {
  if (sessions.length === 0) {
    return `
      <div class="card text-center" style="padding: 48px 24px;">
        <div style="font-size: 40px; margin-bottom: 12px;">🚶</div>
        <div class="heading-sm">No Walk/Run Sessions</div>
        <div class="text-sm text-muted mt-sm">Log a walk or run to track your cardio.</div>
        <a href="#/walk-run" class="btn btn-primary mt-lg">Log Session</a>
      </div>
    `;
  }

  return sessions.map(s => `
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
          <div class="text-sm text-primary" style="font-weight: 600;">${formatDuration(s.duration)}</div>
          <div class="text-xs text-muted">
            ${s.distance ? `${s.distance} km` : ''}
            ${s.pace ? ` · ${s.pace} /km` : ''}
          </div>
        </div>
      </div>
      ${s.notes ? `
        <div class="text-xs text-muted mt-sm" style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; font-style: italic;">
          "${s.notes}"
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ─── Tab: Stats ──────────────────────────────────────────────

function renderStatsTab(stats, streak, sessions) {
  // Calendar heatmap - last 30 days
  const sessionDates = new Set(sessions.map(s => s.date).filter(Boolean));
  const today = new Date();
  let heatmapHtml = '';

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = toDateString(date);
    const hasSession = sessionDates.has(dateStr);
    const isToday = i === 0;

    heatmapHtml += `
      <div style="
        width: 14px; height: 14px; border-radius: 3px;
        background: ${hasSession ? 'var(--color-accent)' : 'var(--color-surface-2)'};
        ${isToday ? 'box-shadow: 0 0 0 1px var(--color-primary);' : ''}
      " title="${dateStr}${hasSession ? ' ✓' : ''}"></div>
    `;
  }

  const workoutsPerWeek = stats.totalSessions > 0
    ? (stats.totalSessions / Math.max(1, Math.ceil((Date.now() - new Date(sessions[sessions.length - 1]?.date || Date.now()).getTime()) / (7 * 86400000)))).toFixed(1)
    : '0';

  const phasesCompleted = stats.currentPhase > 1 ? stats.currentPhase - 1 : 0;

  return `
    <!-- Summary Cards -->
    <div class="grid-2 gap-md">
      <div class="card text-center">
        <div class="heading-lg text-primary">${stats.totalSessions}</div>
        <div class="text-xs text-muted mt-xs">Total Workouts</div>
      </div>
      <div class="card text-center">
        <div class="heading-lg text-accent">${formatDuration(stats.totalDuration)}</div>
        <div class="text-xs text-muted mt-xs">Total Time</div>
      </div>
    </div>

    <div class="grid-2 gap-md mt-md">
      <div class="card text-center">
        <div class="heading-lg" style="color: var(--color-primary);">🔥 ${streak.currentStreak}</div>
        <div class="text-xs text-muted mt-xs">Current Streak</div>
      </div>
      <div class="card text-center">
        <div class="heading-lg" style="color: var(--color-warning);">⭐ ${streak.bestStreak}</div>
        <div class="text-xs text-muted mt-xs">Best Streak</div>
      </div>
    </div>

    <div class="grid-2 gap-md mt-md">
      <div class="card text-center">
        <div class="heading-lg text-primary">${phasesCompleted}/3</div>
        <div class="text-xs text-muted mt-xs">Phases Completed</div>
      </div>
      <div class="card text-center">
        <div class="heading-lg text-primary">${workoutsPerWeek}</div>
        <div class="text-xs text-muted mt-xs">Avg / Week</div>
      </div>
    </div>

    ${stats.totalWalkRunSessions > 0 ? `
      <div class="card mt-md">
        <div class="text-xs text-muted text-uppercase mb-sm">Walk / Run Totals</div>
        <div class="flex-between">
          <div>
            <div class="heading-sm text-primary">${stats.totalWalkRunSessions}</div>
            <div class="text-xs text-muted">Sessions</div>
          </div>
          <div class="text-center">
            <div class="heading-sm text-primary">${formatDuration(stats.totalWalkRunDuration)}</div>
            <div class="text-xs text-muted">Duration</div>
          </div>
          <div class="text-right">
            <div class="heading-sm text-primary">${(stats.totalWalkRunDistance || 0).toFixed(1)} km</div>
            <div class="text-xs text-muted">Distance</div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Calendar Heatmap -->
    <div class="card mt-lg">
      <div class="flex-between mb-md">
        <span class="text-sm" style="font-weight: 600;">Last 30 Days</span>
        <span class="text-xs text-muted">${sessionDates.size} active</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 3px;">
        ${heatmapHtml}
      </div>
      <div class="flex-center gap-md mt-md">
        <div class="flex items-center gap-xs">
          <div style="width: 10px; height: 10px; border-radius: 2px; background: var(--color-accent);"></div>
          <span class="text-xs text-muted">Workout</span>
        </div>
        <div class="flex items-center gap-xs">
          <div style="width: 10px; height: 10px; border-radius: 2px; background: var(--color-surface-2);"></div>
          <span class="text-xs text-muted">No activity</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Page Export ──────────────────────────────────────────────

export default async function HistoryPage() {
  const [sessions, walkRunSessions, stats, streak] = await Promise.all([
    getAllSessions(),
    getWalkRunSessions(),
    getTotalStats(),
    calculateStreak(),
  ]);

  const workoutsContent = renderWorkoutsTab(sessions);
  const walkRunContent = renderWalkRunTab(walkRunSessions);
  const statsContent = renderStatsTab(stats, streak, sessions);

  return `
    <div class="page">
      <div class="container">
        <h1 class="heading-lg" style="padding: 16px 0 8px;">History</h1>

        <!-- Tab Toggle -->
        <div style="
          display: flex; background: var(--color-surface);
          border-radius: var(--radius-md); padding: 4px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 24px;
        ">
          <button class="btn flex-1 history-tab" data-tab="workouts" style="
            padding: 10px; border-radius: var(--radius-sm); min-height: 44px; font-size: 0.875rem;
            ${activeTab === 'workouts' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
          ">Workouts</button>
          <button class="btn flex-1 history-tab" data-tab="walkrun" style="
            padding: 10px; border-radius: var(--radius-sm); min-height: 44px; font-size: 0.875rem;
            ${activeTab === 'walkrun' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
          ">Walk/Run</button>
          <button class="btn flex-1 history-tab" data-tab="stats" style="
            padding: 10px; border-radius: var(--radius-sm); min-height: 44px; font-size: 0.875rem;
            ${activeTab === 'stats' ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text-muted);'}
          ">Stats</button>
        </div>

        <!-- Tab Content -->
        <div id="tab-workouts" class="mb-xl" style="${activeTab !== 'workouts' ? 'display: none;' : ''}">
          ${workoutsContent}
        </div>

        <div id="tab-walkrun" class="mb-xl" style="${activeTab !== 'walkrun' ? 'display: none;' : ''}">
          ${walkRunContent}
        </div>

        <div id="tab-stats" class="mb-xl" style="${activeTab !== 'stats' ? 'display: none;' : ''}">
          ${statsContent}
        </div>
      </div>
    </div>
  `;
}

export function setup() {
  const tabs = document.querySelectorAll('.history-tab');
  const tabContents = {
    workouts: document.getElementById('tab-workouts'),
    walkrun: document.getElementById('tab-walkrun'),
    stats: document.getElementById('tab-stats'),
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      activeTab = targetTab;

      // Update tab buttons
      tabs.forEach(t => {
        if (t.dataset.tab === targetTab) {
          t.style.background = 'var(--color-primary)';
          t.style.color = '#fff';
        } else {
          t.style.background = 'none';
          t.style.color = 'var(--color-text-muted)';
        }
      });

      // Show/hide content
      Object.entries(tabContents).forEach(([key, el]) => {
        if (el) el.style.display = key === targetTab ? '' : 'none';
      });
    });
  });
}
