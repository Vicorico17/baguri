"use client";
import { useEffect } from "react";

export default function ReferralTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    const product = url.searchParams.get("product");
    if (ref) {
      localStorage.setItem("referral_code", ref);
      // Log click if product param is present
      if (product) {
        fetch("/api/log-referral-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referral_code: ref, product_id: product }),
        });
      }
    }
  }, []);
  return null;
} 