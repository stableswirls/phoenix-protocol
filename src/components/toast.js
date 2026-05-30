/**
 * toast.js — Toast Notification System
 * Phoenix Protocol Design System
 *
 * Shows auto-dismissing toast notifications at the top of the screen.
 * Supports success, error, warning, and info types.
 *
 * @module components/toast
 */

/**
 * Returns an inline SVG icon for the given toast type.
 * @param {'success'|'error'|'warning'|'info'} type
 * @returns {string}
 */
function getToastIcon(type) {
  switch (type) {
    case 'success':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;
    case 'error':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`;
    case 'warning':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`;
    case 'info':
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`;
  }
}

/**
 * Returns the CSS class name suffix for the toast type.
 * @param {'success'|'error'|'warning'|'info'} type
 * @returns {string}
 */
function getToastClass(type) {
  switch (type) {
    case 'success': return 'toast-success';
    case 'error':   return 'toast-error';
    case 'warning': return 'toast-warning';
    case 'info':    return 'toast-info';
    default:        return '';
  }
}

/** @type {HTMLElement|null} Active toast element (for stacking avoidance) */
let activeToast = null;
let dismissTimeout = null;

/**
 * Shows a toast notification at the top of the screen.
 *
 * @param {string} message  - Text to display
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - Toast type
 * @param {number} [duration=3000] - Auto-dismiss time in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Remove any existing toast first
  if (activeToast) {
    clearTimeout(dismissTimeout);
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${getToastClass(type)}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Add info-specific border color (not in index.css)
  if (type === 'info') {
    toast.style.borderLeft = '3px solid #3B82F6';
  }

  // Icon
  const iconWrap = document.createElement('span');
  iconWrap.style.cssText = 'display: flex; align-items: center; flex-shrink: 0;';
  iconWrap.innerHTML = getToastIcon(type);
  toast.appendChild(iconWrap);

  // Message text
  const textEl = document.createElement('span');
  textEl.style.cssText = 'flex: 1; min-width: 0;';
  textEl.textContent = message;
  toast.appendChild(textEl);

  // Dismiss button
  const dismissBtn = document.createElement('button');
  dismissBtn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 200ms ease;
    margin-left: 4px;
  `;
  dismissBtn.setAttribute('aria-label', 'Dismiss notification');
  dismissBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
  dismissBtn.addEventListener('mouseenter', () => {
    dismissBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  });
  dismissBtn.addEventListener('mouseleave', () => {
    dismissBtn.style.backgroundColor = 'transparent';
  });
  dismissBtn.addEventListener('click', () => dismiss());
  toast.appendChild(dismissBtn);

  // ── Dismiss logic ──────────────────────────────────────────
  function dismiss() {
    toast.style.animation = 'none';
    toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => {
      toast.remove();
      if (activeToast === toast) activeToast = null;
    }, 200);
    clearTimeout(dismissTimeout);
  }

  // ── Mount ──────────────────────────────────────────────────
  document.body.appendChild(toast);
  activeToast = toast;

  // Auto-dismiss
  if (duration > 0) {
    dismissTimeout = setTimeout(() => dismiss(), duration);
  }
}
