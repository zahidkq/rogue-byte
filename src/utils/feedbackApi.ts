export interface FeedbackPayload {
  rating: number; // 1 to 5
  sentiment?: string;
  category: 'Bug Report' | 'Feature Suggestion' | 'General Feedback';
  message: string;
  playerName?: string;
  email?: string;
  timestamp?: number;
  runTelemetry?: {
    floor?: number;
    score?: number;
    gold?: number;
  };
}

export const FEEDBACK_TTL_SECONDS = 172800; // 2 days (48 hours)
export const FEEDBACK_TTL_MS = FEEDBACK_TTL_SECONDS * 1000;
export const MAX_FEEDBACKS_PER_WINDOW = 2;

const COOKIE_NAME = 'zenexis_fb_count';
const STORAGE_KEY = 'zenexis_feedback_record';

export interface StoredFeedbackRecord {
  count: number;
  expiresAt: number;
}

/**
 * Retrieves the current feedback submission count for the user.
 * Automatically checks and clears expired entries according to the 2-day TTL.
 */
export function getFeedbackRecord(): StoredFeedbackRecord {
  const now = Date.now();
  let cookieCount = 0;
  let cookieExpiresAt = 0;

  // 1. Read from document.cookie
  if (typeof document !== 'undefined' && document.cookie) {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      const rawVal = decodeURIComponent(match.split('=')[1] || '');
      const parts = rawVal.split(':');
      cookieCount = parseInt(parts[0], 10) || 0;
      cookieExpiresAt = parseInt(parts[1], 10) || 0;

      if (cookieExpiresAt > 0 && now > cookieExpiresAt) {
        cookieCount = 0;
        cookieExpiresAt = 0;
        document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
      }
    }
  }

  // 2. Read from localStorage (dual-storage safeguard)
  let storageCount = 0;
  let storageExpiresAt = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredFeedbackRecord;
        if (parsed.expiresAt && now > parsed.expiresAt) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          storageCount = parsed.count || 0;
          storageExpiresAt = parsed.expiresAt || 0;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }

  const effectiveCount = Math.max(cookieCount, storageCount);
  const effectiveExpiresAt = Math.max(cookieExpiresAt, storageExpiresAt) || (now + FEEDBACK_TTL_MS);

  return {
    count: effectiveCount,
    expiresAt: effectiveExpiresAt,
  };
}

export function getFeedbackCount(): number {
  return getFeedbackRecord().count;
}

export function getRemainingFeedbacks(): number {
  const current = getFeedbackCount();
  return Math.max(0, MAX_FEEDBACKS_PER_WINDOW - current);
}

export function canSubmitFeedback(): boolean {
  return getRemainingFeedbacks() > 0;
}

/**
 * Increments the submission counter and saves to both cookie and localStorage with 2-day TTL.
 */
export function recordFeedbackSubmission(): number {
  const current = getFeedbackRecord();
  const nextCount = current.count + 1;
  const now = Date.now();
  const expiresAt = current.count === 0 ? now + FEEDBACK_TTL_MS : current.expiresAt;
  const remainingSeconds = Math.max(1, Math.floor((expiresAt - now) / 1000));

  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      `${nextCount}:${expiresAt}`
    )}; Path=/; Max-Age=${remainingSeconds}; SameSite=Lax`;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: nextCount, expiresAt }));
    } catch {
      // Ignore quota errors
    }
  }

  return nextCount;
}

/**
 * Secure submission handler that posts to the backend proxy /api/feedback.
 * The recipient email is never present in this client-side code or network calls.
 */
export async function submitFeedback(payload: FeedbackPayload): Promise<{
  success: boolean;
  message?: string;
  remaining?: number;
}> {
  if (!canSubmitFeedback()) {
    return {
      success: false,
      message: 'Feedback limit reached (maximum 2 submissions every 2 days).',
      remaining: 0,
    };
  }

  const completePayload = {
    ...payload,
    timestamp: Date.now(),
    submittedFrom: typeof window !== 'undefined' ? window.location.href : 'Zenexis App',
  };

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completePayload),
    });

    if (res.ok) {
      recordFeedbackSubmission();
      return {
        success: true,
        remaining: getRemainingFeedbacks(),
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.error || 'Server could not process feedback transmission.',
        remaining: getRemainingFeedbacks(),
      };
    }
  } catch (err) {
    // If backend endpoint is unreachable
    return {
      success: false,
      message: 'Network error connecting to feedback service. Please try again.',
      remaining: getRemainingFeedbacks(),
    };
  }
}
