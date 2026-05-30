/**
 * dashboard.js — Home Screen (route: #/)
 *
 * The primary landing screen showing streak, today's status,
 * week calendar, phase progress, and golden rules.
 */

import { getUserProfile, getSessionByDate, isPhaseUnlocked } from '../db/database.js';
import { calculateStreak, getTodayStatus, isWorkoutDay } from '../db/streak-engine.js';
import PHOENIX_PROTOCOL from '../data/workouts.js';

// ─── Helpers ─────────────────────────────────────────────────

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getPhaseIcon(phaseId) {
  const icons = {
    1: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>`,
    2: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    3: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };
  return icons[phaseId] || icons[1];
}

function getRuleIcon(type) {
  const icons = {
    form: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    rest: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/></svg>`,
    hydration: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
  };
  return icons[type] || icons.form;
}

// ─── Streak Display ──────────────────────────────────────────

function createStreakDisplay(streak) {
  const flameClass = streak.isStreakActive ? 'animate-streakFlame' : '';
  const streakColor = streak.isStreakActive ? 'var(--color-primary)' : 'var(--color-text-dim)';

  return `
    <div class="card card-fire" style="text-align: center;">
      <div style="font-size: 48px; ${flameClass ? `animation: streakFlame 1.2s ease-in-out infinite;` : ''}" aria-label="Fire streak">🔥</div>
      <div class="heading-xl" style="color: ${streakColor}; margin-top: 4px;">
        ${streak.currentStreak}
      </div>
      <div class="text-sm text-muted" style="margin-top: 2px;">
        day streak
      </div>
      <div class="flex-center gap-lg" style="margin-top: 12px;">
        <div class="text-center">
          <div class="heading-sm text-primary">${streak.bestStreak}</div>
          <div class="text-xs text-muted">Best</div>
        </div>
        <div style="width: 1px; height: 28px; background: rgba(255,255,255,0.1);"></div>
        <div class="text-center">
          <div class="heading-sm" style="color: ${streak.missedDays > 0 ? 'var(--color-warning)' : 'var(--color-accent)'};">${streak.missedDays}</div>
          <div class="text-xs text-muted">Missed</div>
        </div>
      </div>
    </div>
  `;
}

// ─── Week Calendar ───────────────────────────────────────────

