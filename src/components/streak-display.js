/**
 * streak-display.js — Streak Display Component
 * Phoenix Protocol Design System
 *
 * Shows the current workout streak with a fire animation,
 * glow effect, and best streak badge.
 *
 * @module components/streak-display
 */

/**
 * Returns an inline SVG flame icon.
 * @param {boolean} active - Whether the streak is active (> 0)
 * @returns {string} SVG markup
 */
function flameIcon(active) {
  const color = active ? '#F97316' : '#64748B';
  const glow = active ? '#F59E0B' : '#475569';
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 6 8.5 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 8.5 12 2 12 2Z"
      fill="${color}" opacity="0.9"/>
    <path d="M12 8C12 8 9 11.5 9 14C9 15.66 10.34 17 12 17C13.66 17 15 15.66 15 14C15 11.5 12 8 12 8Z"
      fill="${glow}" opacity="0.7"/>
  </svg>`;
}

/**
 * Returns an inline SVG trophy icon for best streak.
 * @returns {string} SVG markup
 */
function trophyIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
    <path d="M18 2H6v7a6 6 0 1012 0V2z"/>
  </svg>`;
}

/**
 * Creates a streak display element.
 *
 * @param {Object} streakData
 * @param {number}  streakData.currentStreak  - Current streak count
 * @param {number}  streakData.bestStreak     - Best streak count
 * @param {boolean} [streakData.isStreakActive=false] - Whether streak is currently active
 *
 * @returns {HTMLElement}
 */
export function createStreakDisplay(streakData = {}) {
  const {
    currentStreak = 0,
    bestStreak = 0,
    isStreakActive = false,
  } = streakData;

  const active = currentStreak > 0 && isStreakActive;

  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 16px;
    user-select: none;
    -webkit-user-select: none;
  `;

  // ── Flame icon ────────────────────────────────────────────
  const flameWrap = document.createElement('div');
  flameWrap.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: bottom center;
  `;
  if (active) {
    flameWrap.classList.add('animate-streakFlame');
  }
  flameWrap.innerHTML = flameIcon(active);
  container.appendChild(flameWrap);

  // ── Streak number ─────────────────────────────────────────
  const numberEl = document.createElement('div');
  numberEl.style.cssText = `
    font-family: var(--font-heading);
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1;
    transition: all 300ms ease;
  `;

  if (active) {
    numberEl.style.color = 'var(--color-text)';
    numberEl.style.textShadow = '0 0 20px rgba(249, 115, 22, 0.5)';
    numberEl.classList.add('animate-fireGlow');
  } else {
    numberEl.style.color = 'var(--color-text-dim)';
  }

  numberEl.textContent = currentStreak;
  container.appendChild(numberEl);

  // ── "day streak" label ────────────────────────────────────
  const labelEl = document.createElement('span');
  labelEl.className = 'text-sm text-uppercase';
  labelEl.style.cssText = `
    letter-spacing: 0.1em;
    color: ${active ? 'var(--color-text-muted)' : 'var(--color-text-dim)'};
  `;
  labelEl.textContent = currentStreak === 1 ? 'day streak' : 'day streak';
  container.appendChild(labelEl);

  // ── Best streak badge ─────────────────────────────────────
  if (bestStreak > 0) {
    const bestBadge = document.createElement('div');
    bestBadge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 6px 14px;
      background-color: rgba(245, 158, 11, 0.1);
      border-radius: 999px;
      border: 1px solid rgba(245, 158, 11, 0.2);
    `;

    const trophyWrap = document.createElement('span');
    trophyWrap.style.cssText = 'display: flex; align-items: center;';
    trophyWrap.innerHTML = trophyIcon();

    const bestText = document.createElement('span');
    bestText.className = 'text-xs';
    bestText.style.cssText = `
      color: var(--color-warning);
      font-weight: 600;
    `;
    bestText.textContent = `Best: ${bestStreak} days`;

    bestBadge.appendChild(trophyWrap);
    bestBadge.appendChild(bestText);
    container.appendChild(bestBadge);
  }

  return container;
}
