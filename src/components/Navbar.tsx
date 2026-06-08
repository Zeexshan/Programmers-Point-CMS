/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Network, Trophy, LogIn, LogOut, Sun, Moon, User as UserIcon, Code2, Settings, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentView: string;
  onSetView: (view: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  currentView,
  onSetView,
  theme,
  toggleTheme
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo */}
        <div
          id="nav-brand"
          onClick={() => onSetView('problems')}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-indigo-400 dark:to-violet-400">
            Programmers Point
          </span>
        </div>

        {/* Middle Links */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            id="nav-problems-btn"
            onClick={() => onSetView('problems')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              currentView === 'problems' || currentView === 'arena'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Network size={16} />
            <span>Problems</span>
          </button>

          <button
            id="nav-leaderboard-btn"
            onClick={() => onSetView('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              currentView === 'leaderboard'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Trophy size={16} />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Light/Dark Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Connect indicator badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Local Core + API Live</span>
          </div>

          {/* Session Profile Control */}
          {user ? (
            <div className="relative">
              <button
                id="avatar-dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 p-0.5 transition hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256'}
                  alt={user.username}
                  className="h-7 w-7 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                  onError={(e) => {
                    // Fallback avatar
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256';
                  }}
                />
                <span className="hidden sm:inline text-xs font-semibold px-1 text-slate-700 dark:text-slate-300">
                  {user.username}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  id="avatar-dropdown-menu"
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Coding Profile</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.full_name || user.username}
                    </p>
                  </div>

                  <button
                    id="dropdown-profile-btn"
                    onClick={() => {
                      onSetView('profile');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <UserIcon size={14} />
                    <span>My Profile</span>
                  </button>

                  <button
                    id="dropdown-settings-btn"
                    onClick={() => {
                      onSetView('profile');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>

                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Links bar */}
      <div className="flex sm:hidden items-center justify-around border-t border-slate-100 bg-slate-50/50 py-1 dark:border-slate-900 dark:bg-slate-950/50">
        <button
          id="nav-problems-mobile-btn"
          onClick={() => onSetView('problems')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 text-xs font-semibold ${
            currentView === 'problems' || currentView === 'arena'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400'
          }`}
        >
          <Network size={16} />
          <span>Problems</span>
        </button>

        <button
          id="nav-leaderboard-mobile-btn"
          onClick={() => onSetView('leaderboard')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1 text-xs font-semibold ${
            currentView === 'leaderboard'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400'
          }`}
        >
          <Trophy size={16} />
          <span>Leaderboard</span>
        </button>
      </div>
    </nav>
  );
}
