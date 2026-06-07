"use client";

import { Check, Copy, ExternalLink, Mic, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../../../components/Button";
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
  const [business, setBusiness] = useState<Business | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ business: Business }>(`/api/business/public/${businessId}`)
      .then((response) => setBusiness(response.business))
      .catch((err) => setError(err instanceof Error ? err.message : "Business not found"));
  }, [businessId]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ review: Review; googleReviewLink: string }>("/api/reviews/generate", {
        method: "POST",
        body: JSON.stringify({ businessId, rating, customerFeedback: feedback, language: "English" })
      });
      setReview(response.review);
      setGoogleReviewLink(response.googleReviewLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate review");
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
      setError("Voice input is not supported in this browser.");
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
  }

  async function openGoogle() {
    if (review) {
      await apiFetch(`/api/reviews/${review._id}/posted`, { method: "PATCH" }).catch(() => null);
    }
    window.open(googleReviewLink || business?.googleReviewLink, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-mist">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <aside className="rounded-lg bg-ink p-6 text-white shadow-soft">
          {business?.logo ? (
            <Image src={business.logo} alt={business.businessName} width={72} height={72} className="mb-5 h-16 w-16 rounded-md object-cover" />
          ) : (
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-gold text-ink">
              <Sparkles size={30} />
            </div>
          )}
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold">{business?.category || "Review"}</p>
          <h1 className="text-4xl font-bold leading-tight">{business?.businessName || "Boost The Reviews"}</h1>
          <p className="mt-5 text-white/76">
            Share your real experience. We will turn your feedback into a clear review you can copy to Google.
          </p>
        </aside>

        <section className="rounded-lg bg-white p-5 shadow-soft sm:p-7">
          {!review ? (
            <form onSubmit={generate}>
              <h2 className="mb-5 text-xl font-bold">Create Your Review</h2>
              <div className="mb-5">
                <p className="mb-3 text-sm font-semibold">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus-ring flex h-11 w-11 items-center justify-center rounded-md border border-[#d9e2dd]"
                      aria-label={`${value} stars`}
                    >
                      <Star size={22} className={value <= rating ? "fill-gold text-gold" : "text-ink/25"} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="mb-2 block text-sm font-semibold" htmlFor="feedback">
                Feedback
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                className="focus-ring mb-3 min-h-36 w-full resize-y rounded-md border border-[#d9e2dd] p-3 leading-6"
                placeholder="Very good service, friendly staff, fast delivery..."
                required
              />

              <div className="mb-5 flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={startVoiceInput}>
                  <Mic size={17} />
                  {listening ? "Listening" : "Voice Input"}
                </Button>
              </div>

              {error ? <p className="mb-4 rounded-md bg-[#fff0ed] px-3 py-2 text-sm text-[#9d321f]">{error}</p> : null}

              <Button type="submit" disabled={loading || !feedback.trim()}>
                <Sparkles size={17} />
                {loading ? "Generating" : "Generate Review"}
              </Button>
            </form>
          ) : (
            <div>
              <h2 className="mb-4 text-xl font-bold">Your Google Review</h2>
              <div className="mb-5 rounded-md border border-[#d9e2dd] bg-mist p-4 text-lg leading-8">{review.aiGeneratedReview}</div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={copyReview}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Copied" : "Copy Review"}
                </Button>
                <Button type="button" onClick={openGoogle}>
                  <ExternalLink size={17} />
                  Open Google
                </Button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

