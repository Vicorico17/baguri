"use client";
import Image from "next/image";
import { BackgroundPaths } from "@/components/ui/background-paths";
import Link from "next/link";

export default function InviteMatei() {
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
          <Link href="/designer-signup">
            <button className="mt-4 px-8 py-3 bg-white text-zinc-900 rounded-full shadow hover:bg-neutral-200 font-bold text-lg transition">Start now</button>
          </Link>
        </div>
      </div>
    </main>
  );
} 