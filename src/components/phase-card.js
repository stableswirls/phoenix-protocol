/**
 * phase-card.js — Phase Overview Card Component
 * Phoenix Protocol Design System
 *
 * Displays a training phase card with lock/unlock state,
 * progress indicator, schedule info, and fire border for active phase.
 *
 * @module components/phase-card
 */

import { createProgressRing } from './progress-ring.js';

/**
 * Returns an inline SVG lock icon.
 * @returns {string}
 */
function lockIcon() {
  return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>`;
}

/**
 * Returns a phase number badge SVG icon based on phase number.
 * @param {number} num
 * @param {boolean} active
 * @param {boolean} locked
 * @returns {string}
 */
function phaseBadge(num, active, locked) {
  const bg = locked
    ? 'rgba(100, 116, 139, 0.15)'
    : active
      ? 'rgba(249, 115, 22, 0.2)'
      : 'rgba(34, 197, 94, 0.15)';
  const textColor = locked
    ? 'var(--color-text-dim)'
    : active
      ? 'var(--color-primary)'
      : 'var(--color-accent)';

  return `<div style="
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${bg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1rem;
    color: ${textColor};
    flex-shrink: 0;
  ">${num}</div>`;
}

/**
 * Returns a schedule icon SVG.
 * @returns {string}
 */
function calendarIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`;
}

/**
 * Returns a method/dumbbell icon SVG.
 * @returns {string}
 */
function methodIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 5v14"/>
    <path d="M18 5v14"/>
    <path d="M6 12h12"/>
    <rect x="2" y="8" width="4" height="8" rx="1"/>
    <rect x="18" y="8" width="4" height="8" rx="1"/>
  </svg>`;
}

/**
 * Creates a phase overview card element.
 *
 * @param {Object} phase - Phase data from PHOENIX_PROTOCOL.phases[]
 * @param {number}  phase.id       - Phase identifier
 * @param {string}  phase.name     - Phase name (e.g. "The Foundation")
 * @param {string}  phase.subtitle - Phase subtitle (e.g. "Rehab")
 * @param {Object}  phase.schedule - Schedule info
 * @param {Object}  phase.method   - Training method info
 * @param {Object}  phase.weeks    - Week range info
 *
 * @param {Object}  [options]
 * @param {boolean} [options.locked=false]   - Whether the phase is locked
 * @param {boolean} [options.active=false]   - Whether this is the current phase
 * @param {number}  [options.progress=0]     - Completion progress 0-100
 * @param {Function} [options.onClick=null]  - Click handler
 *
 * @returns {HTMLElement}
 */
export function createPhaseCard(phase, options = {}) {
  const {
    locked = false,
    active = false,
    progress = 0,
    onClick = null,
  } = options;

  const card = document.createElement('div');
  card.className = active ? 'card-fire' : 'card';
  card.style.cssText = `
    position: relative;
    cursor: ${locked ? 'default' : 'pointer'};
    transition: transform 200ms ease, box-shadow 200ms ease;
    opacity: ${locked ? '0.6' : '1'};
  `;

  if (!locked) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  }

  // ── Lock overlay ───────────────────────────────────────────
  if (locked) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(10, 10, 10, 0.5);
      border-radius: var(--radius-lg);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    `;
    overlay.innerHTML = lockIcon();
    card.appendChild(overlay);
  }

  // ── Card content ───────────────────────────────────────────
  const content = document.createElement('div');
  content.style.cssText = 'display: flex; gap: 16px; align-items: flex-start;';

  // Left column: badge + progress
  const leftCol = document.createElement('div');
  leftCol.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  `;
  leftCol.innerHTML = phaseBadge(phase.id, active, locked);

  // Show progress ring if active or completed
  if (!locked && progress > 0) {
    const ring = createProgressRing({
      size: 44,
      strokeWidth: 3,
      progress,
      color: active ? 'var(--color-primary)' : 'var(--color-accent)',
      label: `${Math.round(progress)}%`,
      animated: true,
    });
    leftCol.appendChild(ring.element);
  }

  content.appendChild(leftCol);

  // Right column: info
  const rightCol = document.createElement('div');
  rightCol.style.cssText = 'flex: 1; min-width: 0;';

  // Name row
  const nameRow = document.createElement('div');
  nameRow.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

  const nameEl = document.createElement('h3');
  nameEl.className = 'heading-sm';
  nameEl.textContent = phase.name;
  nameRow.appendChild(nameEl);

  if (active) {
    const activeBadge = document.createElement('span');
    activeBadge.className = 'badge badge-primary';
    activeBadge.textContent = 'Active';
    nameRow.appendChild(activeBadge);
  }

  rightCol.appendChild(nameRow);

  // Subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm text-muted';
  subtitle.style.marginTop = '2px';
  subtitle.textContent = phase.subtitle;
  rightCol.appendChild(subtitle);

  // Meta info
  const meta = document.createElement('div');
  meta.style.cssText = `
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 10px;
    flex-wrap: wrap;
  `;

  // Schedule
  if (phase.schedule) {
    const scheduleEl = document.createElement('span');
    scheduleEl.className = 'text-xs text-muted';
    scheduleEl.style.cssText = 'display: flex; align-items: center; gap: 4px;';
    scheduleEl.innerHTML = `${calendarIcon()} ${phase.schedule.workDaysPerWeek} days/week`;
    meta.appendChild(scheduleEl);
  }

  // Method
  if (phase.method) {
    const methodEl = document.createElement('span');
    methodEl.className = 'text-xs text-muted';
    methodEl.style.cssText = 'display: flex; align-items: center; gap: 4px;';
    methodEl.innerHTML = `${methodIcon()} ${phase.method.name}`;
    meta.appendChild(methodEl);
  }

  // Weeks
  if (phase.weeks) {
    const weeksEl = document.createElement('span');
    weeksEl.className = 'text-xs text-dim';
    weeksEl.textContent = `Weeks ${phase.weeks.start}–${phase.weeks.end}`;
    meta.appendChild(weeksEl);
  }

  rightCol.appendChild(meta);
  content.appendChild(rightCol);
  card.appendChild(content);

  // ── Click handler ──────────────────────────────────────────
  if (onClick && !locked) {
    card.addEventListener('click', () => onClick(phase));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(phase);
      }
    });
  }

  return card;
}
