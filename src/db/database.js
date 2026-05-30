/**
 * database.js — IndexedDB Database Layer for Phoenix Protocol
 *
 * Uses the `idb` library for a promise-based IndexedDB wrapper.
 * Manages all persistent data: user profile, sessions, walk/run
 * activities, phase progress, and aggregate stats.
 *
 * Database: 'phoenix-protocol-db' v1
 * Stores:
 *   - userProfile   (keyPath: 'id')
 *   - sessions      (keyPath: 'id', autoIncrement, indexes: date, phaseId)
 *   - walkRunSessions (keyPath: 'id', autoIncrement, indexes: date)
 *   - phaseProgress  (keyPath: 'phaseId')
 */

import { openDB } from 'idb';

const DB_NAME = 'phoenix-protocol-db';
const DB_VERSION = 1;

/** @type {import('idb').IDBPDatabase | null} */
let dbInstance = null;

// ─── Default User Profile ────────────────────────────────────────────
const DEFAULT_PROFILE = {
  id: 'default',
  currentPhase: 1,
  startDate: new Date().toISOString(),
  reminderTime: '07:00',       // Legacy — kept for backward compat
  workoutTime: '07:00',        // Preferred workout time (HH:MM)
  reminderEnabled: true,
  createdAt: new Date().toISOString(),
};

// ─── Database Initialization ─────────────────────────────────────────

/**
 * Opens (or creates) the IndexedDB database and returns the instance.
 * Subsequent calls return the cached connection.
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
export async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // User Profile store
      if (!db.objectStoreNames.contains('userProfile')) {
        db.createObjectStore('userProfile', { keyPath: 'id' });
      }

      // Completed workout sessions
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sessionStore.createIndex('date', 'date', { unique: false });
        sessionStore.createIndex('phaseId', 'phaseId', { unique: false });
      }

      // Walk / Run activity sessions
      if (!db.objectStoreNames.contains('walkRunSessions')) {
        const walkRunStore = db.createObjectStore('walkRunSessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        walkRunStore.createIndex('date', 'date', { unique: false });
      }

      // Phase-level progress tracking
      if (!db.objectStoreNames.contains('phaseProgress')) {
        db.createObjectStore('phaseProgress', { keyPath: 'phaseId' });
      }
    },
  });

  return dbInstance;
}

// ─── Internal Helper ─────────────────────────────────────────────────

/**
 * Ensures the database is initialised before any read/write.
 * @returns {Promise<import('idb').IDBPDatabase>}
 */
async function getDB() {
  if (!dbInstance) await initDB();
  return dbInstance;
}

// ─── User Profile ────────────────────────────────────────────────────

/**
 * Retrieves the user profile. If none exists yet a default profile is
 * created, persisted, and returned.
 * @returns {Promise<Object>}
 */
