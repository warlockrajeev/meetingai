"use client";

import { useState, useEffect } from "react";
import UploadAudio from "@/components/UploadAudio";
import ResultDisplay from "@/components/ResultDisplay";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [result, setResult] = useState(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero Section */}
      <div className="text-center mb-16 fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini AI</span>
        </div>
        <h1 className="heading-lg text-balance">
          Intelligent Meeting <br className="hidden sm:block" />
          <span className="text-zinc-500">Insights for Professionals.</span>
        </h1>
        <p className="subheading">
          Transcribe, summarize, and extract action items from your recordings with high precision. Seamlessly manage your meeting history.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto">
        <UploadAudio onResult={setResult} />
        
        {result && (
          <div id="results-section" className="scroll-mt-20">
            <ResultDisplay data={result} />
          </div>
        )}
      </div>

      {/* Trust Quote / Footer Hint */}
      <div className="mt-32 border-t border-zinc-900 pt-8 text-center text-zinc-600">
        <p className="text-xs font-medium uppercase tracking-widest mb-4">Secure & Private</p>
        <p className="text-[10px] max-w-sm mx-auto leading-relaxed">
          Your data is processed securely and is only accessible to you. We use enterprise-grade encryption for all storage.
        </p>
      </div>
    </div>
  );
}
