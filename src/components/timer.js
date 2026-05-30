/**
 * timer.js — Circular Countdown Timer Component
 * Phoenix Protocol Design System
 *
 * Creates a circular SVG arc countdown timer with play/pause controls,
 * completion vibration, and Web Audio API beep.
 *
 * @module components/timer
 */

/**
 * Generates a short beep tone via the Web Audio API.
 * @param {number} frequency - Tone frequency in Hz
 * @param {number} durationMs - Tone duration in milliseconds
 */
function playBeep(frequency = 880, durationMs = 200) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationMs / 1000);

    // Cleanup
    oscillator.onended = () => ctx.close();
  } catch (_) {
    // Web Audio not supported — silent fallback
  }
}

/**
 * Formats seconds into MM:SS display string.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Describes an SVG arc path for a circular timer.
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius - Arc radius
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @returns {string} SVG path d attribute
 */
function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/**
 * Converts polar coordinates to cartesian.
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} angleDeg
 * @returns {{ x: number, y: number }}
 */
function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/**
 * Creates a circular countdown timer component.
 *
 * @param {Object} options
 * @param {number}  options.duration     - Seconds to count down
 * @param {number}  [options.size=200]   - Diameter in px
 * @param {number}  [options.strokeWidth=8] - Arc stroke width
 * @param {string}  [options.color='var(--color-primary)'] - Arc color
 * @param {boolean} [options.showControls=true] - Show play/pause button
 * @param {boolean} [options.autoStart=false]   - Start immediately
 * @param {boolean} [options.vibrate=true]      - Vibrate on complete
 * @param {string}  [options.label='']          - Label text above timer (e.g. "REST")
 * @returns {{
 *   element: HTMLElement,
 *   start: () => void,
 *   pause: () => void,
 *   resume: () => void,
 *   reset: () => void,
 *   destroy: () => void,
 *   onComplete: (callback: Function) => void
 * }}
 */
