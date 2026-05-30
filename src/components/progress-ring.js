/**
 * progress-ring.js — Circular Progress Ring Component
 * Phoenix Protocol Design System
 *
 * SVG circular progress indicator with optional animation on mount
 * and a center label.
 *
 * @module components/progress-ring
 */

/**
 * Creates a circular progress ring.
 *
 * @param {Object}  [options]
 * @param {number}  [options.size=80]          - Diameter in px
 * @param {number}  [options.strokeWidth=6]    - Ring stroke width
 * @param {number}  [options.progress=0]       - Initial progress 0-100
 * @param {string}  [options.color='var(--color-primary)'] - Stroke color
 * @param {string}  [options.label='']         - Center text (e.g. "Week 2/4")
 * @param {boolean} [options.animated=true]    - Animate on mount
 *
 * @returns {{
 *   element: HTMLElement,
 *   setProgress: (value: number, newLabel?: string) => void
 * }}
 */
export function createProgressRing(options = {}) {
  const {
    size = 80,
    strokeWidth = 6,
    progress = 0,
    color = 'var(--color-primary)',
    label = '',
    animated = true,
  } = options;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // ── Container ──────────────────────────────────────────────
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${size}px;
    height: ${size}px;
  `;

  // ── SVG ────────────────────────────────────────────────────
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.transform = 'rotate(-90deg)';

  // Track (background ring)
  const track = document.createElementNS(svgNS, 'circle');
  track.setAttribute('cx', cx);
  track.setAttribute('cy', cy);
  track.setAttribute('r', radius);
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke', 'rgba(255,255,255,0.08)');
  track.setAttribute('stroke-width', strokeWidth);
  svg.appendChild(track);

  // Progress arc
  const arc = document.createElementNS(svgNS, 'circle');
  arc.setAttribute('cx', cx);
  arc.setAttribute('cy', cy);
  arc.setAttribute('r', radius);
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', color);
  arc.setAttribute('stroke-width', strokeWidth);
  arc.setAttribute('stroke-linecap', 'round');
  arc.setAttribute('stroke-dasharray', circumference);

  // Start fully hidden, animate in
  const initialOffset = circumference;
  arc.setAttribute('stroke-dashoffset', initialOffset);
  arc.style.transition = animated ? 'stroke-dashoffset 600ms ease' : 'none';

  svg.appendChild(arc);
  container.appendChild(svg);

  // ── Center label ───────────────────────────────────────────
  const labelEl = document.createElement('span');
  labelEl.style.cssText = `
    position: absolute;
    font-family: var(--font-heading);
    font-size: ${Math.max(size * 0.16, 11)}px;
    font-weight: 600;
    color: var(--color-text);
    text-align: center;
    line-height: 1.2;
    max-width: ${size - strokeWidth * 2 - 8}px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
  labelEl.textContent = label;
  container.appendChild(labelEl);

  // ── Apply initial progress ─────────────────────────────────
  function applyProgress(value) {
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference * (1 - clamped / 100);
    arc.setAttribute('stroke-dashoffset', offset);
  }

  // Animate on mount — need a frame delay for CSS transition
  if (animated && progress > 0) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        applyProgress(progress);
      });
    });
  } else {
    applyProgress(progress);
  }

  // ── Public API ─────────────────────────────────────────────

  /**
   * Update the progress value and optionally the label.
   * @param {number} value - Progress 0-100
   * @param {string} [newLabel] - Optional new label text
   */
  function setProgress(value, newLabel) {
    applyProgress(value);
    if (newLabel !== undefined) {
      labelEl.textContent = newLabel;
    }
  }

  return {
    element: container,
    setProgress,
  };
}
