import { Check, Copy, ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { cn } from "../lib/utils";

type ReviewCardProps = {
  reviewText: string;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onOpenGoogle: () => void;
  regenerating?: boolean;
  className?: string;
};

export function ReviewCard({
  reviewText,
  copied,
  onCopy,
  onRegenerate,
  onOpenGoogle,
  regenerating = false,
  className
}: ReviewCardProps) {
  return (
    <GlassCard className={cn("overflow-hidden bg-white/60 p-6 sm:p-8", className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Your Google Review</h2>
          <p className="text-sm text-slate-500">AI-polished and ready to post</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 text-base leading-8 text-slate-800 shadow-inner sm:text-lg">
        {reviewText}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onCopy} disabled={regenerating}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy Review"}
        </Button>
        <Button type="button" variant="secondary" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
          {regenerating ? "Regenerating" : "Regenerate"}
        </Button>
        <Button type="button" onClick={onOpenGoogle} disabled={regenerating}>
          <ExternalLink size={17} />
          Open Google
        </Button>
      </div>
    </GlassCard>
  );
}
