/**
 * Form to submit a score (category + 1–5 + optional note).
 * Calls onSuccess() after a successful submission.
 *
 * Design: matches CandidateDetailPage's internal-tool aesthetic —
 *   slate borders, tight uppercase section labels, score-colored buttons.
 *
 * UX note on default score:
 *   No score is pre-selected. Defaulting to 3 creates anchoring bias —
 *   reviewers may leave it unchanged without consciously choosing "average".
 *   Forcing an explicit click ensures every submitted score is intentional.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea, Select } from "@/components/ui/primitives";
import { Spinner } from "@/components/StatusBadge";
import { submitScore } from "@/api/client";

const CATEGORIES = [
  "Technical",
  "Communication",
  "Problem Solving",
  "Culture Fit",
  "Leadership",
  "Domain Knowledge",
];

/**
 * Per-score visual config: selected state bg + border + text.
 * Mirrors the SCORE_BG_COLORS / SCORE_TEXT_COLORS in CandidateDetailPage
 * so that the submitted score chip and the form buttons speak the same language.
 */
const SCORE_STYLES = {
  1: {
    active: "border-red-300 bg-red-500 text-white",
    hover:  "hover:border-red-200 hover:bg-red-50 hover:text-red-700",
    label:  "Poor",
  },
  2: {
    active: "border-orange-300 bg-orange-500 text-white",
    hover:  "hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700",
    label:  "Below avg",
  },
  3: {
    active: "border-amber-300 bg-amber-500 text-white",
    hover:  "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700",
    label:  "Average",
  },
  4: {
    active: "border-lime-400 bg-lime-500 text-white",
    hover:  "hover:border-lime-200 hover:bg-lime-50 hover:text-lime-700",
    label:  "Good",
  },
  5: {
    active: "border-emerald-400 bg-emerald-500 text-white",
    hover:  "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
    label:  "Excellent",
  },
};

export function ScoreForm({ candidateId, onSuccess }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  // Empty string = no score chosen yet (forces an intentional click)
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Guard: score is required — catch it here before hitting the network
    if (!score) {
      setError("Please select a score before submitting.");
      return;
    }

    setLoading(true);
    try {
      await submitScore(candidateId, {
        category,
        score: Number(score),
        note: note.trim() || null,
      });
      // Reset to blank — reviewer must choose intentionally again next time
      setNote("");
      setScore("");
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.detail ?? "Failed to submit score.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Category */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Category
        </p>
        <Select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-8 text-xs border-slate-200"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {/* Score 1–5 */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Score
          </p>
          {/* Live label — only shown once a score is selected */}
          {score ? (
            <span className="text-[10px] font-medium text-muted-foreground">
              {score}/5 — {SCORE_STYLES[Number(score)]?.label}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 italic">
              Select a score
            </span>
          )}
        </div>

        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const isSelected = String(n) === score;
            const styles = SCORE_STYLES[n];
            return (
              <button
                key={n}
                type="button"
                onClick={() => setScore(String(n))}
                className={`
                  h-9 flex-1 rounded-md border text-sm font-bold
                  transition-all duration-100
                  ${isSelected
                    ? styles.active
                    : `border-slate-200 bg-white text-slate-400 ${styles.hover}`
                  }
                `}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note (optional) */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Note{" "}
          <span className="normal-case font-normal tracking-normal text-muted-foreground/60">
            (optional)
          </span>
        </p>
        <Textarea
          id="note"
          placeholder="Add context for this score…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="resize-none border-slate-200 text-sm placeholder:text-slate-300"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="sm"
        disabled={loading}
        className="w-full gap-1.5"
      >
        {loading ? (
          <>
            <Spinner size={13} /> Submitting…
          </>
        ) : (
          "Submit score"
        )}
      </Button>
    </form>
  );
}