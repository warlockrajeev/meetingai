"use client";

import { useState, useRef } from "react";

export default function UploadAudio({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/x-m4a",
    "audio/ogg",
    "audio/webm",
    "audio/flac",
  ];
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

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleInputChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) handleFileSelect(selectedFile);
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

      if (!res.ok) {
        throw new Error(data.error || "Processing failed");
      }

      setProgress("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onResult) onResult(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="w-full fade-up">
      {/* Upload Zone */}
      <div
        className={`upload-zone p-8 sm:p-12 text-center cursor-pointer ${
          dragOver ? "drag-over" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.ogg,.webm,.flac"
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
          id="audio-file-input"
        />

        {!file ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-light"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-text font-semibold text-lg">
                Drop your audio file here
              </p>
              <p className="text-text-secondary text-sm mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {ALLOWED_EXTENSIONS.map((ext) => (
                <span key={ext} className="tag">
                  .{ext}
                </span>
              ))}
            </div>
            <p className="text-text-muted text-xs">Max file size: 25MB</p>
          </div>
        ) : (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-success/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-text font-semibold truncate max-w-sm mx-auto">
                {file.name}
              </p>
              <p className="text-text-secondary text-sm">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      {file && !loading && (
        <button
          onClick={handleUpload}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-base"
          id="upload-button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          Process with AI
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-6 glass-card p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center pulse-glow">
              <div className="spinner"></div>
            </div>
          </div>
          <div>
            <p className="text-text font-semibold">{progress}</p>
            <p className="text-text-secondary text-sm mt-1">
              This may take a minute depending on audio length
            </p>
          </div>
          <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full shimmer" style={{ width: "70%" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
