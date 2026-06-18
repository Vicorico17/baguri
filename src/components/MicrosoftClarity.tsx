"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const MicrosoftClarity = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      setEnabled(localStorage.getItem('baguri_cookie_consent') === 'accepted');
    };

    updateConsent();
    window.addEventListener('baguri-cookie-consent', updateConsent);
    return () => window.removeEventListener('baguri-cookie-consent', updateConsent);
  }, []);

  if (!CLARITY_ID || !enabled) return null;

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `,
      }}
    />
  );
};

export default MicrosoftClarity;
