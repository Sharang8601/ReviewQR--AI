"use client";

import { Loader2, Mic, RefreshCw, Sparkles, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BusinessProfileCard } from "../../../components/BusinessProfileCard";
import { Button } from "../../../components/Button";
import { GlassCard } from "../../../components/GlassCard";
import { Logo } from "../../../components/Logo";
import { ReviewCard } from "../../../components/ReviewCard";
import { useToast } from "../../../components/Toast";
import { apiFetch, Business, Review } from "../../../lib/api";

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
};

export default function CustomerReviewPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const { showToast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingBusiness(true);
    apiFetch<{ business: Business }>(`/api/business/public/${businessId}`)
      .then((response) => setBusiness(response.business))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Business not found";
        setError(message);
        showToast(message, "error");
      })
      .finally(() => setLoadingBusiness(false));
  }, [businessId, showToast]);

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await apiFetch<{ review: Review; googleReviewLink: string }>("/api/reviews/generate", {
        method: "POST",
        body: JSON.stringify({ businessId, rating, customerFeedback: feedback, language: "English" })
      });
      setReview(response.review);
      setGoogleReviewLink(response.googleReviewLink);
      showToast("Your AI review suggestion is ready!", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate review";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const message = "Voice input is not supported in this browser.";
      setError(message);
      showToast(message, "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setFeedback((current) => `${current} ${event.results[0][0].transcript}`.trim());
    };
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  async function copyReview() {
    if (!review) return;
    await navigator.clipboard.writeText(review.aiGeneratedReview);
    setCopied(true);
    showToast("Review copied to clipboard", "success");
  }

  async function openGoogle() {
    if (review) {
      await apiFetch(`/api/reviews/${review._id}/posted`, { method: "PATCH" }).catch(() => null);
    }
    window.open(googleReviewLink || business?.googleReviewLink, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-200 opacity-10 mix-blend-multiply blur-3xl filter" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-emerald-300 opacity-10 mix-blend-multiply blur-3xl filter" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <Logo size="md" href="/" subtitle="AI-powered review collection" />
        </header>

        {loadingBusiness ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <GlassCard className="flex h-full flex-col bg-white/70 p-6 shadow-glass sm:p-8">
              {business ? (
                <BusinessProfileCard business={business} />
              ) : (
                <p className="text-slate-600">{error || "Business not found."}</p>
              )}
            </GlassCard>

            <div className="flex h-full flex-col">
              {!review ? (
                <GlassCard className="flex h-full flex-col bg-white/80 p-6 shadow-glass sm:p-8">
                  <form onSubmit={generate} className="flex h-full flex-col">
                    <div>
                      <h2 className="mb-1 text-2xl font-bold text-slate-950">Create Your Review</h2>
                      <p className="mb-6 text-sm text-slate-600">Rate your experience and share quick feedback.</p>
                    </div>

                    <div className="mb-6">
                      <p className="mb-3 text-sm font-semibold text-slate-700">Rating</p>
                      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:h-14 sm:w-14"
                            aria-label={`${value} stars`}
                          >
                            <Star
                              size={24}
                              className={value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="feedback">
                      Feedback
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      className="mb-4 min-h-36 w-full flex-1 resize-y rounded-xl border border-slate-200 bg-white p-4 leading-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Very good service, friendly staff, fast delivery..."
                      required
                    />

                    <div className="mb-5 flex flex-wrap gap-3">
                      <Button type="button" variant="secondary" onClick={startVoiceInput} disabled={loading}>
                        <Mic size={17} />
                        {listening ? "Listening..." : "Voice Input"}
                      </Button>
                    </div>

                    {error ? (
                      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p>{error}</p>
                        <button
                          type="button"
                          onClick={() => generate()}
                          className="mt-2 inline-flex items-center gap-1 font-semibold text-red-700 underline-offset-2 hover:underline"
                        >
                          <RefreshCw size={14} />
                          Retry
                        </button>
                      </div>
                    ) : null}

                    <div className="mt-auto pt-2">
                      <Button type="submit" disabled={loading || !feedback.trim()} className="w-full sm:w-auto">
                        {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                        {loading ? "Generating..." : "Generate Review"}
                      </Button>
                    </div>
                  </form>
                </GlassCard>
              ) : (
                <ReviewCard
                  reviewText={review.aiGeneratedReview}
                  copied={copied}
                  onCopy={copyReview}
                  onRegenerate={() => generate()}
                  onOpenGoogle={openGoogle}
                  regenerating={loading}
                  className="h-full"
                />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
