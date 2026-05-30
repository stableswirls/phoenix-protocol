/**
 * bottom-nav.js — Bottom Navigation Bar Component
 * Phoenix Protocol Design System
 *
 * Fixed bottom tab bar with SVG icons and active state indicator.
 * Navigates via hash-based routing.
 *
 * @module components/bottom-nav
 */

/**
 * Navigation tab definitions.
 * @type {{ label: string, route: string, icon: Function }[]}
 */
const NAV_TABS = [
  {
    label: 'Home',
    route: '#/',
    icon: () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/>
    </svg>`,
  },
  {
    label: 'Phases',
    route: '#/phases',
    icon: () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="2" width="16" height="6" rx="2"/>
      <rect x="2" y="10" width="20" height="6" rx="2"/>
      <rect x="6" y="18" width="12" height="4" rx="1"/>
    </svg>`,
  },
  {
    label: 'Activity',
    route: '#/walk-run',
    icon: () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="13" cy="4" r="2"/>
      <path d="M7 21l3-4"/>
      <path d="M16 21l-2-4-3-3 1-6"/>
      <path d="M6 12l2-3 4-1 3 3"/>
    </svg>`,
  },
  {
    label: 'History',
    route: '#/history',
    icon: () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
  },
  {
    label: 'Settings',
    route: '#/settings',
    icon: () => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z"/>
    </svg>`,
  },
];

/**
 * Matches a hash route to a tab route.
 * Handles exact matches and prefix matches for nested routes.
 *
 * @param {string} currentHash - Current window.location.hash
 * @param {string} tabRoute    - Tab's route pattern
 * @returns {boolean}
 */
function isActiveRoute(currentHash, tabRoute) {
  const current = currentHash || '#/';
  // Exact match
  if (current === tabRoute) return true;
  // Prefix match for sub-routes (e.g. #/phases/1 matches #/phases)
  if (tabRoute !== '#/' && current.startsWith(tabRoute + '/')) return true;
  return false;
}

/**
 * Creates the bottom navigation bar element.
 *
 * @param {string} [activeRoute='#/'] - The currently active route hash
 * @returns {HTMLElement}
 */
export function createBottomNav(activeRoute = '#/') {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  NAV_TABS.forEach((tab) => {
    const isActive = isActiveRoute(activeRoute, tab.route);

    const item = document.createElement('a');
    item.className = `bottom-nav-item${isActive ? ' active' : ''}`;
    item.href = tab.route;
    item.setAttribute('aria-label', tab.label);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');

    // Prevent default link behavior, use hash navigation
    item.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = tab.route.slice(1); // Remove the leading #
    });

    // Icon
    const iconWrap = document.createElement('span');
    iconWrap.style.cssText = 'display: flex; align-items: center; justify-content: center;';
    iconWrap.innerHTML = tab.icon();
    item.appendChild(iconWrap);

    // Label
    const labelEl = document.createElement('span');
    labelEl.textContent = tab.label;
    item.appendChild(labelEl);

    nav.appendChild(item);
  });

  return nav;
}
