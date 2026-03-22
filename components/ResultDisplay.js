"use client";

import { useState } from "react";

export default function ResultDisplay({ data }) {
  const [showTranscript, setShowTranscript] = useState(false);

  if (!data) return null;

  const { summary, keyPoints, actionItems, transcript, fileName, createdAt } = data;

  return (
    <div className="mt-12 space-y-8 fade-up pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Analysis Result</h2>
          <p className="text-zinc-500 text-sm">
            {fileName} • {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary px-4 py-1.5 text-xs flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.844l-.452.452a2.25 2.25 0 000 3.182l.452.452a2.25 2.25 0 003.182 0l.452-.452M8.958 12.5l2.25-2.25m0 0l2.25-2.25m-2.25 2.25l-2.25 2.25m2.25-2.25l2.25 2.25M18 10.5V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-4.5m-9-9h.008v.008H12V4.5z" />
          </svg>
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Summary Card */}
        <div className="pro-card p-6">
          <div className="flex items-center gap-2 mb-4 text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Executive Summary</span>
          </div>
          <p className="text-zinc-200 leading-relaxed text-md">
            {summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Points */}
          <div className="pro-card p-6">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.16 3.659A2.25 2.25 0 009.568 3z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Key Takeaways</span>
            </div>
            <ul className="space-y-3">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="text-primary font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className="pro-card p-6 border-l-4 border-l-emerald-500/50">
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Action Items</span>
            </div>
            <ul className="space-y-3">
              {actionItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Transcript Section */}
        <div className="pro-card overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Full Transcript</span>
            </div>
            <svg
              className={`w-4 h-4 text-zinc-500 transition-transform ${showTranscript ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showTranscript && (
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
              <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {transcript}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
