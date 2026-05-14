/**
 * components/ScoreForm.jsx
 * Form to submit a score (category + 1-5 + optional note).
 * Calls onSuccess() after a successful submission.
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

export function ScoreForm({ candidateId, onSuccess }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [score, setScore] = useState("3");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitScore(candidateId, {
        category,
        score: Number(score),
        note: note.trim() || null,
      });
      setNote("");
      setScore("3");
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
        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
        <Select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-slate-200 focus-visible:ring-indigo-500/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {/* Score 1-5 — Segmented Control */}
      <div className="space-y-1.5">
        <Label htmlFor="score">
          Score — <span className="font-normal text-muted-foreground">{score} / 5</span>
        </Label>
        <div className="inline-flex gap-1 rounded-full bg-slate-100 p-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(String(n))}
              className={`h-8 w-8 rounded-md text-sm font-semibold transition-all ${
                String(n) === score
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note" className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          id="note"
          placeholder="Add context for this score…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="border-slate-200 focus-visible:ring-indigo-500/20 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <Button type="submit" size="sm" disabled={loading} className="w-full">
        {loading ? <><Spinner size={14} /> Submitting…</> : "Submit Score"}
      </Button>
    </form>
  );
}
