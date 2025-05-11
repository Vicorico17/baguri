"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";

function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "success" | "error" | "duplicate">(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setStatus(null);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json();
      if (data.error === "Email already registered") setStatus("duplicate");
      else setStatus("error");
    }
    setLoading(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl p-6 w-full max-w-xs mx-2 relative flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="text-center space-y-3">
            <div className="text-2xl">🎉</div>
            <div className="font-semibold text-neutral-100">Congratulations for being so early.</div>
            <div className="text-neutral-300 text-sm">We will notify you when we launch.<br />You just signed up for a <span className="font-bold text-amber-200">10% lifetime discount</span></div>
            <button 
              className="mt-4 bg-neutral-100 text-zinc-950 font-medium rounded-full px-6 py-2 shadow-sm hover:bg-neutral-200 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form className="w-full" onSubmit={handleSubmit}>
            <label htmlFor="waitlist-email" className="block text-sm mb-2 text-neutral-300 text-left">Enter your email</label>
            <input
              id="waitlist-email"
              ref={inputRef}
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm mb-3"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            {status === "duplicate" && <div className="text-xs text-amber-300 mb-2">This email is already on the waitlist.</div>}
            {status === "error" && <div className="text-xs text-red-400 mb-2">Something went wrong. Please try again.</div>}
            <button
              type="submit"
              className="w-full bg-neutral-100 text-zinc-950 font-medium rounded-full px-4 py-2 text-sm shadow-sm hover:bg-neutral-200 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Joining..." : "Confirm"}
            </button>
            <button type="button" className="absolute top-2 right-3 text-neutral-400 hover:text-neutral-100 text-lg" onClick={onClose} aria-label="Close">×</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundPaths />
      {/* Optional: add a semi-transparent dark overlay for readability */}
      {/* <div className="absolute inset-0 bg-zinc-950/80 z-10 pointer-events-none" /> */}
      <div className="relative z-10">
        {/* Main content (z-10 to be above background) */}
        <section className="flex flex-col items-center text-center px-4 mt-8 mb-12 gap-y-4">
          <Image
            src="/wlogo.png"
            alt="Baguri.ro written logo"
            width={240}
            height={60}
            className="mx-auto mb-4 w-full max-w-[220px] md:max-w-[320px] h-12 md:h-16 object-contain"
            style={{ filter: "invert(1) brightness(2)" }}
            priority
          />
          <p className="text-base md:text-2xl text-neutral-300 mb-4 md:mb-6 px-2">Romanian fashion, reimagined. Discover and shop limited drops from independent designers.</p>
          <p className="mb-6 md:mb-8 text-sm md:text-lg text-neutral-400 px-2">
            Join the waitlist for exclusive
            <span className="inline-block ml-2 px-3 py-1 rounded-full bg-amber-200 text-zinc-900 font-semibold text-xs md:text-sm align-middle shadow-sm">lifetime discount</span>.
          </p>
          <div className="w-full flex justify-center mb-2">
            <button
              className="inline-block w-full max-w-xs bg-neutral-100 text-zinc-950 font-medium rounded-full px-8 py-3 text-base md:text-lg shadow-sm hover:bg-neutral-200 transition"
              onClick={() => setModalOpen(true)}
            >
              Join Waitlist
            </button>
          </div>
        </section>

        {/* For Shoppers & Designers */}
        <section className="flex flex-col md:flex-row gap-8 justify-center items-start px-4 mb-16 w-full max-w-3xl mx-auto">
          <div className="flex-1 bg-zinc-900 rounded-xl p-5 md:p-6 mb-4 md:mb-0">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-neutral-200">For Shoppers</h2>
            <ul className="space-y-2 text-neutral-300 text-sm md:text-base">
              <li>• Exclusive limited drops from independent Romanian designers</li>
              <li>• Unique shopping experience</li>
            </ul>
          </div>
          <div className="flex-1 bg-zinc-900 rounded-xl p-5 md:p-6">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-neutral-200">For Designers</h2>
            <ul className="space-y-2 text-neutral-300 text-sm md:text-base">
              <li>• You just build your brand, we take care of everything else.</li>
              <li>• Get paid instantly, no upfront fees.</li>
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="flex flex-col items-center text-center px-4 mb-16 md:mb-20 gap-y-4">
          <h3 className="text-base md:text-2xl font-medium mb-2 md:mb-3 text-neutral-200">Be the first to experience the future of Romanian fashion.</h3>
          <div className="w-full flex justify-center">
            <a
              href="#waitlist"
              className="inline-block w-full max-w-xs bg-neutral-100 text-zinc-950 font-medium rounded-full px-8 py-3 text-base md:text-lg shadow-sm hover:bg-neutral-200 transition"
            >
              Join Waitlist
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto w-full py-8 px-4 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 mb-2">
            <span className="text-xs text-neutral-500">Coming soon on</span>
            <div className="flex gap-2 flex-wrap justify-center">
              <AppStoreBadge small />
              <GooglePlayBadge small />
            </div>
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <SocialIcon type="instagram" url="https://www.instagram.com/baguri.ro" />
            <SocialIcon type="tiktok" url="https://www.tiktok.com/@baguri.ro" />
          </div>
        </footer>

        <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </main>
  );
}

function AppStoreBadge({ small }: { small?: boolean }) {
  return (
    <div className={small ? "h-7" : "h-10"}>
      <Image
        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
        alt="Download on the App Store"
        width={small ? 90 : 135}
        height={small ? 28 : 40}
        className="object-contain"
      />
    </div>
  );
}

function GooglePlayBadge({ small }: { small?: boolean }) {
  return (
    <div className={small ? "h-7" : "h-10"}>
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
        alt="Get it on Google Play"
        width={small ? 100 : 150}
        height={small ? 28 : 40}
        className="object-contain"
      />
    </div>
  );
}

function SocialIcon({ type, url }: { type: "instagram" | "tiktok"; url: string }) {
  if (type === "instagram") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-neutral-400 hover:text-neutral-100 transition"><rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.08"/><path d="M16.5 7.5C16.7761 7.5 17 7.72386 17 8C17 8.27614 16.7761 8.5 16.5 8.5C16.2239 8.5 16 8.27614 16 8C16 7.72386 16.2239 7.5 16.5 7.5Z" fill="currentColor"/><rect x="8" y="8" width="8" height="8" rx="4" stroke="currentColor" strokeWidth="1.5"/><rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" stroke="currentColor" strokeWidth="1.5"/></svg>
      </a>
    );
  }
  if (type === "tiktok") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-neutral-400 hover:text-neutral-100 transition"><rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.08"/><path d="M16.5 7.5V13.5C16.5 15.1569 15.1569 16.5 13.5 16.5C11.8431 16.5 10.5 15.1569 10.5 13.5C10.5 11.8431 11.8431 10.5 13.5 10.5C13.7761 10.5 14 10.7239 14 11C14 11.2761 13.7761 11.5 13.5 11.5C12.6716 11.5 12 12.1716 12 13C12 13.8284 12.6716 14.5 13.5 14.5C14.3284 14.5 15 13.8284 15 13V7.5H16.5Z" fill="currentColor"/></svg>
      </a>
    );
  }
  return null;
}
