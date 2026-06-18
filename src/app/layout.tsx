import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/contexts/AppProviders";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import CookieConsent from "@/components/CookieConsent";
import ReferralTracker from "./ReferralTracker";

export const metadata: Metadata = {
  title: "baguri.ro",
  description:
    "Romanian fashion,reimagined ",
  // Mobile-specific metadata
  keywords: "Romanian fashion, designers, marketplace, clothing, unique fashion, local brands, mobile shopping",
  authors: [{ name: "Baguri Team" }],
  creator: "Baguri",
  publisher: "Baguri",
  applicationName: "Baguri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/imglogo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Baguri",
  },
  openGraph: {
    title: "baguri.ro - Romanian Fashion Marketplace",
    description: "Romanian fashion,reimagined",
    url: "https://baguri.ro",
    siteName: "Baguri",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "baguri.ro",
    description: "Romanian fashion,reimagined",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ReferralTracker />
        <GoogleAnalytics />
        <MicrosoftClarity />
        <CookieConsent />
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
