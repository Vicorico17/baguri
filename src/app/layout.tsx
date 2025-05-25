import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/imglogo.png" />
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