async function createWeekCalendar(phaseId) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Go back to Monday

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let daysHtml = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = toDateString(date);
    const isToday = toDateString(today) === dateStr;
    const isWorkout = isWorkoutDay(date, phaseId);
    const session = await getSessionByDate(dateStr);
    const isCompleted = !!session;
    const isPast = date < new Date(toDateString(today));

    let dotColor = 'var(--color-surface-2)';
    let borderStyle = '';
    let innerContent = dayNames[i];

    if (isCompleted) {
      dotColor = 'var(--color-accent)';
      innerContent = '✓';
    } else if (isToday && isWorkout) {
      dotColor = 'var(--color-primary)';
      borderStyle = 'box-shadow: 0 0 0 2px var(--color-primary);';
    } else if (isToday) {
      borderStyle = 'box-shadow: 0 0 0 2px var(--color-text-dim);';
    } else if (isPast && isWorkout) {
      dotColor = 'var(--color-danger)';
      innerContent = '✗';
    }

    daysHtml += `
      <div style="
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      ">
        <span class="text-xs text-muted">${dayNames[i]}</span>
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: ${dotColor};
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 600;
          color: #fff;
          ${borderStyle}
          transition: all 200ms ease;
        ">${isCompleted ? '✓' : isPast && isWorkout && !isCompleted ? '✗' : date.getDate()}</div>
        ${isWorkout ? `<div style="width: 4px; height: 4px; border-radius: 50%; background: var(--color-primary);"></div>` : `<div style="width: 4px; height: 4px;"></div>`}
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="flex-between mb-sm">
        <span class="heading-sm">This Week</span>
        <span class="text-xs text-muted">${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(monday.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      <div class="flex-between" style="padding: 4px 0;">
        ${daysHtml}
      </div>
      <div class="flex-center gap-md mt-sm">
        <div class="flex items-center gap-xs">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent);"></div>
          <span class="text-xs text-muted">Done</span>
        </div>
        <div class="flex items-center gap-xs">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary);"></div>
          <span class="text-xs text-muted">Workout</span>
        </div>
        <div class="flex items-center gap-xs">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-surface-2);"></div>
          <span class="text-xs text-muted">Rest</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Phase Progress Cards ────────────────────────────────────

async function createPhaseProgress(currentPhaseId) {
  const phases = PHOENIX_PROTOCOL.phases;
  let html = '<div class="flex-col gap-md">';

  for (const phase of phases) {
    const unlocked = await isPhaseUnlocked(phase.id);
    const isCurrent = phase.id === currentPhaseId;
    const isLocked = !unlocked;

    const progressPercent = isCurrent ? 35 : (unlocked && phase.id < currentPhaseId ? 100 : 0);

    if (isLocked) {
      html += `
        <div class="card" style="opacity: 0.5; position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2;">
            <div style="background: rgba(0,0,0,0.6); border-radius: var(--radius-md); padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span class="text-sm text-muted">Complete Phase ${phase.id - 1} to unlock</span>
            </div>
          </div>
          <div class="flex items-center gap-md">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-surface-2); display: flex; align-items: center; justify-content: center; color: var(--color-text-dim);">
              ${getPhaseIcon(phase.id)}
            </div>
            <div class="flex-1">
              <div class="heading-sm">${phase.name}</div>
              <div class="text-xs text-muted">${phase.subtitle} · Weeks ${phase.weeks.start}-${phase.weeks.end}</div>
            </div>
          </div>
        </div>
      `;
    } else {
      const borderClass = isCurrent ? 'card-fire' : 'card';
      html += `
        <a href="#/phase/${phase.id}" class="${borderClass}" style="display: block; cursor: pointer;">
          <div class="flex items-center gap-md">
            <div style="
              width: 44px; height: 44px; border-radius: var(--radius-md);
              background: ${isCurrent ? 'var(--color-fire-gradient)' : 'var(--color-surface-2)'};
              background: ${isCurrent ? 'linear-gradient(135deg, #F97316, #DC2626)' : 'var(--color-surface-2)'};
              display: flex; align-items: center; justify-content: center;
              color: ${isCurrent ? '#fff' : 'var(--color-primary)'};
            ">
              ${getPhaseIcon(phase.id)}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-sm">
                <span class="heading-sm">${phase.name}</span>
                ${isCurrent ? '<span class="badge badge-primary">Current</span>' : '<span class="badge badge-accent">Completed</span>'}
              </div>
              <div class="text-xs text-muted mt-xs">${phase.subtitle} · ${phase.method.name}</div>
              <div class="progress-bar mt-sm" style="height: 4px;">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;${isCurrent ? ' background: var(--color-fire-gradient);' : ''}"></div>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
      `;
    }
  }

  html += '</div>';
  return html;
}

// ─── Golden Rules ────────────────────────────────────────────

function createGoldenRules() {
  const rules = PHOENIX_PROTOCOL.goldenRules;

  const rulesHtml = rules.map(rule => `
    <div class="flex items-start gap-md" style="padding: 8px 0;">
      <div style="width: 36px; height: 36px; min-width: 36px; border-radius: var(--radius-sm); background: rgba(249, 115, 22, 0.1); display: flex; align-items: center; justify-content: center;">
        ${getRuleIcon(rule.icon)}
      </div>
      <div>
        <div class="text-sm" style="font-weight: 600;">${rule.title}</div>
        <div class="text-xs text-muted" style="margin-top: 2px;">${rule.description}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="card" id="golden-rules-card">
      <button class="flex-between w-full" id="golden-rules-toggle" style="background: none; border: none; padding: 0; cursor: pointer; min-height: 44px;">
        <span class="heading-sm">📜 Golden Rules</span>
        <svg id="golden-rules-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 200ms ease;">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div id="golden-rules-content" style="display: none; margin-top: 12px;">
        ${rulesHtml}
      </div>
    </div>
  `;
}

// ─── Today's Status Card ─────────────────────────────────────

async function createTodayCard(profile, todaySession) {
  const phaseId = profile.currentPhase || 1;
  const phase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId) || PHOENIX_PROTOCOL.phases[0];
  const status = getTodayStatus(phaseId);

  if (todaySession) {
    // Already completed today
    return `
      <div class="card" style="border: 1px solid rgba(34, 197, 94, 0.3); background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02));">
        <div class="flex-center" style="gap: 8px; margin-bottom: 12px;">
          <div style="font-size: 32px;">✅</div>
          <span class="heading-md" style="color: var(--color-accent);">Completed!</span>
        </div>
        <div class="text-center text-sm text-muted">
          Great work today! You crushed ${phase.name}.
        </div>
        ${todaySession.duration ? `
          <div class="flex-center gap-lg mt-md">
            <div class="text-center">
              <div class="text-sm text-accent" style="font-weight: 600;">${formatDuration(todaySession.duration)}</div>
              <div class="text-xs text-muted">Duration</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-accent" style="font-weight: 600;">${todaySession.exercises?.length || '—'}</div>
              <div class="text-xs text-muted">Exercises</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  if (status === 'workout') {
    return `
      <div class="card-fire" style="padding: var(--spacing-lg);">
        <div class="text-center">
          <div class="badge badge-primary mb-sm">${phase.name} · ${phase.method.name}</div>
          <div class="heading-md mb-md" style="margin-top: 8px;">Time to Train 💪</div>
          <button
            class="btn btn-fire btn-lg btn-full animate-fireGlow"
            id="start-workout-btn"
            style="font-size: 1.125rem; padding: 18px 32px;"
          >
            🔥 START TODAY'S WORKOUT
          </button>
          <div class="text-xs text-muted" style="margin-top: 12px;">
            ${phase.schedule.label} · ~${phase.id === 1 ? '25' : phase.id === 2 ? '35' : '40'} min
          </div>
        </div>
      </div>
    `;
  }

  // Rest day
  return `
    <div class="card" style="background: linear-gradient(135deg, rgba(22, 33, 62, 0.8), rgba(26, 26, 46, 0.8));">
      <div class="text-center">
        <div style="font-size: 36px; margin-bottom: 8px;">🧘</div>
        <div class="heading-md">Rest Day</div>
        <div class="text-sm text-muted" style="margin-top: 4px;">
          Recovery is when muscles grow. Stay hydrated and get good sleep.
        </div>
        <a href="#/walk-run" class="btn btn-outline" style="margin-top: 16px; display: inline-flex;">
          🚶 Log Walk / Run
        </a>
      </div>
    </div>
  `;
}

// ─── In-App Reminder Banner ──────────────────────────────────

function createReminderBanner(profile) {
  if (!profile.reminderEnabled || !profile.reminderTime) return '';

  const now = new Date();
  const [hours, minutes] = profile.reminderTime.split(':').map(Number);
  const workoutTime = new Date(now);
  workoutTime.setHours(hours, minutes, 0, 0);

  const diffMs = workoutTime.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  // Show banner if workout is within 2 hours and hasn't passed
  if (diffMin > 0 && diffMin <= 120) {
    const timeStr = diffMin >= 60
      ? `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
      : `${diffMin} min`;

    return `
      <div class="card-compact" style="
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
        border: 1px solid rgba(249, 115, 22, 0.2);
        border-radius: var(--radius-md);
        padding: 12px 16px;
        display: flex; align-items: center; gap: 10px;
      ">
        <span style="font-size: 20px;">⏰</span>
        <div class="flex-1">
          <div class="text-sm" style="font-weight: 600; color: var(--color-primary);">Workout in ${timeStr}</div>
          <div class="text-xs text-muted">Scheduled for ${profile.reminderTime}</div>
        </div>
      </div>
    `;
  }

  return '';
}

