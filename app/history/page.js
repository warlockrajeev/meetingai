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
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="spinner mb-4"></div>
        <p className="text-zinc-500 text-sm">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="pro-card p-8 border-red-900/30 text-center">
          <p className="text-red-400 font-bold mb-2">Sync Error</p>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <button onClick={() => { setLoading(true); fetchMeetings(); }} className="btn-secondary text-xs">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 flex items-end justify-between border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meeting History</h1>
          <p className="text-zinc-500 text-sm">Manage and review your processed recordings.</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{meetings.length}</span>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Processed</p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="pro-card p-16 text-center bg-zinc-900/10 border-dashed">
          <p className="text-zinc-400 font-semibold mb-1">No history found</p>
          <p className="text-zinc-600 text-sm mb-8">Process your first recording to see it here.</p>
          <button onClick={() => router.push("/")} className="btn-primary text-sm px-8">
            Start New Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const isExpanded = expandedId === meeting._id;
            return (
              <div key={meeting._id} className={`pro-card overflow-hidden ${isExpanded ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : meeting._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpanded ? "bg-primary text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    </div>
                    <div className="text-left truncate">
                      <p className="text-sm font-bold text-white truncate">{meeting.fileName || "Unnamed Meeting"}</p>
                      <p className="text-xs text-zinc-500">{formatDate(meeting.createdAt)}</p>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-6 py-6 bg-zinc-900/20 border-t border-zinc-800 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Summary</h4>
                      <p className="text-zinc-300 text-sm leading-relaxed">{meeting.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Key Notes</h4>
                        <ul className="space-y-2">
                          {meeting.keyPoints?.slice(0, 5).map((p, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Next Steps</h4>
                        <ul className="space-y-2">
                          {meeting.actionItems?.slice(0, 5).map((a, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex gap-2">
                              <span className="text-emerald-500">✓</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => router.push("/") /* This would ideally navigate to a detail view with the result */}
                        className="btn-secondary text-[10px] uppercase font-bold tracking-widest"
                      >
                        View Full Report
                      </button>
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
