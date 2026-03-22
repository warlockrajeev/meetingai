"use client";

import { useState, useRef } from "react";

export default function UploadMedia({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef(null);

  const ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a", "ogg", "webm", "flac", "mp4", "mov"];
  const MAX_SIZE = 50 * 1024 * 1024; // Increased to 50MB for video

  function validateFile(f) {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format ".${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (f.size > MAX_SIZE) {
      return `File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max: 50MB`;
    }
    return null;
  }

  function handleFileSelect(f) {
    setError("");
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError("");
    setProgress("Uploading media...");

    try {
      const formData = new FormData();
      formData.append("media", file);

      setProgress("Analyzing with AI...");

      const token = localStorage.getItem("token");
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setProgress("Generating report...");
      setTimeout(() => {
        if (onResult) onResult(data.data);
        setFile(null);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6 fade-up">
      <div
        className={`upload-zone p-12 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/20"
        } ${file ? "border-solid border-primary/50" : "border-dashed"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) handleFileSelect(droppedFile);
        }}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm text-zinc-400">
            {file && (file.type.startsWith('video') ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ))}
            {!file && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {file ? "File Selected" : "Upload Meeting Media"}
          </h3>
          <p className="text-zinc-500 text-sm max-w-[280px] mx-auto">
            {file ? file.name : "Audio or Video recordings up to 50MB (MP4, MOV, MP3, etc.)"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {file && !loading && (
        <button onClick={handleUpload} className="btn-primary w-full shadow-md">
          Analyze Recording
        </button>
      )}

      {loading && (
        <div className="pro-card p-6 text-center space-y-4 border-primary/20 bg-zinc-900/40">
          <div className="flex flex-col items-center">
            <div className="spinner mb-4"></div>
            <p className="text-zinc-200 font-bold">{progress}</p>
            <p className="text-zinc-500 text-xs text-balance">AI is processing your media. This may take a minute for videos.</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
