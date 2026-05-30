/**
 * Phoenix Protocol — Main Entry Point
 * Bootstraps the app, registers routes, and sets up navigation.
 */

import './styles/index.css';
import router from './router.js';
import { initDB } from './db/database.js';
import { initReminders } from './services/reminders.js';
import * as DashboardPage from './pages/dashboard.js';
import * as SessionPage from './pages/session.js';
import * as PhaseDetailPage from './pages/phase-detail.js';
import * as WalkRunPage from './pages/walk-run.js';
import * as HistoryPage from './pages/history.js';
import * as SettingsPage from './pages/settings.js';
import * as GraduationPage from './pages/graduation.js';

// ─── Register Service Worker ─────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Phoenix] SW registered:', registration.scope);
    } catch (error) {
      console.warn('[Phoenix] SW registration failed:', error);
    }
  });
}

// ─── Bottom Navigation ───────────────────────────────────────

function createBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.id = 'bottom-nav';
  nav.innerHTML = `
    <a class="bottom-nav-item" data-route="/" href="#/">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </a>
    <a class="bottom-nav-item" data-route="/history" href="#/history">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>History</span>
    </a>
    <a class="bottom-nav-item" data-route="/walk-run" href="#/walk-run">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>
      <span>Walk/Run</span>
    </a>
    <a class="bottom-nav-item" data-route="/settings" href="#/settings">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      <span>Settings</span>
    </a>
  `;
  document.body.appendChild(nav);
}

function updateActiveNav() {
  const path = router.getCurrentPath();
  const items = document.querySelectorAll('.bottom-nav-item');

  items.forEach(item => {
    const route = item.dataset.route;
    const isActive = path === route || (route === '/' && path === '');
    item.classList.toggle('active', isActive);
  });

  // Hide nav during active workout sessions
  const nav = document.getElementById('bottom-nav');
  if (nav) {
    const isSession = path.startsWith('/session/');
    nav.style.display = isSession ? 'none' : '';
  }
}

// ─── Bootstrap App ───────────────────────────────────────────

async function bootstrap() {
  // Initialize database
  await initDB();

  // Register routes using page module pattern
  router
    .page('/', DashboardPage)
    .page('/phase/:id', PhaseDetailPage)
    .page('/session/:phaseId', SessionPage)
    .page('/walk-run', WalkRunPage)
    .page('/history', HistoryPage)
    .page('/settings', SettingsPage)
    .page('/graduation/:phaseId', GraduationPage);

  // Create bottom navigation
  createBottomNav();

  // Update active nav after each route change
  router.afterNavigate(() => {
    updateActiveNav();
  });

  // Initialize router
  router.init('#app');

  // Set initial active state
  updateActiveNav();

  // Initialize notification reminders (non-blocking)
  initReminders().catch(err => {
    console.warn('[Phoenix] Reminders init failed:', err);
  });

  console.log('[Phoenix] App bootstrapped ✓');
}

// Start the app
bootstrap().catch(err => {
  console.error('[Phoenix] Bootstrap failed:', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="page">
        <div class="container" style="padding-top: 100px; text-align: center;">
          <h1 class="heading-lg text-danger">Failed to Start</h1>
          <p class="text-muted" style="margin-top: 16px;">${err.message}</p>
          <button class="btn btn-primary" style="margin-top: 24px;" onclick="window.location.reload()">
            Retry
          </button>
        </div>
      </div>
    `;
  }
});
