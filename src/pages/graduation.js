/**
 * graduation.js — Graduation Test (route: #/graduation/:phaseId)
 *
 * Tests the user to see if they can advance to the next phase.
 * Shows exercise, rep counter, and pass/fail flow.
 */

import { markGraduationPassed, getUserProfile, saveUserProfile } from '../db/database.js';
import PHOENIX_PROTOCOL from '../data/workouts.js';

// ─── Module State ────────────────────────────────────────────

let repCount = 0;
let testPassed = false;

// ─── Helpers ─────────────────────────────────────────────────

function getExerciseIllustration() {
  return `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="25" r="12" stroke="#F97316" stroke-width="2"/>
    <line x1="100" y1="37" x2="70" y2="48" stroke="#F97316" stroke-width="2.5"/>
    <line x1="70" y1="48" x2="35" y2="48" stroke="#F97316" stroke-width="2.5"/>
    <line x1="100" y1="48" x2="105" y2="65" stroke="#F97316" stroke-width="2.5"/>
    <line x1="105" y1="65" x2="100" y2="80" stroke="#F97316" stroke-width="2.5"/>
    <line x1="35" y1="48" x2="30" y2="65" stroke="#F97316" stroke-width="2.5"/>
    <line x1="30" y1="65" x2="25" y2="80" stroke="#F97316" stroke-width="2.5"/>
    <text x="70" y="95" text-anchor="middle" fill="#94A3B8" font-size="10" font-family="Barlow">PUSHUPS</text>
  </svg>`;
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

// ─── Page Export ──────────────────────────────────────────────

export default async function GraduationPage(params) {
  const phaseId = parseInt(params.phaseId) || 1;
  const phase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId);

  if (!phase || !phase.graduationTest) {
    return `
      <div class="page">
        <div class="container" style="padding-top: 80px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
          <h1 class="heading-lg text-fire">Program Complete!</h1>
          <p class="text-sm text-muted mt-md">
            ${phase?.completionMessage || 'You have risen! The Phoenix Protocol is complete.'}
          </p>
          <button class="btn btn-primary btn-lg mt-xl" onclick="window.location.hash='/'">
            Back to Dashboard
          </button>
        </div>
      </div>
    `;
  }

  const test = phase.graduationTest;
  const nextPhase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId + 1);
  repCount = 0;
  testPassed = false;

  return `
    <div class="page">
      <div class="container">
        <!-- Header -->
        <div style="padding: 16px 0;">
          <button class="btn btn-ghost" id="grad-back-btn" style="min-height: 44px; padding: 8px 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
        </div>

        <!-- Phase Complete Banner -->
        <div class="text-center mt-md">
          <div style="font-size: 56px; margin-bottom: 8px;">🏆</div>
          <h1 class="heading-lg text-fire">Phase ${phaseId} Complete!</h1>
          <p class="text-sm text-muted mt-sm">${phase.name} — Graduation Test</p>
        </div>

        <!-- Test Description -->
        <div class="card-fire mt-xl">
          <div class="text-center">
            <h2 class="heading-md">${test.exercise}</h2>
            <p class="text-sm text-muted mt-sm">${test.description}</p>
          </div>
        </div>

        <!-- Exercise Illustration -->
        <div style="display: flex; justify-content: center; padding: 24px 0;">
          <div style="width: 200px; height: 140px; display: flex; align-items: center; justify-content: center;">
            ${getExerciseIllustration()}
          </div>
        </div>

        <!-- Rep Counter -->
        <div class="card text-center" id="rep-counter-card">
          <div class="text-sm text-muted mb-sm">Rep Counter</div>

          <div id="rep-count-display" class="heading-xl" style="font-size: 5rem; color: var(--color-primary); transition: color 200ms ease;">
            ${repCount}
          </div>

          <div class="flex-center gap-sm mt-sm">
            <span class="text-sm text-muted">Target:</span>
            <span class="text-sm text-primary" style="font-weight: 700;">${test.reps} reps</span>
          </div>

          <!-- Progress toward target -->
          <div class="progress-bar mt-md" style="height: 6px;">
            <div id="grad-progress-fill" class="progress-bar-fill" style="width: 0%; background: var(--color-fire-gradient); transition: width 200ms ease;"></div>
          </div>

          <!-- +/- Buttons -->
          <div class="flex-center gap-xl mt-lg">
            <button class="btn btn-outline" id="rep-minus-btn" style="
              width: 64px; height: 64px; border-radius: 50%;
              font-size: 2rem; padding: 0; line-height: 1;
              min-width: 64px;
            ">−</button>
            <button class="btn btn-primary" id="rep-plus-btn" style="
              width: 80px; height: 80px; border-radius: 50%;
              font-size: 2.5rem; padding: 0; line-height: 1;
              min-width: 80px;
              box-shadow: var(--color-fire-glow);
            ">+</button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-lg" id="graduation-actions">
          <button class="btn btn-accent btn-lg btn-full" id="pass-btn" disabled style="padding: 18px; opacity: 0.5;">
            🏆 I Did It! (${test.reps}+ reps)
          </button>
          <button class="btn btn-ghost btn-full mt-md" id="not-yet-btn" style="min-height: 44px;">
            Not Yet — Keep Training
          </button>
        </div>

        <!-- Celebration (hidden initially) -->
        <div id="celebration-panel" style="display: none;" class="text-center mt-xl">
          <div style="font-size: 72px;" class="animate-bounceIn">🎉</div>
          <h2 class="heading-xl text-fire mt-md animate-bounceIn" style="animation-delay: 200ms;">
            ${nextPhase ? `Phase ${nextPhase.id} Unlocked!` : 'Program Complete!'}
          </h2>
          <p class="text-sm text-muted mt-md">
            ${nextPhase ? `Welcome to ${nextPhase.name} — ${nextPhase.subtitle}!` : 'You have completed the entire Phoenix Protocol. You are reborn! 🔥'}
          </p>
          <button class="btn btn-fire btn-lg btn-full mt-xl" id="continue-btn" style="padding: 18px;">
            ${nextPhase ? `Start ${nextPhase.name} →` : '🏠 Back to Dashboard'}
          </button>
        </div>

        <!-- Confetti container -->
        <div id="confetti-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"></div>
      </div>
    </div>
  `;
}

