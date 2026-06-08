"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/Button";
import { GlassCard } from "../../../components/GlassCard";
import { SettingsToggle } from "../../../components/SettingsToggle";
import { Sidebar, DashboardHeader } from "../../../components/Sidebar";
import { useToast } from "../../../components/Toast";
import { apiFetch, Business, getToken } from "../../../lib/api";
import {
  businessToForm,
  defaultBusinessProfileForm,
  formToBusinessPayload,
  type BusinessProfileForm
} from "../../../lib/business";

const inputClass =
  "w-full rounded-xl border border-white/30 bg-white/40 px-4 py-3 text-slate-950 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
const helperClass = "mt-1.5 text-xs text-slate-500";

export default function BusinessSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [form, setForm] = useState<BusinessProfileForm>(defaultBusinessProfileForm);

  function updateForm<K extends keyof BusinessProfileForm>(key: K, value: BusinessProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }
    load();
  }, [router]);

  async function load() {
    const profile = await apiFetch<{ business: Business | null }>("/api/business/me");
    if (profile.business) {
      setForm(businessToForm(profile.business));
      if (profile.business.logo) setLogoPreview(profile.business.logo);
    }
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Please upload a PNG, JPG, or WEBP image", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      updateForm("logo", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await apiFetch<{ business: Business }>("/api/business/profile", {
        method: "POST",
        body: JSON.stringify(formToBusinessPayload(form))
      });
      showToast("Business profile saved successfully!", "success");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-200 opacity-10 mix-blend-multiply blur-3xl filter" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-emerald-300 opacity-10 mix-blend-multiply blur-3xl filter" />
      </div>

      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="relative z-10 flex">
        <Sidebar isMobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Sidebar isMobile={false} />

        <div className="flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 hidden border-b border-white/20 bg-white/30 backdrop-blur-glass lg:block">
            <div className="mx-auto flex max-w-4xl items-center gap-4 px-8 py-6">
              <Link href="/dashboard">
                <button type="button" className="rounded-lg p-2 transition hover:bg-white/50">
                  <ArrowLeft size={24} className="text-slate-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-950">Business Settings</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Customize your public review page, branding, and social presence
                </p>
              </div>
            </div>
          </header>

          <div className="flex items-center gap-3 px-5 py-4 lg:hidden">
            <Link href="/dashboard">
              <button type="button" className="rounded-lg p-2 transition hover:bg-slate-100">
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-950">Business Settings</h1>
          </div>

          <div className="px-5 py-8 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <form onSubmit={saveProfile} className="space-y-6">
                {/* Business Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="mb-2 text-2xl font-bold text-slate-950">Business Information</h2>
                    <p className="mb-6 text-sm text-slate-600">
                      Core details shown on your public review page.
                    </p>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="businessName">Business Name</label>
                        <input id="businessName" className={inputClass} value={form.businessName} onChange={(e) => updateForm("businessName", e.target.value)} required />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="category">Business Category</label>
                        <select id="category" className={inputClass} value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                          <option value="Restaurant">Restaurant</option>
                          <option value="Retail">Retail</option>
                          <option value="Service">Service</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Technology">Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className={labelClass} htmlFor="tagline">Business Tagline</label>
                        <input id="tagline" className={inputClass} value={form.tagline} onChange={(e) => updateForm("tagline", e.target.value)} placeholder="Serving quality food since 2020" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className={labelClass} htmlFor="businessDescription">Business Description</label>
                        <textarea
                          id="businessDescription"
                          className={`${inputClass} min-h-32 resize-y`}
                          value={form.businessDescription}
                          onChange={(e) => updateForm("businessDescription", e.target.value)}
                          placeholder="Share your real experience. We'll turn your feedback into a clear review you can copy to Google."
                        />
                        <p className={helperClass}>
                          Describe your business, services, and customer experience. This information will be displayed on your review page.
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 grid gap-6 lg:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="address">Business Address</label>
                        <input id="address" className={inputClass} value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="123 Main Street, City" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="phone">Business Phone Number</label>
                        <input id="phone" className={inputClass} value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+1 555 000 0000" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="email">Business Email</label>
                        <input id="email" type="email" className={inputClass} value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="hello@business.com" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="website">Website URL</label>
                        <input id="website" type="url" className={inputClass} value={form.website} onChange={(e) => updateForm("website", e.target.value)} placeholder="https://yourbusiness.com" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="googleMapsUrl">Google Maps Location URL</label>
                        <input id="googleMapsUrl" type="url" className={inputClass} value={form.googleMapsUrl} onChange={(e) => updateForm("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/..." />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="workingHours">Working Hours</label>
                        <input id="workingHours" className={inputClass} value={form.workingHours} onChange={(e) => updateForm("workingHours", e.target.value)} placeholder="Mon–Sat: 9 AM – 9 PM" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="foundedYear">Founded Year</label>
                        <input id="foundedYear" type="number" min={1800} max={new Date().getFullYear()} className={inputClass} value={form.foundedYear} onChange={(e) => updateForm("foundedYear", e.target.value)} placeholder="2020" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="googleReviewLink">Google Review Link</label>
                        <input id="googleReviewLink" type="url" className={inputClass} value={form.googleReviewLink} onChange={(e) => updateForm("googleReviewLink", e.target.value)} placeholder="https://g.page/r/xxxxxxxx/review" required />
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-white/40 bg-white/10 p-8 transition hover:bg-white/20"
                      >
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} className="hidden" />
                        <div className="text-center">
                          <Upload size={32} className="mx-auto mb-3 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-950">Upload Business Logo</p>
                          <p className="text-xs text-slate-600">PNG, JPG, WEBP • Max 5MB</p>
                        </div>
                      </div>
                      {logoPreview ? (
                        <div className="flex items-center justify-center rounded-xl border border-white/30 bg-white/50 p-6">
                          <Image src={logoPreview} alt="Logo preview" width={160} height={160} unoptimized className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg sm:h-36 sm:w-36" />
                        </div>
                      ) : null}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Social Media */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="mb-2 text-2xl font-bold text-slate-950">Social Media & Online Presence</h2>
                    <p className="mb-6 text-sm text-slate-600">Optional links — only filled icons appear on your public page.</p>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {(
                        [
                          ["instagramUrl", "Instagram URL"],
                          ["facebookUrl", "Facebook URL"],
                          ["twitterUrl", "X (Twitter) URL"],
                          ["linkedinUrl", "LinkedIn URL"],
                          ["youtubeUrl", "YouTube URL"],
                          ["tiktokUrl", "TikTok URL"],
                          ["whatsappNumber", "WhatsApp Number"],
                          ["telegramUrl", "Telegram URL"]
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key}>
                          <label className={labelClass} htmlFor={key}>{label}</label>
                          <input
                            id={key}
                            type={key === "whatsappNumber" ? "tel" : "url"}
                            className={inputClass}
                            value={form[key]}
                            onChange={(e) => updateForm(key, e.target.value)}
                            placeholder={key === "whatsappNumber" ? "+1 555 000 0000" : "https://"}
                          />
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Trust & Credibility */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="mb-2 text-2xl font-bold text-slate-950">Trust & Credibility</h2>
                    <p className="mb-6 text-sm text-slate-600">Build confidence before customers leave a review.</p>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="yearsInBusiness">Years in Business</label>
                        <input id="yearsInBusiness" type="number" min={0} className={inputClass} value={form.yearsInBusiness} onChange={(e) => updateForm("yearsInBusiness", e.target.value)} placeholder="5" />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="customersServed">Customers Served</label>
                        <input id="customersServed" className={inputClass} value={form.customersServed} onChange={(e) => updateForm("customersServed", e.target.value)} placeholder="10,000+" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className={labelClass} htmlFor="awardsCertifications">Awards & Certifications</label>
                        <textarea id="awardsCertifications" className={`${inputClass} min-h-24 resize-y`} value={form.awardsCertifications} onChange={(e) => updateForm("awardsCertifications", e.target.value)} placeholder="Best Local Restaurant 2024" />
                      </div>
                      <div className="lg:col-span-2">
                        <label className={labelClass} htmlFor="trustStatement">Additional Trust Statement</label>
                        <input id="trustStatement" className={inputClass} value={form.trustStatement} onChange={(e) => updateForm("trustStatement", e.target.value)} placeholder="Trusted by 10,000+ happy customers." />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Visibility Toggles */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="mb-6 text-2xl font-bold text-slate-950">Public Page Visibility</h2>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <SettingsToggle label="Show Business Description" checked={form.showDescription} onChange={(v) => updateForm("showDescription", v)} />
                      <SettingsToggle label="Show Social Media Links" checked={form.showSocialLinks} onChange={(v) => updateForm("showSocialLinks", v)} />
                      <SettingsToggle label="Show Contact Information" checked={form.showContactInfo} onChange={(v) => updateForm("showContactInfo", v)} />
                      <SettingsToggle label="Show Trust Information" checked={form.showTrustInfo} onChange={(v) => updateForm("showTrustInfo", v)} />
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Subscription */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="mb-6 text-2xl font-bold text-slate-950">Subscription Plan</h2>
                    <div className="grid gap-3 lg:grid-cols-3">
                      {[
                        { value: "free", label: "Free", description: "5 reviews/month" },
                        { value: "starter", label: "Starter", description: "50 reviews/month" },
                        { value: "growth", label: "Growth", description: "Unlimited reviews" }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-start rounded-xl border-2 p-4 transition ${
                            form.subscriptionPlan === option.value
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-white/30 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="subscriptionPlan"
                            value={option.value}
                            checked={form.subscriptionPlan === option.value}
                            onChange={(e) => updateForm("subscriptionPlan", e.target.value)}
                            className="mt-1"
                          />
                          <div className="ml-3">
                            <p className="font-semibold text-slate-950">{option.label}</p>
                            <p className="text-xs text-slate-600">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <div className="flex gap-3 pb-8">
                  <Link href="/dashboard">
                    <button type="button" className="rounded-xl px-6 py-3 font-semibold text-slate-700 transition hover:bg-white/30">
                      Cancel
                    </button>
                  </Link>
                  <Button type="submit" disabled={saving} className="flex-1 lg:flex-initial">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
