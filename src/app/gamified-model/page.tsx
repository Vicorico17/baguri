"use client";
import Image from "next/image";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function GamifiedModel() {
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
          <h1 className="text-3xl font-bold text-white mb-4 text-center">Baguri Gamified Fee Model</h1>
          <p className="text-neutral-200 text-center mb-6 max-w-lg">
            Our platform uses a gamified fee structure to reward your growth. The more you sell, the lower your fee rate becomes. Here&apos;s how it works:
          </p>
          <div className="w-full">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-neutral-400 font-semibold text-lg">Sales Volume (RON)</th>
                  <th className="text-neutral-400 font-semibold text-lg">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-zinc-800 rounded-xl">
                  <td className="py-2 px-4 rounded-l-xl">0 – 1,000</td>
                  <td className="py-2 px-4 rounded-r-xl">50%</td>
                </tr>
                <tr className="bg-zinc-800 rounded-xl">
                  <td className="py-2 px-4 rounded-l-xl">1,001 – 10,000</td>
                  <td className="py-2 px-4 rounded-r-xl">40%</td>
                </tr>
                <tr className="bg-zinc-800 rounded-xl">
                  <td className="py-2 px-4 rounded-l-xl">10,001+</td>
                  <td className="py-2 px-4 rounded-r-xl">30%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-neutral-400 text-sm mt-6 text-center">
            Your fee rate automatically drops as your total sales increase. This model is designed to help new designers get started and reward those who grow with us!
          </p>
        </div>
      </div>
    </main>
  );
} 