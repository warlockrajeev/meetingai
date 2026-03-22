"use client";

import { useState } from "react";

export default function ResultDisplay({ data }) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  if (!data) return null;

  const { transcript, summary, keyPoints, actionItems, fileName, createdAt } = data;

  return (
    <div className="w-full space-y-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-up">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Meeting Analysis</h2>
          <p className="text-text-secondary text-sm mt-1">
            {fileName && <span>{fileName} • </span>}
            {createdAt && new Date(createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className="tag">✨ AI Generated</span>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-6 fade-up fade-up-delay-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">Summary</h3>
        </div>
        <p className="text-text-secondary leading-relaxed">{summary}</p>
      </div>

      {/* Key Points Card */}
      <div className="glass-card p-6 fade-up fade-up-delay-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">Key Points</h3>
          <span className="tag">{keyPoints?.length || 0}</span>
        </div>
        <ul className="space-y-3">
          {keyPoints?.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-text-secondary">
              <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Items Card */}
      <div className="glass-card p-6 fade-up fade-up-delay-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text">Action Items</h3>
          <span className="tag">{actionItems?.length || 0}</span>
        </div>
        <ul className="space-y-3">
          {actionItems?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-text-secondary">
              <span className="w-6 h-6 flex-shrink-0 rounded-lg bg-success/10 flex items-center justify-center mt-0.5">
                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Transcript Card (Collapsible) */}
      <div className="glass-card p-6 fade-up fade-up-delay-4">
        <button
          onClick={() => setTranscriptExpanded(!transcriptExpanded)}
          className="flex items-center justify-between w-full text-left"
          id="toggle-transcript"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text">Full Transcript</h3>
          </div>
          <svg
            className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
              transcriptExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {transcriptExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">
              {transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
