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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-10 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-primary-light text-sm font-medium">Powered by Gemini AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
          Meeting Notes, Simplified
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Upload your meeting audio and let AI transcribe, summarize, and extract action items in seconds.
        </p>
      </div>

      {/* Upload Section */}
      <UploadAudio onResult={setResult} />

      {/* Results */}
      <ResultDisplay data={result} />
    </div>
  );
}
