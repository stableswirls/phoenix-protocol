/**
 * week-calendar.js — Horizontal Week Calendar Component
 * Phoenix Protocol Design System
 *
 * Displays a 7-day horizontal strip showing the current week's workout
 * schedule with color-coded status for each day.
 *
 * @module components/week-calendar
 */

/**
 * Day name abbreviations for Mon-Sun display.
 * @type {string[]}
 */
const DAY_ABBREVS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Returns 'YYYY-MM-DD' for a Date in local time.
 * @param {Date} date
 * @returns {string}
 */
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the Monday of the week containing the given date.
 * @param {Date} date
 * @returns {Date}
 */
function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // JS getDay(): 0=Sun,1=Mon,...6=Sat → shift to Mon-based
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Builds the 7 day-objects for the current week (Mon–Sun).
 * @param {Date} referenceDate
 * @returns {{ date: Date, dateStr: string, dayIndex: number }[]}
 */
function buildWeekDays(referenceDate) {
  const monday = getMonday(referenceDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d,
      dateStr: toDateString(d),
      dayIndex: i, // 0=Mon ... 6=Sun
    });
  }
  return days;
}

/**
 * Determines the display status for a single day.
 *
 * @param {Object} params
 * @param {string} params.dateStr         - 'YYYY-MM-DD'
 * @param {Date}   params.date            - JS Date
 * @param {string} params.todayStr        - Today's date string
 * @param {boolean} params.isToday        - Whether this day is today
 * @param {boolean} params.isWorkoutDay   - Whether this day is a scheduled workout day
 * @param {boolean} params.isCompleted    - Whether a session exists for this date
 * @param {boolean} params.isPast         - Whether this day is before today
 * @returns {'completed'|'today-workout'|'today-rest'|'upcoming'|'missed'|'rest'}
 */
function getDayStatus({ isToday, isWorkoutDay, isCompleted, isPast }) {
  if (isCompleted) return 'completed';
  if (isToday && isWorkoutDay) return 'today-workout';
  if (isToday && !isWorkoutDay) return 'today-rest';
  if (!isPast && isWorkoutDay) return 'upcoming';
  if (isPast && isWorkoutDay && !isCompleted) return 'missed';
  return 'rest';
}

/**
 * Returns the visual styling config for a day status.
 * @param {string} status
 * @returns {{ bg: string, border: string, textColor: string, dotColor: string, glow: string, icon: string|null }}
 */
function getStatusStyle(status) {
  switch (status) {
    case 'completed':
      return {
        bg: 'rgba(34, 197, 94, 0.15)',
        border: '2px solid #22C55E',
        textColor: '#22C55E',
        dotColor: '',
        glow: '',
        icon: null,
      };
    case 'today-workout':
      return {
        bg: 'transparent',
        border: '2px solid #F97316',
        textColor: '#F97316',
        dotColor: '',
        glow: '0 0 12px rgba(249, 115, 22, 0.5)',
        icon: null,
      };
    case 'today-rest':
      return {
        bg: 'transparent',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        textColor: 'var(--color-text-muted)',
        dotColor: '',
        glow: '',
        icon: null,
      };
    case 'upcoming':
      return {
        bg: 'transparent',
        border: '2px solid transparent',
        textColor: 'var(--color-text-muted)',
        dotColor: 'rgba(249, 115, 22, 0.4)',
        glow: '',
        icon: null,
      };
    case 'missed':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: '2px solid transparent',
        textColor: '#EF4444',
        dotColor: '',
        glow: '',
        icon: 'x',
      };
    default: // rest
      return {
        bg: 'transparent',
        border: '2px solid transparent',
        textColor: 'var(--color-text-dim)',
        dotColor: '',
        glow: '',
        icon: null,
      };
  }
}

/**
 * Creates a horizontal week calendar element.
 *
 * @param {Object} [options]
 * @param {number}   [options.phaseId=1]       - Phase ID (for determining workout days)
 * @param {string[]} [options.sessions=[]]     - Array of completed date strings ('YYYY-MM-DD')
 * @param {Date}     [options.currentDate]     - Reference date (defaults to now)
 * @param {number[]} [options.workDays=[1,2,4,5]] - Scheduled workout days (1=Mon..7=Sun)
 *
 * @returns {HTMLElement}
 */
export function createWeekCalendar(options = {}) {
  const {
    sessions = [],
    currentDate = new Date(),
    workDays = [1, 2, 4, 5],
  } = options;

  const todayStr = toDateString(currentDate);
  const sessionSet = new Set(sessions);
  const weekDays = buildWeekDays(currentDate);

  // Convert workDays from 1-based Mon=1..Sun=7 to Mon-indexed 0..6
  const workDaySet = new Set(workDays.map((d) => (d - 1) % 7));

  // ── Container ──────────────────────────────────────────────
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    padding: 12px 8px;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.06);
    user-select: none;
    -webkit-user-select: none;
  `;

  weekDays.forEach(({ date, dateStr, dayIndex }) => {
    const isToday = dateStr === todayStr;
    const isPast = date < new Date(todayStr);
    const isWorkoutDay = workDaySet.has(dayIndex);
    const isCompleted = sessionSet.has(dateStr);

    const status = getDayStatus({ isToday, isWorkoutDay, isCompleted, isPast });
    const style = getStatusStyle(status);

    // Day column
    const dayCol = document.createElement('div');
    dayCol.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
    `;

    // Day abbreviation
    const dayLabel = document.createElement('span');
    dayLabel.style.cssText = `
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--color-text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;
    dayLabel.textContent = DAY_ABBREVS[dayIndex];
    dayCol.appendChild(dayLabel);

    // Circle with date number
    const circle = document.createElement('div');
    circle.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 200ms ease;
      background: ${style.bg};
      border: ${style.border};
      color: ${style.textColor};
      ${style.glow ? `box-shadow: ${style.glow};` : ''}
      position: relative;
    `;

    if (status === 'completed') {
      // Show checkmark instead of date
      circle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;
    } else if (status === 'missed') {
      // Show X mark
      circle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#EF4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`;
    } else {
      circle.textContent = date.getDate();
    }

    dayCol.appendChild(circle);

    // Dot indicator for upcoming workout days
    if (style.dotColor) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${style.dotColor};
      `;
      dayCol.appendChild(dot);
    } else {
      // Spacer to keep alignment consistent
      const spacer = document.createElement('div');
      spacer.style.cssText = 'width: 4px; height: 4px;';
      dayCol.appendChild(spacer);
    }

    container.appendChild(dayCol);
  });

  return container;
}