export async function getUserProfile() {
  try {
    const db = await getDB();
    let profile = await db.get('userProfile', 'default');

    if (!profile) {
      profile = { ...DEFAULT_PROFILE };
      await db.put('userProfile', profile);
    }

    return profile;
  } catch (err) {
    console.error('[DB] getUserProfile failed:', err);
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Saves (upserts) the user profile.
 * @param {Object} profile — must include `id` (usually 'default')
 * @returns {Promise<void>}
 */
export async function saveUserProfile(profile) {
  try {
    const db = await getDB();
    await db.put('userProfile', { ...profile, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[DB] saveUserProfile failed:', err);
    throw err;
  }
}

// ─── Workout Sessions ────────────────────────────────────────────────

/**
 * Saves a completed workout session.
 * @param {Object} session — { date, phaseId, exercises, duration, completedAt }
 *   exercises: [{ exerciseId, setsCompleted, repsPerSet, notes }]
 * @returns {Promise<number>} The auto-generated session id
 */
export async function saveSession(session) {
  try {
    const db = await getDB();
    const record = {
      ...session,
      completedAt: session.completedAt || new Date().toISOString(),
    };
    const id = await db.add('sessions', record);
    return id;
  } catch (err) {
    console.error('[DB] saveSession failed:', err);
    throw err;
  }
}

/**
 * Retrieves a session for a specific date string.
 * @param {string} dateStr — format 'YYYY-MM-DD'
 * @returns {Promise<Object|undefined>}
 */
export async function getSessionByDate(dateStr) {
  try {
    const db = await getDB();
    const allForDate = await db.getAllFromIndex('sessions', 'date', dateStr);
    return allForDate.length > 0 ? allForDate[0] : undefined;
  } catch (err) {
    console.error('[DB] getSessionByDate failed:', err);
    return undefined;
  }
}

/**
 * Returns every saved workout session, most recent first.
 * @returns {Promise<Object[]>}
 */
export async function getAllSessions() {
  try {
    const db = await getDB();
    const sessions = await db.getAll('sessions');
    return sessions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (err) {
    console.error('[DB] getAllSessions failed:', err);
    return [];
  }
}

/**
 * Returns sessions belonging to a specific phase.
 * @param {string|number} phaseId
 * @returns {Promise<Object[]>}
 */
export async function getSessionsByPhase(phaseId) {
  try {
    const db = await getDB();
    return await db.getAllFromIndex('sessions', 'phaseId', phaseId);
  } catch (err) {
    console.error('[DB] getSessionsByPhase failed:', err);
    return [];
  }
}

/**
 * Returns the number of sessions completed for a phase.
 * @param {string|number} phaseId
 * @returns {Promise<number>}
 */
export async function getSessionCountByPhase(phaseId) {
  try {
    const db = await getDB();
    const sessions = await db.getAllFromIndex('sessions', 'phaseId', phaseId);
    return sessions.length;
  } catch (err) {
    console.error('[DB] getSessionCountByPhase failed:', err);
    return 0;
  }
}

// ─── Walk / Run Sessions ─────────────────────────────────────────────

/**
 * Saves a walk or run session.
 * @param {Object} session — { date, duration, distance, pace, notes, type: 'walk'|'run' }
 * @returns {Promise<number>} The auto-generated session id
 */
export async function saveWalkRunSession(session) {
  try {
    const db = await getDB();
    const record = {
      ...session,
      completedAt: session.completedAt || new Date().toISOString(),
    };
    const id = await db.add('walkRunSessions', record);
    return id;
  } catch (err) {
    console.error('[DB] saveWalkRunSession failed:', err);
    throw err;
  }
}

/**
 * Returns all walk/run sessions, most recent first.
 * @returns {Promise<Object[]>}
 */
export async function getWalkRunSessions() {
  try {
    const db = await getDB();
    const sessions = await db.getAll('walkRunSessions');
    return sessions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch (err) {
    console.error('[DB] getWalkRunSessions failed:', err);
    return [];
  }
}

/**
 * Retrieves a walk/run session for a specific date.
 * @param {string} dateStr — 'YYYY-MM-DD'
 * @returns {Promise<Object|undefined>}
 */
export async function getWalkRunSessionByDate(dateStr) {
  try {
    const db = await getDB();
    const allForDate = await db.getAllFromIndex('walkRunSessions', 'date', dateStr);
    return allForDate.length > 0 ? allForDate[0] : undefined;
  } catch (err) {
    console.error('[DB] getWalkRunSessionByDate failed:', err);
    return undefined;
  }
}

// ─── Phase Progress ──────────────────────────────────────────────────

/**
 * Retrieves progress data for a specific phase.
 * @param {string|number} phaseId
 * @returns {Promise<Object|undefined>}
 */
export async function getPhaseProgress(phaseId) {
  try {
    const db = await getDB();
    return await db.get('phaseProgress', phaseId);
  } catch (err) {
    console.error('[DB] getPhaseProgress failed:', err);
    return undefined;
  }
}

/**
 * Saves (upserts) phase progress.
 * @param {Object} progress — { phaseId, weeksCompleted, totalSessions, graduationPassed, unlockedAt }
 * @returns {Promise<void>}
 */
export async function savePhaseProgress(progress) {
  try {
    const db = await getDB();
    await db.put('phaseProgress', {
      ...progress,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[DB] savePhaseProgress failed:', err);
    throw err;
  }
}

/**
 * Determines whether a phase is unlocked for the user.
 * Phase 1 is always unlocked. Subsequent phases require the previous
 * phase's graduation to be passed.
 * @param {number} phaseId — 1-based phase number
 * @returns {Promise<boolean>}
 */
export async function isPhaseUnlocked(phaseId) {
  try {
    // Phase 1 is always available
    if (phaseId <= 1) return true;

    const db = await getDB();
    const previousProgress = await db.get('phaseProgress', phaseId - 1);

    // Previous phase must exist and have graduation passed
    return previousProgress?.graduationPassed === true;
  } catch (err) {
    console.error('[DB] isPhaseUnlocked failed:', err);
    // Fail-safe: only phase 1 is unlocked on error
    return phaseId <= 1;
  }
}

/**
 * Marks a phase's graduation test as passed and unlocks the next phase.
 * @param {number} phaseId — the phase that was graduated
 * @returns {Promise<void>}
 */
export async function markGraduationPassed(phaseId) {
  try {
    const db = await getDB();
    const existing = await db.get('phaseProgress', phaseId);

    await db.put('phaseProgress', {
      phaseId,
      weeksCompleted: existing?.weeksCompleted || 0,
      totalSessions: existing?.totalSessions || 0,
      graduationPassed: true,
      unlockedAt: existing?.unlockedAt || new Date().toISOString(),
      graduatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[DB] markGraduationPassed failed:', err);
    throw err;
  }
}

// ─── Aggregate Stats ─────────────────────────────────────────────────

/**
 * Computes aggregate statistics across the entire workout history.
 * @returns {Promise<Object>} { totalSessions, totalDuration, currentPhase, longestStreak, avgSessionDuration, totalWalkRunSessions, totalWalkRunDuration }
 */
export async function getTotalStats() {
  try {
    const db = await getDB();
    const profile = await getUserProfile();
    const sessions = await db.getAll('sessions');
    const walkRuns = await db.getAll('walkRunSessions');

    // Total workout duration in seconds
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Average session duration
    const avgSessionDuration =
      sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;

    // Walk/run totals
    const totalWalkRunDuration = walkRuns.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalWalkRunDistance = walkRuns.reduce((sum, s) => sum + (s.distance || 0), 0);

    // Longest streak — calculated from consecutive unique workout dates
    const longestStreak = computeLongestStreak(sessions);

    return {
      totalSessions: sessions.length,
      totalDuration,
      avgSessionDuration,
      currentPhase: profile.currentPhase,
      longestStreak,
      totalWalkRunSessions: walkRuns.length,
      totalWalkRunDuration,
      totalWalkRunDistance,
    };
  } catch (err) {
    console.error('[DB] getTotalStats failed:', err);
    return {
      totalSessions: 0,
      totalDuration: 0,
      avgSessionDuration: 0,
      currentPhase: 1,
      longestStreak: 0,
      totalWalkRunSessions: 0,
      totalWalkRunDuration: 0,
      totalWalkRunDistance: 0,
    };
  }
}

/**
 * Computes the longest consecutive-day streak from a list of sessions.
 * Uses unique dates sorted chronologically.
 * @param {Object[]} sessions
 * @returns {number}
 */
function computeLongestStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Extract unique sorted dates
  const uniqueDates = [...new Set(sessions.map((s) => s.date).filter(Boolean))].sort();

  if (uniqueDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);

    // Difference in calendar days
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

// ─── Reset ───────────────────────────────────────────────────────────

/**
 * Wipes all data from every object store. Used for full progress reset.
 * @returns {Promise<void>}
 */
export async function resetAllProgress() {
  try {
    const db = await getDB();
    const tx = db.transaction(
      ['userProfile', 'sessions', 'walkRunSessions', 'phaseProgress'],
      'readwrite'
    );

    await Promise.all([
      tx.objectStore('userProfile').clear(),
      tx.objectStore('sessions').clear(),
      tx.objectStore('walkRunSessions').clear(),
      tx.objectStore('phaseProgress').clear(),
      tx.done,
    ]);
  } catch (err) {
    console.error('[DB] resetAllProgress failed:', err);
    throw err;
  }
}
