import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  Loader2,
  MessageSquare,
  Send,
  Star,
  X,
} from 'lucide-react';
import { submitFeedback } from '../utils/feedbackApi';

interface FeedbackModalProps {
  onClose: () => void;
  runTelemetry?: {
    floor?: number;
    score?: number;
    gold?: number;
  };
  initialPlayerName?: string;
}

const EMOJI_SENTIMENTS = [
  { rating: 1, emoji: '😡', label: 'Frustrated' },
  { rating: 2, emoji: '🙁', label: 'Needs Polish' },
  { rating: 3, emoji: '😐', label: 'Decent' },
  { rating: 4, emoji: '😊', label: 'Enjoyable' },
  { rating: 5, emoji: '🤩', label: 'Amazing!' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  onClose,
  runTelemetry,
  initialPlayerName = '',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'General Feedback' | 'Bug Report' | 'Feature Suggestion'>(
    'General Feedback'
  );
  const [message, setMessage] = useState('');
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Please enter a brief note or thought before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const sentiment = EMOJI_SENTIMENTS.find((s) => s.rating === rating)?.label;

    try {
      await submitFeedback({
        rating,
        sentiment,
        category,
        message: message.trim(),
        playerName: playerName.trim() || undefined,
        email: email.trim() || undefined,
        runTelemetry,
      });

      setIsSubmitted(true);
    } catch {
      setErrorMsg('Submission encountered an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#060e20]/88 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Send in-app feedback"
    >
      <div className="w-full max-w-lg rounded-lg bg-[#0f172a] border border-[#06b6d4]/50 shadow-[0_0_28px_rgba(6,182,212,0.18),0_18px_45px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#131b2e] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#060e20] border border-[#06b6d4]/40 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-[#4cd7f6]" />
            </div>
            <div>
              <p className="text-xs font-mono text-[#4cd7f6]">Direct Developer Line</p>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#dae2fd]">
                Zenexis Field Feedback
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] bg-[#060e20] border border-white/10 text-[#a08e7a] hover:text-[#dae2fd] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 bg-[#0b1326] overflow-y-auto flex-1 min-h-0">
          {isSubmitted ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-full bg-[#10b981]/20 border border-[#10b981]/50 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8 text-[#6ee7b7]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-lg font-bold text-[#dae2fd]">
                  Transmission Received!
                </h3>
                <p className="text-xs sm:text-sm text-[#6ee7b7] max-w-sm leading-relaxed">
                  Thank you for playing Zenexis! Your feedback has been sent directly to the development team.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-[4px] bg-[#06b6d4]/20 border border-[#06b6d4] text-[#4cd7f6] font-display text-xs font-bold uppercase tracking-wide hover:bg-[#06b6d4]/30 transition-all cursor-pointer"
              >
                Back to Game
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Rating Selector (Stars + Emoji Sentiment) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#a08e7a] flex items-center justify-between">
                  <span>How was your expedition experience?</span>
                  <span className="text-[#ffc174] font-semibold">{rating} / 5 Stars</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {EMOJI_SENTIMENTS.map((item) => {
                    const isSelected = rating === item.rating;
                    return (
                      <button
                        key={item.rating}
                        type="button"
                        onClick={() => setRating(item.rating)}
                        className={`p-2 rounded-[4px] border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f59e0b]/20 border-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-[#131b2e] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{item.emoji}</span>
                        <div className="flex items-center gap-0.5">
                          <Star
                            className={`w-3 h-3 ${
                              isSelected
                                ? 'text-[#ffc174] fill-[#ffc174]'
                                : 'text-[#a08e7a]'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? 'text-[#ffc174] font-bold' : 'text-[#a08e7a]'
                            }`}
                          >
                            {item.rating}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-[#a08e7a]">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      'General Feedback',
                      'Bug Report',
                      'Feature Suggestion',
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-2 rounded-[4px] border text-xs font-mono text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#4cd7f6] font-semibold'
                          : 'bg-[#131b2e] border-white/10 text-[#a08e7a] hover:text-[#dae2fd]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thoughts Textarea */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fb-message" className="text-xs font-mono text-[#a08e7a]">
                  Your Thoughts &amp; Observations
                </label>
                <textarea
                  id="fb-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a bug you noticed, feature idea, balance suggestion, or what you enjoyed..."
                  className="w-full rounded-[4px] bg-[#060e20] border border-white/15 p-3 text-xs text-[#dae2fd] placeholder:text-[#534434] focus:outline-none focus:border-[#06b6d4] resize-none"
                />
              </div>

              {/* Optional Name / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="fb-name" className="text-[11px] font-mono text-[#a08e7a]">
                    Operative Name (Optional)
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Cipher-01"
                    className="w-full rounded-[4px] bg-[#060e20] border border-white/15 px-3 py-1.5 text-xs text-[#dae2fd] placeholder:text-[#534434] focus:outline-none focus:border-[#06b6d4]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="fb-email" className="text-[11px] font-mono text-[#a08e7a]">
                    Email for Follow-up (Optional)
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full rounded-[4px] bg-[#060e20] border border-white/15 px-3 py-1.5 text-xs text-[#dae2fd] placeholder:text-[#534434] focus:outline-none focus:border-[#06b6d4]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2 rounded-[4px] bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ffb4ab] text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#a08e7a] flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#f43f5e]" />
                  <span>Constructive input builds Zenexis</span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[4px] bg-gradient-to-b from-[#06b6d4] to-[#0891b2] text-[#090d16] font-display text-xs font-bold uppercase tracking-wider border-t border-[#67e8f9] shadow-[0_0_14px_rgba(6,182,212,0.35)] hover:brightness-110 active:translate-y-px transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
