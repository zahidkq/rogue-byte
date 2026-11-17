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

// Internal target recipient (MUST NOT be exposed on any user-facing UI)
const INTERNAL_TARGET_RECIPIENT = 'zahidkhanq10@gmail.com';

/**
 * Headless submission handler that forwards feedback to backend or headless provider
 */
export async function submitFeedback(payload: FeedbackPayload): Promise<{ success: boolean; message?: string }> {
  const completePayload = {
    ...payload,
    target: INTERNAL_TARGET_RECIPIENT,
    timestamp: Date.now(),
    submittedFrom: typeof window !== 'undefined' ? window.location.href : 'Zenexis App',
  };

  // Attempt local server endpoint first
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completePayload),
    });

    if (res.ok) {
      return { success: true };
    }
  } catch {
    // Continue to external headless fallback
  }

  // Headless web submission fallback (FormSubmit / Web3Forms compatible)
  try {
    const fallbackRes = await fetch(`https://formsubmit.co/ajax/${INTERNAL_TARGET_RECIPIENT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[Zenexis Feedback] ${payload.category} (${payload.rating} Stars)`,
        category: payload.category,
        rating: `${payload.rating} / 5 Stars`,
        playerName: payload.playerName || 'Anonymous Operative',
        email: payload.email || 'Not provided',
        message: payload.message,
        floor: payload.runTelemetry?.floor ?? 'N/A',
        score: payload.runTelemetry?.score ?? 'N/A',
        gold: payload.runTelemetry?.gold ?? 'N/A',
      }),
    });

    if (fallbackRes.ok) {
      return { success: true };
    }
  } catch {
    // Continue to store locally as safeguard
  }

  // Backup to localStorage so no user feedback is ever lost
  try {
    const key = 'zenexis_cached_feedback';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(completePayload);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // Ignore storage quota
  }

  return { success: true };
}