// ─── Page Export ──────────────────────────────────────────────

export default async function DashboardPage() {
  const profile = await getUserProfile();
  const streak = await calculateStreak();
  const todayStr = toDateString(new Date());
  const todaySession = await getSessionByDate(todayStr);
  const phaseId = profile.currentPhase || 1;

  const weekCalendar = await createWeekCalendar(phaseId);
  const phaseProgress = await createPhaseProgress(phaseId);
  const todayCard = await createTodayCard(profile, todaySession);
  const reminderBanner = createReminderBanner(profile);

  return `
    <div class="page">
      <div class="container">
        <!-- Header -->
        <div style="text-align: center; padding: 24px 0 8px;">
          <h1 class="heading-xl text-fire">PHOENIX PROTOCOL</h1>
          <p class="text-sm text-muted" style="margin-top: 4px; letter-spacing: 0.1em; text-transform: uppercase;">Rise from the Ashes</p>
        </div>

        <!-- Streak Display -->
        <div class="mt-md animate-slideUp">
          ${createStreakDisplay(streak)}
        </div>

        <!-- Reminder Banner -->
        ${reminderBanner ? `<div class="mt-md">${reminderBanner}</div>` : ''}

        <!-- Today's Status -->
        <div class="mt-lg animate-slideUp" style="animation-delay: 50ms;">
          ${todayCard}
        </div>

        <!-- Week Calendar -->
        <div class="mt-lg animate-slideUp" style="animation-delay: 100ms;">
          ${weekCalendar}
        </div>

        <!-- Phase Progress -->
        <div class="mt-lg animate-slideUp" style="animation-delay: 150ms;">
          <h2 class="heading-sm mb-md" style="color: var(--color-text-muted);">Program Progress</h2>
          ${phaseProgress}
        </div>

        <!-- Golden Rules -->
        <div class="mt-lg mb-xl animate-slideUp" style="animation-delay: 200ms;">
          ${createGoldenRules()}
        </div>
      </div>
    </div>
  `;
}

export function setup() {
  // Start Workout button
  const startBtn = document.getElementById('start-workout-btn');
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      const profile = await getUserProfile();
      window.location.hash = `/session/${profile.currentPhase || 1}`;
    });
  }

  // Golden Rules toggle
  const toggle = document.getElementById('golden-rules-toggle');
  const content = document.getElementById('golden-rules-content');
  const chevron = document.getElementById('golden-rules-chevron');
  if (toggle && content && chevron) {
    toggle.addEventListener('click', () => {
      const isOpen = content.style.display !== 'none';
      content.style.display = isOpen ? 'none' : 'block';
      chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  }
}