export function setup() {
  const phaseIdMatch = window.location.hash.match(/\/graduation\/(\d+)/);
  const phaseId = phaseIdMatch ? parseInt(phaseIdMatch[1]) : 1;
  const phase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId);
  if (!phase?.graduationTest) return;

  const target = phase.graduationTest.reps;
  const nextPhase = PHOENIX_PROTOCOL.phases.find(p => p.id === phaseId + 1);

  const display = document.getElementById('rep-count-display');
  const progressFill = document.getElementById('grad-progress-fill');
  const passBtn = document.getElementById('pass-btn');
  const plusBtn = document.getElementById('rep-plus-btn');
  const minusBtn = document.getElementById('rep-minus-btn');

  function updateDisplay() {
    if (display) {
      display.textContent = repCount;
      display.style.color = repCount >= target ? 'var(--color-accent)' : 'var(--color-primary)';
    }
    if (progressFill) {
      progressFill.style.width = `${Math.min(100, (repCount / target) * 100)}%`;
      progressFill.style.background = repCount >= target
        ? 'var(--color-accent)'
        : 'var(--color-fire-gradient)';
    }
    if (passBtn) {
      const canPass = repCount >= target;
      passBtn.disabled = !canPass;
      passBtn.style.opacity = canPass ? '1' : '0.5';
    }
  }

  // Plus button
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      repCount++;
      updateDisplay();
      if (navigator.vibrate) navigator.vibrate(30);
    });
  }

  // Minus button
  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (repCount > 0) repCount--;
      updateDisplay();
    });
  }

  // Back button
  const backBtn = document.getElementById('grad-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.history.back());
  }

  // Not yet button
  const notYetBtn = document.getElementById('not-yet-btn');
  if (notYetBtn) {
    notYetBtn.addEventListener('click', () => {
      window.location.hash = '/';
    });
  }

  // Pass button
  if (passBtn) {
    passBtn.addEventListener('click', async () => {
      if (repCount < target) return;

      testPassed = true;

      try {
        // Mark graduation as passed
        await markGraduationPassed(phaseId);

        // Update user profile to next phase
        if (nextPhase) {
          const profile = await getUserProfile();
          profile.currentPhase = nextPhase.id;
          await saveUserProfile(profile);
        }

        // Hide counter, show celebration
        const counterCard = document.getElementById('rep-counter-card');
        const actions = document.getElementById('graduation-actions');
        const celebration = document.getElementById('celebration-panel');

        if (counterCard) counterCard.style.display = 'none';
        if (actions) actions.style.display = 'none';
        if (celebration) celebration.style.display = 'block';

        // Confetti!
        spawnConfetti();

        showToast(nextPhase ? `Phase ${nextPhase.id} unlocked! 🎉` : 'Program complete! 🏆');
      } catch (e) {
        console.error('[Graduation] Failed:', e);
        showToast('Error saving graduation', 'error');
      }
    });
  }

  // Continue button
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      window.location.hash = '/';
    });
  }
}

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  const colors = ['#F97316', '#FB923C', '#F59E0B', '#EF4444', '#22C55E', '#DC2626', '#FFD700'];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 800;
    const size = Math.random() * 10 + 4;
    const duration = Math.random() * 2000 + 2000;

    piece.style.cssText = `
      position: absolute;
      top: -10px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${duration}ms ease-in ${delay}ms forwards;
    `;
    container.appendChild(piece);
  }

  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    if (container) container.innerHTML = '';
  }, 4000);
}
