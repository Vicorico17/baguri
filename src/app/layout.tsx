import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import Head from "next/head";
import { AppProviders } from "@/contexts/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "baguri.ro",
  description:
    "Romanian fashion,reimagined ",
  // Mobile-specific metadata
  keywords: "Romanian fashion, designers, marketplace, clothing, unique fashion, local brands, mobile shopping",
  authors: [{ name: "Baguri Team" }],
  creator: "Baguri",
  publisher: "Baguri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
      <Head>
        <link rel="icon" href="/imglogo.png" />
        
        {/* Mobile-specific optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Baguri" />
        <meta name="application-name" content="Baguri" />
        <meta name="msapplication-TileColor" content="#09090b" />
        <meta name="theme-color" content="#09090b" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body className={inter.className}>
        <ThirdwebProvider>
          <AppProviders>
            {children}
          </AppProviders>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