export function createTimer(options = {}) {
  const {
    duration,
    size = 200,
    strokeWidth = 8,
    color = 'var(--color-primary)',
    showControls = true,
    autoStart = false,
    vibrate = true,
    label = '',
  } = options;

  if (!duration || duration <= 0) {
    throw new Error('Timer: duration must be a positive number');
  }

  // ── State ──────────────────────────────────────────────────
  let remaining = duration;
  let isRunning = false;
  let intervalId = null;
  let completeCallback = null;

  // ── DOM ────────────────────────────────────────────────────
  const container = document.createElement('div');
  container.className = 'timer-container';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    user-select: none;
    -webkit-user-select: none;
  `;

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // ── Label ──────────────────────────────────────────────────
  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'text-sm text-uppercase text-muted';
    labelEl.style.letterSpacing = '0.12em';
    labelEl.textContent = label;
    container.appendChild(labelEl);
  }

  // ── SVG ring ───────────────────────────────────────────────
  const svgWrapper = document.createElement('div');
  svgWrapper.style.cssText = `
    position: relative;
    width: ${size}px;
    height: ${size}px;
  `;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.transform = 'rotate(-90deg)';

  // Background track
  const trackCircle = document.createElementNS(svgNS, 'circle');
  trackCircle.setAttribute('cx', cx);
  trackCircle.setAttribute('cy', cy);
  trackCircle.setAttribute('r', radius);
  trackCircle.setAttribute('fill', 'none');
  trackCircle.setAttribute('stroke', 'rgba(255,255,255,0.08)');
  trackCircle.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(trackCircle);

  // Progress arc (uses stroke-dasharray for depletion)
  const circumference = 2 * Math.PI * radius;
  const progressCircle = document.createElementNS(svgNS, 'circle');
  progressCircle.setAttribute('cx', cx);
  progressCircle.setAttribute('cy', cy);
  progressCircle.setAttribute('r', radius);
  progressCircle.setAttribute('fill', 'none');
  progressCircle.setAttribute('stroke', color);
  progressCircle.setAttribute('stroke-width', strokeWidth);
  progressCircle.setAttribute('stroke-linecap', 'round');
  progressCircle.setAttribute('stroke-dasharray', circumference);
  progressCircle.setAttribute('stroke-dashoffset', '0');
  progressCircle.style.transition = 'stroke-dashoffset 0.3s ease';
  svg.appendChild(progressCircle);

  // Glow filter
  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', `timer-glow-${Date.now()}`);
  const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
  feGaussianBlur.setAttribute('stdDeviation', '3');
  feGaussianBlur.setAttribute('result', 'glow');
  filter.appendChild(feGaussianBlur);
  const feMerge = document.createElementNS(svgNS, 'feMerge');
  const feMergeNode1 = document.createElementNS(svgNS, 'feMergeNode');
  feMergeNode1.setAttribute('in', 'glow');
  const feMergeNode2 = document.createElementNS(svgNS, 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(feMergeNode1);
  feMerge.appendChild(feMergeNode2);
  filter.appendChild(feMerge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  svgWrapper.appendChild(svg);

  // ── Center text overlay ────────────────────────────────────
  const centerText = document.createElement('div');
  centerText.style.cssText = `
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    font-size: ${size * 0.2}px;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: 0.02em;
  `;
  centerText.textContent = formatTime(remaining);
  svgWrapper.appendChild(centerText);

  container.appendChild(svgWrapper);

  // ── Controls ───────────────────────────────────────────────
  let controlBtn = null;
  if (showControls) {
    controlBtn = document.createElement('button');
    controlBtn.className = 'btn btn-icon btn-outline';
    controlBtn.setAttribute('aria-label', 'Start timer');
    controlBtn.style.cssText = `
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
    `;
    controlBtn.innerHTML = getPlayIcon();
    controlBtn.addEventListener('click', handleControlClick);
    container.appendChild(controlBtn);
  }

  // ── Render helpers ─────────────────────────────────────────

  function updateDisplay() {
    const fraction = remaining / duration;
    const offset = circumference * (1 - fraction);
    progressCircle.setAttribute('stroke-dashoffset', offset);
    centerText.textContent = formatTime(remaining);
  }

  function setGlowState(active) {
    const filterId = filter.getAttribute('id');
    if (active) {
      progressCircle.setAttribute('filter', `url(#${filterId})`);
      svgWrapper.classList.add('animate-pulse');
    } else {
      progressCircle.removeAttribute('filter');
      svgWrapper.classList.remove('animate-pulse');
    }
  }

  function handleControlClick() {
    if (isRunning) {
      pause();
    } else {
      if (remaining === duration) {
        start();
      } else {
        resume();
      }
    }
  }

  function getPlayIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 20,12 8,19" />
    </svg>`;
  }

  function getPauseIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>`;
  }

  function updateControlIcon() {
    if (!controlBtn) return;
    controlBtn.innerHTML = isRunning ? getPauseIcon() : getPlayIcon();
    controlBtn.setAttribute('aria-label', isRunning ? 'Pause timer' : 'Start timer');
  }

  // ── Timer engine ───────────────────────────────────────────

  function tick() {
    if (remaining <= 0) {
      complete();
      return;
    }
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      complete();
    }
  }

  function complete() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setGlowState(false);
    updateControlIcon();

    // Vibrate
    if (vibrate && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // Beep — play three ascending tones
    playBeep(660, 150);
    setTimeout(() => playBeep(880, 150), 200);
    setTimeout(() => playBeep(1100, 250), 400);

    // Callback
    if (typeof completeCallback === 'function') {
      completeCallback();
    }
  }

  // ── Public API ─────────────────────────────────────────────

  function start() {
    if (isRunning) return;
    remaining = duration;
    updateDisplay();
    isRunning = true;
    setGlowState(true);
    updateControlIcon();
    intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (!isRunning) return;
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setGlowState(false);
    updateControlIcon();
  }

  function resume() {
    if (isRunning || remaining <= 0) return;
    isRunning = true;
    setGlowState(true);
    updateControlIcon();
    intervalId = setInterval(tick, 1000);
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    remaining = duration;
    updateDisplay();
    setGlowState(false);
    updateControlIcon();
  }

  function destroy() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    if (controlBtn) {
      controlBtn.removeEventListener('click', handleControlClick);
    }
    container.remove();
  }

  /**
   * Register a completion callback.
   * @param {Function} callback
   */
  function onComplete(callback) {
    completeCallback = callback;
  }

  // ── Init ───────────────────────────────────────────────────
  updateDisplay();
  if (autoStart) {
    start();
  }

  return {
    element: container,
    start,
    pause,
    resume,
    reset,
    destroy,
    onComplete,
  };
}
