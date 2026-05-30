/**
 * reminders.js — Notification & Reminder Service for Phoenix Protocol
 *
 * Manages workout time scheduling and push notifications on Android PWA.
 *
 * Features:
 *   • Set a preferred workout time (e.g. '07:00', '18:30')
 *   • Automatic pre-workout notification 15 min before
 *   • On-time notification when the workout should start
 *   • Skips rest days (integrates with streak-engine schedule)
 *   • In-app reminder banner for upcoming / missed workouts
 *   • All timeouts are cancellable and re-schedulable
 *
 * Depends on:
 *   - ../db/database.js  (user profile persistence)
 *   - ../db/streak-engine.js  (workout day schedule)
 */

import { getUserProfile, saveUserProfile } from '../db/database.js';
import { isWorkoutDay, getTodayStatus } from '../db/streak-engine.js';
import { getSessionByDate } from '../db/database.js';

// ─── Constants ───────────────────────────────────────────────────────

/** Minutes before workout time to send the pre-notification */
const PRE_NOTIFY_MINUTES = 15;

/** Notification icon path (relative to PWA root) */
const ICON_PATH = '/icons/icon-192.png';

/** Notification tag — newer notifications replace older ones with the same tag */
const NOTIFICATION_TAG = 'phoenix-reminder';

/** Vibration pattern for notifications [vibrate, pause, vibrate] in ms */
const VIBRATION_PATTERN = [200, 100, 200];

/** Default workout time if none is set */
const DEFAULT_WORKOUT_TIME = '07:00';

// ─── Internal State ──────────────────────────────────────────────────

/**
 * Stores active setTimeout IDs so they can be cancelled on reschedule or
 * when the user disables reminders.
 * @type {number[]}
 */
let scheduledTimeouts = [];

/**
 * In-memory cache of the last-read reminder settings to avoid repeated
 * IndexedDB lookups during the same session.
 * @type {{ time: string, enabled: boolean } | null}
 */
let settingsCache = null;

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Returns today's date as a 'YYYY-MM-DD' string in local time.
 * @returns {string}
 */
function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parses a 'HH:MM' time string into a Date object for today.
 * @param {string} timeStr — e.g. '07:00', '18:30'
 * @returns {Date}
 */
function parseTimeToday(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Calculates milliseconds from now until a given Date.
 * Returns a negative number if the target is in the past.
 * @param {Date} target
 * @returns {number}
 */
function msUntil(target) {
  return target.getTime() - Date.now();
}

// ─── Notification Support Checks ─────────────────────────────────────

/**
 * Checks whether the Notification API is available in this browser.
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Checks whether the user has already granted notification permission.
 * Returns false if the API isn't available at all.
 * @returns {boolean}
 */
export function isNotificationPermitted() {
  if (!isNotificationSupported()) return false;
  return Notification.permission === 'granted';
}

// ─── Permission ──────────────────────────────────────────────────────

/**
 * Requests notification permission from the user via the browser prompt.
 *
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 *   - 'granted'  → notifications will work
 *   - 'denied'   → user blocked; cannot re-prompt until they change browser settings
 *   - 'default'  → user dismissed the prompt without deciding
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('[Reminders] Notification API not supported in this browser.');
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    console.log(`[Reminders] Permission result: ${result}`);
    return result;
  } catch (err) {
    console.error('[Reminders] Permission request failed:', err);
    return 'default';
  }
}

// ─── Settings Persistence ────────────────────────────────────────────

/**
 * Loads reminder settings from the user profile, with fallback defaults.
 * Results are cached for the duration of the session.
 * @returns {Promise<{ time: string, enabled: boolean }>}
 */
async function loadSettings() {
  if (settingsCache) return settingsCache;

  try {
    const profile = await getUserProfile();
    settingsCache = {
      time: profile.reminderTime || DEFAULT_WORKOUT_TIME,
      enabled: profile.reminderEnabled !== false, // default to true
    };
  } catch (err) {
    console.error('[Reminders] Failed to load settings:', err);
    settingsCache = { time: DEFAULT_WORKOUT_TIME, enabled: true };
  }

  return settingsCache;
}

/**
 * Persists a settings change to the user profile and refreshes the cache.
 * @param {Partial<{ reminderTime: string, reminderEnabled: boolean }>} changes
 * @returns {Promise<void>}
 */
async function persistSettings(changes) {
  try {
    const profile = await getUserProfile();
    const updated = { ...profile, ...changes };
    await saveUserProfile(updated);

    // Refresh cache
    settingsCache = {
      time: updated.reminderTime || DEFAULT_WORKOUT_TIME,
      enabled: updated.reminderEnabled !== false,
    };
  } catch (err) {
    console.error('[Reminders] Failed to persist settings:', err);
    throw err;
  }
}

// ─── Public Settings API ─────────────────────────────────────────────

/**
 * Sets the user's preferred workout time and reschedules today's
 * notifications accordingly.
 *
 * @param {string} timeStr — 24-hour format, e.g. '07:00', '18:30'
 * @returns {Promise<void>}
 */
export async function setWorkoutTime(timeStr) {
  // Validate format
  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    throw new Error(`Invalid time format "${timeStr}". Expected HH:MM.`);
  }

  const [h, m] = timeStr.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error(`Time out of range: "${timeStr}".`);
  }

  await persistSettings({ reminderTime: timeStr });
  console.log(`[Reminders] Workout time set to ${timeStr}`);

  // Reschedule with the new time
  const settings = await loadSettings();
  if (settings.enabled) {
    cancelAllScheduled();
    await scheduleToday();
  }
}

