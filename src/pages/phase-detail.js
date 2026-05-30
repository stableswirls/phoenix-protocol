/**
 * phase-detail.js — Phase Overview (route: #/phase/:id)
 *
 * Detailed view of a single phase showing schedule, method,
 * exercises, cooldown, and graduation test.
 */

import { isPhaseUnlocked, getUserProfile, getSessionCountByPhase } from '../db/database.js';
import PHOENIX_PROTOCOL from '../data/workouts.js';

// ─── Helpers ─────────────────────────────────────────────────

function getExerciseIllustration(name) {
  return `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="12" r="8" stroke="#F97316" stroke-width="1.5"/><line x1="40" y1="20" x2="40" y2="38" stroke="#F97316" stroke-width="1.5"/><line x1="40" y1="38" x2="30" y2="55" stroke="#F97316" stroke-width="1.5"/><line x1="40" y1="38" x2="50" y2="55" stroke="#F97316" stroke-width="1.5"/><line x1="40" y1="25" x2="28" y2="32" stroke="#F97316" stroke-width="1.5"/><line x1="40" y1="25" x2="52" y2="32" stroke="#F97316" stroke-width="1.5"/></svg>`;
}

function getPhaseIcon(phaseId) {
  const icons = {
    1: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>`,
    2: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    3: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };
  return icons[phaseId] || icons[1];
}

function createExerciseCard(exercise, compact = false) {
  const target = exercise.type === 'timed'
    ? `${exercise.duration || exercise.durationMin}s`
    : exercise.type === 'max-reps'
      ? 'Max Reps'
      : `${exercise.reps} reps`;

  const sets = exercise.sets ? `${exercise.sets} sets` : '';
  const rest = exercise.rest ? `${exercise.rest}s rest` : '';
  const label = exercise.label ? `<span class="badge badge-primary" style="font-size: 0.65rem;">${exercise.label}</span>` : '';

  return `
    <div class="card${compact ? ' card-compact' : ''}" style="margin-bottom: 8px;">
      <div class="flex items-center gap-md">
        <div style="width: 48px; height: 48px; min-width: 48px; border-radius: var(--radius-sm); background: rgba(249, 115, 22, 0.08); display: flex; align-items: center; justify-content: center; overflow: hidden;">
          ${getExerciseIllustration(exercise.illustration)}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-xs">
            ${label}
            <span class="text-sm" style="font-weight: 600;">${exercise.name}</span>
          </div>
          <div class="flex items-center gap-sm mt-xs">
            <span class="text-xs text-primary" style="font-weight: 600;">${target}</span>
            ${sets ? `<span class="text-xs text-muted">· ${sets}</span>` : ''}
            ${rest ? `<span class="text-xs text-muted">· ${rest}</span>` : ''}
          </div>
          ${exercise.tips ? `<p class="text-xs text-muted mt-xs" style="line-height: 1.3;">${exercise.tips}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── Page Export ──────────────────────────────────────────────

export default async function PhaseDetailPage(params) {
  const phaseId = parseInt(params.id) || 1;
  const phase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId);

  if (!phase) {
    return `
      <div class="page">
        <div class="container" style="padding-top: 80px; text-align: center;">
          <h1 class="heading-lg text-danger">Phase Not Found</h1>
          <button class="btn btn-primary mt-lg" onclick="window.location.hash='/'">Go Home</button>
        </div>
      </div>
    `;
  }

  const unlocked = await isPhaseUnlocked(phaseId);
  const profile = await getUserProfile();
  const isCurrent = profile.currentPhase === phaseId;
  const sessionsCompleted = await getSessionCountByPhase(phaseId);
  const totalExpected = phase.schedule.workDaysPerWeek * phase.weeks.total;
  const progressPercent = Math.min(100, Math.round((sessionsCompleted / totalExpected) * 100));

  // Get exercises based on phase type
  let exerciseListHtml = '';
  if (phase.exercises) {
    // Phase 1: straight list
    exerciseListHtml = phase.exercises.map(ex => createExerciseCard(ex, true)).join('');
  } else if (phase.exerciseGroups) {
    // Phase 2: superset groups
    exerciseListHtml = phase.exerciseGroups.map(group => {
      if (group.type === 'finisher') {
        return `
          <div class="mb-md">
            <span class="badge badge-danger mb-sm">🔥 ${group.label}</span>
            ${group.exercises.map(ex => createExerciseCard(ex, true)).join('')}
          </div>
        `;
      }
      return `
        <div class="mb-md">
          <div class="flex items-center gap-sm mb-sm">
            <span class="badge badge-primary">${group.label}</span>
            <span class="text-xs text-muted">${group.rounds} rounds · ${group.rest}s rest</span>
          </div>
          ${group.exercises.map(ex => createExerciseCard(ex, true)).join('')}
        </div>
      `;
    }).join('');
  } else if (phase.circuit) {
    // Phase 3: circuit
    exerciseListHtml = `
      <div class="mb-sm flex items-center gap-sm">
        <span class="badge badge-primary">${phase.circuit.rounds.min}-${phase.circuit.rounds.max} rounds</span>
        <span class="text-xs text-muted">${phase.circuit.restBetweenRounds}s rest between rounds</span>
      </div>
      ${phase.circuit.exercises.map(ex => createExerciseCard(ex, true)).join('')}
    `;
  }

  return `
    <div class="page">
      <!-- Phase Banner -->
      <div style="
        background: ${unlocked ? 'var(--color-fire-gradient)' : 'var(--color-surface-2)'};
        padding: 32px 0 24px;
        text-align: center;
        position: relative;
        overflow: hidden;
      ">
        ${!unlocked ? `
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2;">
            <div class="flex-col items-center gap-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span class="text-muted">Complete Phase ${phaseId - 1} first</span>
            </div>
          </div>
        ` : ''}
        <div class="container">
          <div style="color: ${unlocked ? '#fff' : 'var(--color-text-dim)'};">
            ${getPhaseIcon(phaseId)}
          </div>
          <h1 class="heading-xl" style="color: #fff; margin-top: 8px;">${phase.name}</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 0.875rem; margin-top: 4px;">${phase.subtitle}</p>
        </div>
      </div>

      <div class="container">
        <!-- Back button -->
        <button class="btn btn-ghost mt-md" id="phase-back-btn" style="min-height: 44px; padding: 8px 0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <!-- Timeline -->
        <div class="card mt-md">
          <div class="flex-between">
            <div>
              <div class="text-xs text-muted text-uppercase">Timeline</div>
              <div class="heading-sm mt-xs">Weeks ${phase.weeks.start}–${phase.weeks.end}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-muted text-uppercase">Duration</div>
              <div class="heading-sm mt-xs">${phase.weeks.total} weeks</div>
            </div>
          </div>
          <div class="progress-bar mt-md">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="flex-between mt-xs">
            <span class="text-xs text-muted">${sessionsCompleted} sessions</span>
            <span class="text-xs text-muted">${progressPercent}%</span>
          </div>
        </div>

        <!-- Schedule -->
        <div class="card mt-md">
          <div class="text-xs text-muted text-uppercase mb-sm">Schedule</div>
          <div class="flex-between">
            <div>
              <span class="heading-sm text-primary">${phase.schedule.workDaysPerWeek}</span>
              <span class="text-sm text-muted"> workout days</span>
            </div>
            <div>
              <span class="heading-sm text-accent">${phase.schedule.restDaysPerWeek}</span>
              <span class="text-sm text-muted"> rest days</span>
            </div>
          </div>
          <div class="text-xs text-muted mt-sm">${phase.schedule.label}</div>
        </div>

        <!-- Method -->
        <div class="card-fire mt-md">
          <div class="text-xs text-muted text-uppercase mb-sm">Training Method</div>
          <div class="heading-sm">${phase.method.name}</div>
          <p class="text-sm text-muted mt-xs">${phase.method.description}</p>
          <div class="divider"></div>
          <div class="text-xs text-muted">
            <strong class="text-primary">Why?</strong> ${phase.method.why}
          </div>
        </div>

        <!-- Exercise List -->
        <div class="mt-lg">
          <h3 class="heading-sm mb-md">Exercises</h3>
          ${exerciseListHtml}
        </div>

        <!-- Cooldown -->
        <div class="mt-lg">
          <h3 class="heading-sm mb-md">Cooldown</h3>
          ${phase.cooldown.map(cd => `
            <div class="card card-compact mb-sm">
              <div class="flex items-center gap-md">
                <div style="width: 40px; height: 40px; min-width: 40px; border-radius: var(--radius-sm); background: rgba(34, 197, 94, 0.1); display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                </div>
                <div>
                  <div class="text-sm" style="font-weight: 600;">${cd.name}</div>
                  <div class="text-xs text-muted">${cd.description}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Graduation Test -->
        ${phase.graduationTest ? `
          <div class="mt-lg">
            <h3 class="heading-sm mb-md">🏆 Graduation Test</h3>
            <div class="card" style="border: 1px solid rgba(249, 115, 22, 0.2);">
              <div class="heading-sm">${phase.graduationTest.exercise}</div>
              <p class="text-sm text-muted mt-xs">${phase.graduationTest.description}</p>
              <div class="flex items-center gap-sm mt-md">
                <span class="badge badge-warning">Target: ${phase.graduationTest.reps} reps</span>
              </div>
            </div>
          </div>
        ` : phase.completionMessage ? `
          <div class="mt-lg">
            <div class="card text-center" style="border: 1px solid rgba(34, 197, 94, 0.2);">
              <div style="font-size: 32px; margin-bottom: 8px;">🏆</div>
              <div class="heading-sm text-accent">${phase.completionMessage}</div>
            </div>
          </div>
        ` : ''}

        <!-- Start Workout Button -->
        ${unlocked && (isCurrent || phaseId <= profile.currentPhase) ? `
          <button class="btn btn-fire btn-lg btn-full mt-xl mb-xl" id="start-phase-workout-btn" style="padding: 18px;">
            🔥 Start ${phase.name} Workout
          </button>
        ` : `
          <div style="height: 48px;"></div>
        `}
      </div>
    </div>
  `;
}

export function setup() {
  const backBtn = document.getElementById('phase-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.history.back());
  }

  const startBtn = document.getElementById('start-phase-workout-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const hash = window.location.hash;
      const phaseId = hash.split('/').pop();
      window.location.hash = `/session/${phaseId}`;
    });
  }
}
