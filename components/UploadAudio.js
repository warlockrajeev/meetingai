"use client";

import { useState, useRef } from "react";

export default function UploadAudio({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef(null);

  const ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a", "ogg", "webm", "flac"];
  const MAX_SIZE = 25 * 1024 * 1024; // 25MB

  function validateFile(f) {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format ".${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (f.size > MAX_SIZE) {
      return `File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max: 25MB`;
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
    setProgress("Uploading audio...");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      setProgress("Transcribing with AI...");

      const token = localStorage.getItem("token");
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");

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
          accept=".mp3,.wav,.m4a,.ogg,.webm,.flac"
          onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {file ? "File Selected" : "Upload Meeting Recording"}
          </h3>
          <p className="text-zinc-500 text-sm max-w-[280px] mx-auto">
            {file ? file.name : "Drag and drop or click to browse (MP3, WAV, M4A up to 25MB)"}
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
          Analyze Meeting
        </button>
      )}

      {loading && (
        <div className="pro-card p-6 text-center space-y-4 border-primary/20 bg-zinc-900/40">
          <div className="flex flex-col items-center">
            <div className="spinner mb-4"></div>
            <p className="text-zinc-200 font-bold">{progress}</p>
            <p className="text-zinc-500 text-xs">Gemini AI is processing your audio...</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
