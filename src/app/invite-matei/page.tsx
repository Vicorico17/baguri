"use client";
import Image from "next/image";
import { BackgroundPaths } from "@/components/ui/background-paths";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InviteMatei() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(true);
    router.push("/designer-signup");
  };
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <BackgroundPaths />
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-2">
        <Image
          src="/wlogo.png"
          alt="Baguri.ro written logo"
          width={240}
          height={60}
          className="mx-auto mb-6 w-full max-w-[220px] md:max-w-[320px] h-12 md:h-16 object-contain"
          style={{ filter: "invert(1) brightness(2)" }}
          priority
        />
        <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col z-10 items-center">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Designer Hunter Matei invited you to list your brand on baguri.</h1>
          <button
            className="mt-4 px-8 py-3 bg-white text-zinc-900 rounded-full shadow hover:bg-neutral-200 font-bold text-lg transition flex items-center justify-center min-w-[140px]"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Loading...
              </>
            ) : (
              "Start now"
            )}
          </button>
        </div>
      </div>
    </main>
  );
} 