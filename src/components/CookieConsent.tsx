"use client";

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'baguri_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY));
  }, []);

  const setConsent = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event('baguri-cookie-consent'));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[10000] border-t border-zinc-800 bg-zinc-950/95 px-4 py-4 text-white shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-zinc-300">
          We use essential cookies to run Baguri. Analytics cookies help us improve the marketplace and load only if you accept them.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConsent('rejected')}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => setConsent('accepted')}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
