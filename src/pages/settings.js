/**
 * settings.js — Settings (route: #/settings)
 *
 * User settings: profile, workout time, notifications,
 * data management, and about.
 */

import { getUserProfile, saveUserProfile, resetAllProgress } from '../db/database.js';

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
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

function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

// ─── Page Export ──────────────────────────────────────────────

export default async function SettingsPage() {
  const profile = await getUserProfile();
  const notifStatus = getNotificationStatus();

  const phaseNames = { 1: 'The Foundation', 2: 'The Builder', 3: 'The Shred' };
  const currentPhaseName = phaseNames[profile.currentPhase] || `Phase ${profile.currentPhase}`;

  return `
    <div class="page">
      <div class="container">
        <h1 class="heading-lg" style="padding: 16px 0 24px;">Settings</h1>

        <!-- Profile Section -->
        <div class="card">
          <div class="flex items-center gap-md mb-md">
            <div style="
              width: 48px; height: 48px; border-radius: 50%;
              background: var(--color-fire-gradient);
              display: flex; align-items: center; justify-content: center;
              font-size: 24px;
            ">🔥</div>
            <div>
              <div class="heading-sm">Phoenix Athlete</div>
              <div class="text-xs text-muted">Since ${formatDate(profile.startDate)}</div>
            </div>
          </div>
          <div class="divider" style="margin: 12px 0;"></div>
          <div class="flex-between">
            <span class="text-sm text-muted">Current Phase</span>
            <span class="text-sm" style="font-weight: 600;">${currentPhaseName}</span>
          </div>
        </div>

        <!-- Workout Time -->
        <div class="card mt-md">
          <h3 class="heading-sm mb-md">⏰ Workout Time</h3>
          <div class="flex-between items-center gap-md">
            <div class="flex-1">
              <input type="time" class="input" id="workout-time-input"
                value="${profile.reminderTime || '07:00'}"
                style="font-size: 1.125rem; padding: 14px 16px;">
            </div>
            <button class="btn btn-primary" id="save-time-btn" style="min-height: 48px;">
              Save
            </button>
          </div>
          <div class="text-xs text-muted mt-sm">
            ${profile.reminderTime ? `Currently set to ${profile.reminderTime}` : 'Set your preferred workout time'}
          </div>
        </div>

        <!-- Notifications -->
        <div class="card mt-md">
          <h3 class="heading-sm mb-md">🔔 Notifications</h3>

          <!-- Toggle -->
          <div class="flex-between items-center" style="padding: 8px 0; min-height: 44px;">
            <span class="text-sm">Enable Reminders</span>
            <label style="
              position: relative; display: inline-block;
              width: 52px; height: 28px; cursor: pointer;
            ">
              <input type="checkbox" id="reminder-toggle"
                ${profile.reminderEnabled ? 'checked' : ''}
                style="opacity: 0; width: 0; height: 0;">
              <span id="toggle-track" style="
                position: absolute; inset: 0;
                background: ${profile.reminderEnabled ? 'var(--color-accent)' : 'var(--color-surface-2)'};
                border-radius: 14px; transition: background 200ms ease;
              "></span>
              <span id="toggle-thumb" style="
                position: absolute;
                left: ${profile.reminderEnabled ? '26px' : '3px'};
                top: 3px;
                width: 22px; height: 22px;
                background: #fff;
                border-radius: 50%;
                transition: left 200ms ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></span>
            </label>
          </div>

          <div class="divider" style="margin: 8px 0;"></div>

          <!-- Permission button -->
          ${notifStatus === 'default' ? `
            <button class="btn btn-outline btn-full mt-sm" id="allow-notifications-btn" style="min-height: 44px;">
              🔔 Allow Notifications
            </button>
          ` : notifStatus === 'granted' ? `
            <div class="flex items-center gap-sm" style="padding: 8px 0;">
              <span style="color: var(--color-accent);">✓</span>
              <span class="text-sm text-accent">Notifications enabled</span>
            </div>
          ` : notifStatus === 'denied' ? `
            <div class="flex items-center gap-sm" style="padding: 8px 0;">
              <span style="color: var(--color-danger);">✗</span>
              <span class="text-sm text-danger">Notifications blocked in browser settings</span>
            </div>
          ` : `
            <div class="text-sm text-muted" style="padding: 8px 0;">
              Notifications not supported in this browser.
            </div>
          `}

          <!-- Test notification -->
          ${notifStatus === 'granted' ? `
            <button class="btn btn-ghost btn-full mt-sm" id="test-notification-btn" style="min-height: 44px;">
              📬 Test Notification
            </button>
          ` : ''}

          <div class="text-xs text-muted mt-md" style="line-height: 1.4;">
            You'll receive a reminder 15 minutes before and at your scheduled workout time.
          </div>
        </div>

        <!-- Data -->
        <div class="card mt-md">
          <h3 class="heading-sm mb-md">📊 Data</h3>
          <button class="btn btn-danger btn-full" id="reset-progress-btn" style="min-height: 48px;">
            🗑️ Reset All Progress
          </button>
          <div class="text-xs text-muted mt-sm text-center">
            This will delete all workout data and reset to Phase 1. This cannot be undone.
          </div>
        </div>

        <!-- About -->
        <div class="card mt-md mb-xl">
          <h3 class="heading-sm mb-md">About</h3>
          <div class="flex-between" style="padding: 4px 0;">
            <span class="text-sm text-muted">App</span>
            <span class="text-sm">Phoenix Protocol</span>
          </div>
          <div class="flex-between" style="padding: 4px 0;">
            <span class="text-sm text-muted">Version</span>
            <span class="text-sm">1.0.0</span>
          </div>
          <div class="divider" style="margin: 8px 0;"></div>
          <div class="text-center">
            <p class="text-xs text-muted">
              Rise from the Ashes. Built with 🔥 and vanilla JavaScript.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setup() {
  // Save workout time
  const saveTimeBtn = document.getElementById('save-time-btn');
  if (saveTimeBtn) {
    saveTimeBtn.addEventListener('click', async () => {
      const timeInput = document.getElementById('workout-time-input');
      if (!timeInput) return;
      const profile = await getUserProfile();
      profile.reminderTime = timeInput.value;
      await saveUserProfile(profile);
      showToast('Workout time saved! ⏰');
    });
  }

  // Reminder toggle
  const reminderToggle = document.getElementById('reminder-toggle');
  const toggleTrack = document.getElementById('toggle-track');
  const toggleThumb = document.getElementById('toggle-thumb');
  if (reminderToggle) {
    reminderToggle.addEventListener('change', async () => {
      const enabled = reminderToggle.checked;
      if (toggleTrack) toggleTrack.style.background = enabled ? 'var(--color-accent)' : 'var(--color-surface-2)';
      if (toggleThumb) toggleThumb.style.left = enabled ? '26px' : '3px';

      const profile = await getUserProfile();
      profile.reminderEnabled = enabled;
      await saveUserProfile(profile);
      showToast(enabled ? 'Reminders enabled 🔔' : 'Reminders disabled');
    });
  }

  // Allow notifications
  const allowBtn = document.getElementById('allow-notifications-btn');
  if (allowBtn) {
    allowBtn.addEventListener('click', async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showToast('Notifications enabled! 🎉');
          // Refresh page to update UI
          setTimeout(() => {
            window.location.hash = '/settings';
            window.location.reload();
          }, 1000);
        } else {
          showToast('Notification permission denied', 'warning');
        }
      } catch (e) {
        console.error('[Settings] Notification permission error:', e);
        showToast('Could not request permission', 'error');
      }
    });
  }

  // Test notification
  const testBtn = document.getElementById('test-notification-btn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      if (Notification.permission === 'granted') {
        new Notification('🔥 Phoenix Protocol', {
          body: 'Test notification — reminders are working!',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
        showToast('Test notification sent! 📬');
      }
    });
  }

  // Reset progress
  const resetBtn = document.getElementById('reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Show confirmation modal
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'reset-modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3 class="heading-sm">Reset All Progress?</h3>
          </div>
          <div class="modal-body">
            <p class="text-sm text-muted">
              This will permanently delete all your workout history, walk/run sessions, and phase progress. You'll start fresh from Phase 1.
            </p>
            <p class="text-sm text-danger" style="margin-top: 12px; font-weight: 600;">
              This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="reset-cancel-btn" style="min-height: 44px;">Cancel</button>
            <button class="btn btn-danger" id="reset-confirm-btn" style="min-height: 44px;">Delete Everything</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Cancel
      document.getElementById('reset-cancel-btn').addEventListener('click', () => {
        overlay.remove();
      });

      // Clicking overlay background
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      // Confirm
      document.getElementById('reset-confirm-btn').addEventListener('click', async () => {
        try {
          await resetAllProgress();
          overlay.remove();
          showToast('All progress reset. Fresh start! 🔥');
          setTimeout(() => {
            window.location.hash = '/';
            window.location.reload();
          }, 1200);
        } catch (e) {
          console.error('[Settings] Reset failed:', e);
          showToast('Failed to reset progress', 'error');
        }
      });
    });
  }
}
