"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: "/", label: "Upload", icon: MicIcon },
    { href: "/history", label: "History", icon: ClockIcon },
  ];

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">
              MeetingAI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary-light border border-primary/20"
                      : "text-text-secondary hover:text-text hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-text line-clamp-1">{user.name}</p>
                  <p className="text-xs text-text-muted line-clamp-1">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all ml-1"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-text-secondary hover:text-text px-4 py-2 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MicIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
