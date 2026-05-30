/**
 * exercise-card.js — Exercise Card Component
 * Phoenix Protocol Design System
 *
 * Displays an exercise with its illustration, sets, reps, and form tips.
 * Supports compact mode and live session mode with set tracking.
 *
 * @module components/exercise-card
 */

import { getExerciseIllustration } from './exercise-illustrations.js';

/**
 * Builds the sets × reps or duration display string.
 * @param {Object} exercise
 * @returns {string}
 */
function getRepDisplay(exercise) {
  if (exercise.type === 'timed') {
    const dur = exercise.duration || exercise.durationMin || 0;
    const durMax = exercise.durationMax;
    if (durMax && durMax !== dur) {
      return `${dur}–${durMax}s`;
    }
    return `${dur}s`;
  }

  if (exercise.type === 'max-reps') {
    return 'Max Reps';
  }

  return exercise.reps || '—';
}

/**
 * Creates a chevron SVG icon for the collapsible section.
 * @param {boolean} expanded
 * @returns {string}
 */
function chevronIcon(expanded) {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    style="transition: transform 200ms ease; transform: rotate(${expanded ? '180' : '0'}deg);">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>`;
}

/**
 * Creates an exercise card element.
 *
 * @param {Object} exercise - Exercise data object
 * @param {string}  exercise.name            - Exercise name
 * @param {string}  [exercise.illustration]  - Illustration key
 * @param {number}  [exercise.sets]          - Number of sets
 * @param {string}  [exercise.reps]          - Reps string (e.g. "8-10")
 * @param {number}  [exercise.rest]          - Rest time in seconds
 * @param {string}  [exercise.type]          - 'reps' | 'timed' | 'max-reps'
 * @param {string}  [exercise.tips]          - Exercise tips string
 * @param {string[]} [exercise.formCues]     - Array of form cue strings
 * @param {string}  [exercise.label]         - Superset label (e.g. "1A")
 *
 * @param {Object}  [options]
 * @param {boolean} [options.showIllustration=true] - Show the SVG illustration
 * @param {boolean} [options.compact=false]         - Use compact layout
 * @param {boolean} [options.sessionMode=false]     - Enable live-session UI
 * @param {number}  [options.currentSet=0]          - Current set (1-based) if in session
 *
 * @returns {HTMLElement}
 */
export function createExerciseCard(exercise, options = {}) {
  const {
    showIllustration = true,
    compact = false,
    sessionMode = false,
    currentSet = 0,
  } = options;

  const card = document.createElement('div');
  card.className = `card${compact ? ' card-compact' : ''}`;
  card.style.cssText = 'overflow: hidden;';

  // ── Top row: illustration + info ──────────────────────────
  const topRow = document.createElement('div');
  topRow.style.cssText = 'display: flex; gap: 16px; align-items: flex-start;';

  // Illustration
  if (showIllustration && exercise.illustration) {
    const illustrationWrap = document.createElement('div');
    illustrationWrap.style.cssText = `
      flex-shrink: 0;
      width: ${compact ? '56px' : '72px'};
      height: ${compact ? '56px' : '72px'};
      background-color: var(--color-surface-2);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    `;
    try {
      const svgStr = getExerciseIllustration(exercise.illustration);
      illustrationWrap.innerHTML = svgStr;
    } catch (_) {
      // Illustration not available — show placeholder
      illustrationWrap.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>`;
    }
    topRow.appendChild(illustrationWrap);
  }

  // Info column
  const info = document.createElement('div');
  info.style.cssText = 'flex: 1; min-width: 0;';

  // Exercise label + name
  const nameRow = document.createElement('div');
  nameRow.style.cssText = 'display: flex; align-items: center; gap: 8px;';

  if (exercise.label) {
    const labelBadge = document.createElement('span');
    labelBadge.className = 'badge badge-primary';
    labelBadge.textContent = exercise.label;
    nameRow.appendChild(labelBadge);
  }

  const nameEl = document.createElement('h3');
  nameEl.className = compact ? 'text-body' : 'heading-sm';
  nameEl.style.fontWeight = '600';
  nameEl.textContent = exercise.name;
  nameRow.appendChild(nameEl);

  info.appendChild(nameRow);

  // Sets × Reps line
  const statsRow = document.createElement('div');
  statsRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    flex-wrap: wrap;
  `;

  if (exercise.sets) {
    const setsEl = document.createElement('span');
    setsEl.className = 'text-sm';
    setsEl.style.color = 'var(--color-primary)';
    setsEl.style.fontWeight = '600';
    setsEl.textContent = `${exercise.sets} × ${getRepDisplay(exercise)}`;
    statsRow.appendChild(setsEl);
  } else {
    const repEl = document.createElement('span');
    repEl.className = 'text-sm';
    repEl.style.color = 'var(--color-primary)';
    repEl.style.fontWeight = '600';
    repEl.textContent = getRepDisplay(exercise);
    statsRow.appendChild(repEl);
  }

  if (exercise.rest) {
    const restEl = document.createElement('span');
    restEl.className = 'text-xs text-muted';
    restEl.textContent = `Rest ${exercise.rest}s`;
    statsRow.appendChild(restEl);
  }

  if (exercise.tempo) {
    const tempoEl = document.createElement('span');
    tempoEl.className = 'text-xs text-muted';
    tempoEl.textContent = `Tempo ${exercise.tempo}`;
    statsRow.appendChild(tempoEl);
  }

  info.appendChild(statsRow);

  // Session mode — current set indicator
  if (sessionMode && exercise.sets && currentSet > 0) {
    const setIndicator = document.createElement('div');
    setIndicator.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    `;

    // Set dots
    for (let i = 1; i <= exercise.sets; i++) {
      const dot = document.createElement('span');
      dot.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        transition: all 200ms ease;
      `;
      if (i < currentSet) {
        dot.style.backgroundColor = 'var(--color-accent)';
        dot.style.boxShadow = '0 0 6px rgba(34, 197, 94, 0.4)';
      } else if (i === currentSet) {
        dot.style.backgroundColor = 'var(--color-primary)';
        dot.style.boxShadow = '0 0 8px rgba(249, 115, 22, 0.5)';
      } else {
        dot.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      }
      setIndicator.appendChild(dot);
    }

    const setLabel = document.createElement('span');
    setLabel.className = 'text-xs text-muted';
    setLabel.style.marginLeft = '4px';
    setLabel.textContent = `Set ${currentSet} of ${exercise.sets}`;
    setIndicator.appendChild(setLabel);

    info.appendChild(setIndicator);
  }

  topRow.appendChild(info);
  card.appendChild(topRow);

  // ── Collapsible form tips ─────────────────────────────────
  const hasTips = exercise.tips || (exercise.formCues && exercise.formCues.length > 0);

  if (hasTips) {
    const divider = document.createElement('hr');
    divider.className = 'divider';
    divider.style.margin = '12px 0';
    card.appendChild(divider);

    const tipsToggle = document.createElement('button');
    tipsToggle.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 4px 0;
      cursor: pointer;
      min-height: 44px;
    `;
    tipsToggle.setAttribute('aria-expanded', 'false');

    const tipsLabel = document.createElement('span');
    tipsLabel.className = 'text-sm text-muted';
    tipsLabel.textContent = 'Form Tips';

    const chevronWrap = document.createElement('span');
    chevronWrap.innerHTML = chevronIcon(false);

    tipsToggle.appendChild(tipsLabel);
    tipsToggle.appendChild(chevronWrap);

    const tipsContent = document.createElement('div');
    tipsContent.style.cssText = `
      max-height: 0;
      overflow: hidden;
      transition: max-height 300ms ease;
    `;

    const tipsInner = document.createElement('div');
    tipsInner.style.cssText = 'padding: 4px 0 4px 0;';

    if (exercise.tips) {
      const tipText = document.createElement('p');
      tipText.className = 'text-sm text-muted';
      tipText.style.marginBottom = '8px';
      tipText.textContent = exercise.tips;
      tipsInner.appendChild(tipText);
    }

    if (exercise.formCues && exercise.formCues.length > 0) {
      const cueList = document.createElement('ul');
      cueList.style.cssText = `
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
      `;

      exercise.formCues.forEach((cue) => {
        const li = document.createElement('li');
        li.className = 'text-sm';
        li.style.cssText = `
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--color-text-muted);
        `;
        li.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round"
            style="flex-shrink: 0; margin-top: 2px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${cue}</span>`;
        cueList.appendChild(li);
      });

      tipsInner.appendChild(cueList);
    }

    tipsContent.appendChild(tipsInner);

    let tipsExpanded = false;
    tipsToggle.addEventListener('click', () => {
      tipsExpanded = !tipsExpanded;
      tipsToggle.setAttribute('aria-expanded', String(tipsExpanded));
      chevronWrap.innerHTML = chevronIcon(tipsExpanded);
      tipsContent.style.maxHeight = tipsExpanded
        ? `${tipsInner.scrollHeight + 16}px`
        : '0';
    });

    card.appendChild(tipsToggle);
    card.appendChild(tipsContent);
  }

  return card;
}
