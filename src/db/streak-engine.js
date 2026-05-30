/**
 * streak-engine.js — Workout Streak Calculator for Phoenix Protocol
 *
 * Determines the user's current workout streak by walking backwards
 * through calendar days and comparing scheduled workout days against
 * completed sessions. Includes a grace-period: the streak only breaks
 * after 3 consecutively-missed scheduled workout days.
 *
 * Depends on:
 *   - database.js  (session & profile data)
 *   - workouts.js  (phase schedule definitions)
 */

import { getAllSessions, getUserProfile } from './database.js';
import { PHOENIX_PROTOCOL } from '../data/workouts.js';

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Returns a 'YYYY-MM-DD' string for a Date object in local time.
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
 * Creates a new Date set to midnight (start of day) in local time.
 * @param {Date|string} input
 * @returns {Date}
 */
function startOfDay(input) {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the phase definition from PHOENIX_PROTOCOL.
 * Falls back to phase 1 if the requested phase doesn't exist.
 * @param {number} phaseId
 * @returns {Object}
 */
function getPhaseData(phaseId) {
  const phase = PHOENIX_PROTOCOL.phases.find((p) => p.id === phaseId);
  return phase || PHOENIX_PROTOCOL.phases[0];
}

// ─── Core: Is Workout Day? ──────────────────────────────────────────

/**
 * Checks whether a given date is a scheduled workout day for a phase.
 *
 * Uses the phase's `schedule.workDays` array which holds day-of-week
 * numbers: 0 = Sunday, 1 = Monday, …, 6 = Saturday.
 *
 * @param {Date|string} date — the date to check
 * @param {number} phaseId — phase identifier
 * @returns {boolean}
 */
export function isWorkoutDay(date, phaseId) {
  const phase = getPhaseData(phaseId);
  const dayOfWeek = new Date(date).getDay(); // 0-6

  // schedule.workDays is an array like [1, 3, 5] for Mon/Wed/Fri
  return phase.schedule?.workDays?.includes(dayOfWeek) ?? false;
}

// ─── Today Status ────────────────────────────────────────────────────

/**
 * Returns whether today is a 'workout' or 'rest' day for a phase.
 * @param {number} phaseId
 * @returns {'workout' | 'rest'}
 */
export function getTodayStatus(phaseId) {
  return isWorkoutDay(new Date(), phaseId) ? 'workout' : 'rest';
}

// ─── Scheduled Workout Days in Range ─────────────────────────────────

/**
 * Returns an array of 'YYYY-MM-DD' strings for every scheduled workout
 * day between startDate and endDate (inclusive).
 *
 * @param {number} phaseId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string[]}
 */
export function getScheduledWorkoutDays(phaseId, startDate, endDate) {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const days = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    if (isWorkoutDay(cursor, phaseId)) {
      days.push(toDateString(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

// ─── Streak Calculation ──────────────────────────────────────────────

/**
 * Calculates the current workout streak.
 *
 * Algorithm:
 *   1. Fetch the user's current phase to know the schedule.
 *   2. Fetch all completed sessions, build a Set of dates for O(1) lookup.
 *   3. Walk backwards from today through calendar days.
 *   4. For each day:
 *      - If it's a REST day → skip (doesn't affect streak).
 *      - If it's a WORKOUT day:
 *        • Session exists → increment streak, reset missed counter.
 *        • No session     → increment missedConsecutive.
 *        • If missedConsecutive >= 3 → streak is broken, stop.
 *   5. Cap the backwards walk at 365 days to avoid infinite loops.
 *
 * @returns {Promise<{
 *   currentStreak: number,
 *   bestStreak: number,
 *   lastWorkoutDate: string|null,
 *   missedDays: number,
 *   isStreakActive: boolean
 * }>}
 */
export async function calculateStreak() {
  try {
    const profile = await getUserProfile();
    const phaseId = profile.currentPhase || 1;
    const sessions = await getAllSessions();

    // Build a Set of dates that have completed sessions
    const sessionDates = new Set(sessions.map((s) => s.date).filter(Boolean));

    // Determine the last workout date
    const sortedDates = [...sessionDates].sort().reverse();
    const lastWorkoutDate = sortedDates.length > 0 ? sortedDates[0] : null;

    // Walk backwards from today
    const today = startOfDay(new Date());
    let currentStreak = 0;
    let missedConsecutive = 0;
    let totalMissed = 0;
    const MAX_LOOKBACK = 365;

    const cursor = new Date(today);
    for (let i = 0; i < MAX_LOOKBACK; i++) {
      const dateStr = toDateString(cursor);

      if (isWorkoutDay(cursor, phaseId)) {
        if (sessionDates.has(dateStr)) {
          // Completed — count it toward the streak
          currentStreak++;
          missedConsecutive = 0;
        } else {
          // Missed — increment the consecutive miss counter
          missedConsecutive++;
          totalMissed++;

          if (missedConsecutive >= 3) {
            // Grace period exhausted — streak is broken
            break;
          }
        }
      }
      // Rest days are simply skipped

      // Move to previous day
      cursor.setDate(cursor.getDate() - 1);
    }

    // Compute best streak from full history
    const bestStreak = computeBestStreakFromSessions(sessions, phaseId);

    // Streak is active if we haven't broken it (< 3 consecutive misses)
    const isStreakActive = missedConsecutive < 3 && currentStreak > 0;

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      lastWorkoutDate,
      missedDays: totalMissed,
      isStreakActive,
    };
  } catch (err) {
    console.error('[Streak] calculateStreak failed:', err);
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastWorkoutDate: null,
      missedDays: 0,
      isStreakActive: false,
    };
  }
}

// ─── Best Streak (Historical) ────────────────────────────────────────

/**
 * Computes the best (longest) streak across the entire workout history.
 * Uses the same scheduled-day + 3-miss-grace logic.
 *
 * @param {Object[]} sessions — all sessions
 * @param {number} phaseId — current phase (for schedule)
 * @returns {number}
 */
function computeBestStreakFromSessions(sessions, phaseId) {
  if (sessions.length === 0) return 0;

  const sessionDates = new Set(sessions.map((s) => s.date).filter(Boolean));
  const sorted = [...sessionDates].sort();

  if (sorted.length === 0) return 0;

  // Walk forward from the first session date to today
  const start = startOfDay(sorted[0]);
  const end = startOfDay(new Date());

  let best = 0;
  let current = 0;
  let missed = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = toDateString(cursor);

    if (isWorkoutDay(cursor, phaseId)) {
      if (sessionDates.has(dateStr)) {
        current++;
        missed = 0;
        best = Math.max(best, current);
      } else {
        missed++;
        if (missed >= 3) {
          current = 0;
          missed = 0;
        }
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return best;
}

/**
 * Convenience wrapper — returns just the best streak number.
 * @returns {Promise<number>}
 */
export async function getBestStreak() {
  const { bestStreak } = await calculateStreak();
  return bestStreak;
}

/**
 * Convenience wrapper — returns the date string of the most recent workout.
 * @returns {Promise<string|null>}
 */
export async function getLastWorkoutDate() {
  const { lastWorkoutDate } = await calculateStreak();
  return lastWorkoutDate;
}