/**
 * Returns the current workout time setting.
 * @returns {Promise<string>} e.g. '07:00'
 */
export async function getWorkoutTime() {
  const settings = await loadSettings();
  return settings.time;
}

/**
 * Enables or disables reminder notifications.
 * When disabled, all pending notifications are cancelled.
 *
 * @param {boolean} enabled
 * @returns {Promise<void>}
 */
export async function setRemindersEnabled(enabled) {
  await persistSettings({ reminderEnabled: !!enabled });
  console.log(`[Reminders] Reminders ${enabled ? 'enabled' : 'disabled'}`);

  if (enabled) {
    await scheduleToday();
  } else {
    cancelAllScheduled();
  }
}

/**
 * Returns whether reminders are currently enabled.
 * @returns {Promise<boolean>}
 */
export async function areRemindersEnabled() {
  const settings = await loadSettings();
  return settings.enabled;
}

// ─── Notification Dispatch ───────────────────────────────────────────

/**
 * Fires a notification immediately using the Notification API.
 * Falls back gracefully if permissions are missing or the API is
 * unavailable.
 *
 * @param {string} title — notification title
 * @param {string} body  — notification body text
 * @param {string} [tag]  — notification tag for deduplication
 */
export function sendNotification(title, body, tag = NOTIFICATION_TAG) {
  if (!isNotificationSupported()) {
    console.warn('[Reminders] Notifications not supported — skipping.');
    return;
  }

  if (!isNotificationPermitted()) {
    console.warn('[Reminders] Notifications not permitted — skipping.');
    return;
  }

  try {
    const options = {
      body,
      icon: ICON_PATH,
      tag,
      renotify: true, // re-alert even if same tag replaces an existing one
      requireInteraction: false,
      silent: false,
    };

    // Add vibration if the API is available
    if ('vibrate' in navigator) {
      options.vibrate = VIBRATION_PATTERN;
    }

    const notification = new Notification(title, options);

    // Auto-close after 10 seconds to be unobtrusive
    notification.addEventListener('show', () => {
      setTimeout(() => notification.close(), 10_000);
    });

    // Navigate to app on click
    notification.addEventListener('click', () => {
      window.focus();
      notification.close();
    });

    console.log(`[Reminders] Notification sent: "${title}"`);
  } catch (err) {
    console.error('[Reminders] Failed to send notification:', err);
  }
}

// ─── Scheduling Engine ───────────────────────────────────────────────

/**
 * Schedules today's workout notifications based on the saved workout time
 * and the current phase's workout schedule.
 *
 * This is the core scheduling function. It:
 *   1. Cancels any previously scheduled timeouts.
 *   2. Checks if today is a workout day; exits early on rest days.
 *   3. Computes delays for the pre-notification and on-time notification.
 *   4. Registers setTimeout callbacks for each that hasn't already passed.
 *
 * @returns {Promise<void>}
 */
