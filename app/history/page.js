"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchMeetings();
    }
  }, [user, authLoading, router]);

  async function fetchMeetings() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/meetings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      setMeetings(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="spinner"></div>
          </div>
          <p className="text-text-secondary">Loading meeting history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-danger font-semibold mb-2">Failed to load history</p>
          <p className="text-text-secondary text-sm">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(""); fetchMeetings(); }}
            className="btn-primary mt-4 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
          Meeting History
        </h1>
        <p className="text-text-secondary">
          {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} processed
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="glass-card p-12 text-center fade-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p className="text-text font-semibold text-lg mb-1">No meetings yet</p>
          <p className="text-text-secondary">Upload your first audio file to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting, index) => {
            const isExpanded = expandedId === meeting._id;
            return (
              <div
                key={meeting._id}
                className="glass-card overflow-hidden fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Card Header (always visible) */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : meeting._id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-surface-hover/50 transition-colors"
                  id={`meeting-card-${meeting._id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-text truncate">
                        {meeting.fileName || "Untitled Meeting"}
                      </span>
                      <span className="text-text-muted text-xs flex-shrink-0">
                        {formatDate(meeting.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-2 ml-11">
                      {meeting.summary}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted flex-shrink-0 ml-4 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-5 border-t border-border">
                    {/* Summary */}
                    <div className="pt-5">
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Summary
                      </h4>
                      <p className="text-text-secondary leading-relaxed">
                        {meeting.summary}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {meeting.keyPoints?.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                            <span className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Items */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {meeting.actionItems?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                            <span className="w-5 h-5 rounded bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Transcript */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Transcript
                      </h4>
                      <div className="bg-surface rounded-xl p-4 max-h-64 overflow-y-auto">
                        <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                          {meeting.transcript}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
