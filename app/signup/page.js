"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 fade-up">
      <div className="glass-card p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-9-4.5h.008v.008H6V4.5zM15 18a3 3 0 10-6 0 3 3 0 006 0zm-2-12a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
          <p className="text-text-secondary mt-2">Join MeetingAI today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-border focus:border-primary px-4 py-3 rounded-xl outline-none transition-all text-text"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border focus:border-primary px-4 py-3 rounded-xl outline-none transition-all text-text"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border focus:border-primary px-4 py-3 rounded-xl outline-none transition-all text-text"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary ml-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface border border-border focus:border-primary px-4 py-3 rounded-xl outline-none transition-all text-text"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-light font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
