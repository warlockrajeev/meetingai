"use client";

import { useState } from "react";

export default function ResultDisplay({ data }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState("");

  // Translation state
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = ["Hindi", "Spanish", "French", "German", "Japanese", "Chinese", "Bengali", "Russian"];

  if (!data) return null;

  const { summary, keyPoints, actionItems, timestamps, sentiment, transcript, fileName, createdAt } = data;

  const sentimentColors = {
    Positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Negative: "text-red-400 bg-red-500/10 border-red-500/20",
    Neutral: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslatedSummary("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: summary, language: selectedLang }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setTranslatedSummary(result.translatedText);
    } catch (err) {
      console.error(err);
      alert("Translation failed: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsChatting(true);
    setChatError("");
    setAnswer("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, transcript }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to get answer");

      setAnswer(result.answer);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="mt-12 space-y-8 fade-up pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white mb-1">Analysis Result</h2>
          {sentiment && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${sentimentColors[sentiment.overall] || sentimentColors.Neutral}`}>
              {sentiment.overall}
            </span>
          )}
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
          <p className="text-zinc-200 leading-relaxed text-md mb-2">
            {summary}
          </p>
          {sentiment?.reason && (
            <p className="text-zinc-500 text-xs italic opacity-80 mb-6 font-medium">
              Tone: {sentiment.reason}
            </p>
          )}

          {/* Translation UI */}
          <div className="border-t border-zinc-800 pt-6 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-zinc-400 outline-none cursor-pointer hover:text-white transition-colors uppercase tracking-wider"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang} className="bg-zinc-900 text-white">{lang}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="btn-secondary px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
              >
                {isTranslating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                    Translating...
                  </>
                ) : (
                  <>Translate Summary</>
                )}
              </button>
            </div>

            {translatedSummary && (
              <div className="mt-6 p-5 rounded-lg bg-zinc-900/40 border border-zinc-800 slide-down">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedLang} Translation</span>
                  <div className="h-[1px] flex-grow bg-zinc-800"></div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  "{translatedSummary}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps / Highlights Card */}
        {timestamps && timestamps.length > 0 && (
          <div className="pro-card p-6 bg-zinc-900/10">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Meeting Highlights</span>
            </div>
            <div className="space-y-3">
              {timestamps.map((ts, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded flex-shrink-0">
                    {ts.split(" - ")[0]}
                  </div>
                  <div className="h-[1px] flex-grow bg-zinc-900"></div>
                  <div className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {ts.split(" - ")[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Chat with Meeting Section */}
        <div className="pro-card p-6 border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2 mb-6 text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Meeting Q&A</span>
          </div>

          <form onSubmit={handleChat} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about this meeting..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 px-4 py-3 rounded-lg outline-none transition-all text-white text-sm pr-12"
              />
              <button
                type="submit"
                disabled={isChatting || !question.trim()}
                className="absolute right-2 top-1.5 p-1.5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isChatting ? (
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          {chatError && (
            <div className="mt-4 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
              {chatError}
            </div>
          )}

          {answer && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 slide-down">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-subtle"></div>
                </div>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