export async function scheduleToday() {
  // Always start fresh — clear stale timers
  cancelAllScheduled();

  try {
    const settings = await loadSettings();

    if (!settings.enabled) {
      console.log('[Reminders] Reminders disabled — skipping schedule.');
      return;
    }

    // Determine the user's current phase
    const profile = await getUserProfile();
    const phaseId = profile.currentPhase || 1;
    const todayStatus = getTodayStatus(phaseId);

    if (todayStatus === 'rest') {
      console.log('[Reminders] Today is a rest day — no notifications scheduled.');
      return;
    }

    // Calculate target times
    const workoutDate = parseTimeToday(settings.time);
    const preNotifyDate = new Date(workoutDate.getTime() - PRE_NOTIFY_MINUTES * 60 * 1000);

    const now = Date.now();

    // ── Pre-notification (15 min before) ──
    const msUntilPre = preNotifyDate.getTime() - now;
    if (msUntilPre > 0) {
      const preId = setTimeout(() => {
        sendNotification(
          'Get Ready! 💪',
          'Your Phoenix Protocol workout starts in 15 minutes. Hydrate!'
        );
      }, msUntilPre);

      scheduledTimeouts.push(preId);
      console.log(
        `[Reminders] Pre-notification scheduled in ${Math.round(msUntilPre / 60_000)} min`
      );
    } else {
      console.log('[Reminders] Pre-notification time already passed — skipping.');
    }

    // ── On-time notification ──
    const msUntilWorkout = workoutDate.getTime() - now;
    if (msUntilWorkout > 0) {
      const mainId = setTimeout(() => {
        sendNotification(
          'Time to Rise! 🔥',
          "Your workout is starting now. Let's go!"
        );
      }, msUntilWorkout);

      scheduledTimeouts.push(mainId);
      console.log(
        `[Reminders] Main notification scheduled in ${Math.round(msUntilWorkout / 60_000)} min`
      );
    } else {
      console.log('[Reminders] Workout time already passed — skipping main notification.');
    }

    if (scheduledTimeouts.length === 0) {
      console.log('[Reminders] No notifications scheduled (all times passed).');
    }
  } catch (err) {
    console.error('[Reminders] scheduleToday failed:', err);
  }
}

/**
 * Cancels all pending scheduled notifications by clearing every stored
 * timeout ID. Safe to call even when no timers are active.
 */
export function cancelAllScheduled() {
  if (scheduledTimeouts.length === 0) return;

  scheduledTimeouts.forEach((id) => clearTimeout(id));
  console.log(`[Reminders] Cancelled ${scheduledTimeouts.length} scheduled notification(s).`);
  scheduledTimeouts = [];
}

// ─── In-App Reminder Check ───────────────────────────────────────────

/**
 * Evaluates whether to show an in-app reminder banner based on the
 * current time relative to the workout time.
 *
 * Returns a descriptor object when a banner should be shown, or null
 * when no reminder is needed.
 *
 * Cases:
 *   1. Today is a rest day → null (no banner)
 *   2. Workout is within the next 60 minutes → "Workout in X minutes"
 *   3. Workout time has passed & no session logged → "You haven't worked out yet today!"
 *   4. Otherwise → null
 *
 * @returns {Promise<{ show: boolean, message: string, minutesUntil: number } | null>}
 */
export async function checkInAppReminder() {
  try {
    const settings = await loadSettings();
    const profile = await getUserProfile();
    const phaseId = profile.currentPhase || 1;

    // No reminder on rest days
    if (getTodayStatus(phaseId) === 'rest') {
      return null;
    }

    const workoutDate = parseTimeToday(settings.time);
    const now = new Date();
    const diffMs = workoutDate.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60_000);

    // Case: workout is upcoming within the next 60 minutes
    if (diffMinutes > 0 && diffMinutes <= 60) {
      return {
        show: true,
        message: `Workout in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`,
        minutesUntil: diffMinutes,
      };
    }

    // Case: workout time has already passed today
    if (diffMinutes <= 0) {
      // Check if a session was already logged today
      const todayStr = todayDateString();
      const todaySession = await getSessionByDate(todayStr);

      if (!todaySession) {
        return {
          show: true,
          message: "You haven't worked out yet today!",
          minutesUntil: -1,
        };
      }
    }

    // No banner needed
    return null;
  } catch (err) {
    console.error('[Reminders] checkInAppReminder failed:', err);
    return null;
  }
}

// ─── Initialization ──────────────────────────────────────────────────

/**
 * Initialises the reminder system. Should be called once when the app
 * starts (e.g. from main.js).
 *
 * Steps:
 *   1. Load saved settings from the user profile.
 *   2. If reminders are enabled, schedule today's notifications.
 *   3. Log the current state for debugging.
 *
 * Does NOT request permission automatically — that should be triggered
 * by a user action to comply with browser best practices.
 *
 * @returns {Promise<void>}
 */
export async function initReminders() {
  try {
    const settings = await loadSettings();

    console.log(
      `[Reminders] Initialised — time: ${settings.time}, enabled: ${settings.enabled}`
    );

    if (settings.enabled) {
      await scheduleToday();
    }
  } catch (err) {
    console.error('[Reminders] Initialisation failed:', err);
  }
}
