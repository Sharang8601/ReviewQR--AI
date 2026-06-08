"use client";

import { Check, Copy, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { cn } from "../lib/utils";

type ReviewOption = {
  label: string;
  review: string;
};

type ReviewCardProps = {
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  reviewOptions: ReviewOption[];
  selectedOptionIndex: number | null;
  onSelectOption: (index: number, review: string) => void;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onClear: () => void;
  onOpenGoogle: () => void;
  hasGoogleReviewLink: boolean;
  regenerating?: boolean;
  className?: string;
};

const optionColors = [
  { label: "Friendly", bg: "bg-blue-50 hover:bg-blue-100 border-blue-200", icon: "😊" },
  { label: "Professional", bg: "bg-purple-50 hover:bg-purple-100 border-purple-200", icon: "👔" },
  { label: "Enthusiastic", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200", icon: "🔥" },
  { label: "Short & Simple", bg: "bg-teal-50 hover:bg-teal-100 border-teal-200", icon: "✍️" },
];

export function ReviewCard({
  reviewText,
  onReviewTextChange,
  reviewOptions,
  selectedOptionIndex,
  onSelectOption,
  copied,
  onCopy,
  onRegenerate,
  onClear,
  onOpenGoogle,
  hasGoogleReviewLink,
  regenerating = false,
  className
}: ReviewCardProps) {
  return (
    <GlassCard className={cn("overflow-hidden bg-white/60 p-6 sm:p-8", className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Your Google Review</h2>
          <p className="text-sm text-slate-500">Edit, copy, or post to Google</p>
        </div>
      </div>

      {/* Review Options Cards */}
      {reviewOptions.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Choose a style
          </p>
          <div className="grid grid-cols-2 gap-2">
            {reviewOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectOption(index, option.review)}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                  selectedOptionIndex === index
                    ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                    : optionColors[index]?.bg || "bg-slate-50 hover:bg-slate-100 border-slate-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500"
                )}
              >
                <span className="text-base leading-5">{optionColors[index]?.icon || "💬"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {option.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-600">
                    {option.review}
                  </p>
                </div>
                {selectedOptionIndex === index && (
                  <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editable Review Textarea */}
      <div className="relative mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="editable-review">
          Review Text
        </label>
        <textarea
          id="editable-review"
          value={reviewText}
          onChange={(e) => onReviewTextChange(e.target.value)}
          className="min-h-[140px] w-full resize-y rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 text-base leading-7 text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300"
          placeholder="Your generated review will appear here..."
          disabled={regenerating}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onCopy} disabled={regenerating || !reviewText.trim()}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="secondary" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
          {regenerating ? "Generating..." : "Regenerate"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear} disabled={regenerating || !reviewText.trim()}>
          <Trash2 size={17} />
          Clear
        </Button>
        <Button type="button" onClick={onOpenGoogle} disabled={!hasGoogleReviewLink}>
          <ExternalLink size={17} />
          Open Google Review
        </Button>
      </div>
    </GlassCard>
  );
}