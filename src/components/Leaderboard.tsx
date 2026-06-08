/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, Flame, Target, Star, Award } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_points: number;
  problems_solved: number;
  current_streak: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardItem[];
  currentUsername?: string;
}

export default function Leaderboard({ leaderboard, currentUsername }: LeaderboardProps) {
  return (
    <div id="leaderboard-layout-container" className="py-6 space-y-6">
      {/* scoreboard banner heading */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 p-6 dark:border-indigo-950/20 dark:from-indigo-950/20 dark:to-violet-950/20">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-600 p-3 text-white">
            <Trophy size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Institute Coding Leaderboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Compete with cohorts in your programming stream! Merit rankings are determined by cumulative points earned from correct code compilation and problem difficulty weights.
            </p>
          </div>
        </div>
      </div>

      {/* Podium Showcase for top 3 */}
      <div id="leaderboard-podium" className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto py-4">
        {/* Number 2 */}
        {leaderboard.length > 1 && (
          <div className="order-2 sm:order-1 flex flex-col items-center justify-end p-5 bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center h-52 self-end shadow-xs">
            <div className="relative">
              <img
                src={leaderboard[1].avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'}
                alt={leaderboard[1].username}
                className="h-14 w-14 rounded-full object-cover border-2 border-slate-300 shadow-md"
              />
              <span className="absolute -top-2 -right-2 bg-slate-300 text-slate-800 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">2</span>
            </div>
            <h4 className="mt-2 text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-[120px]">
              {leaderboard[1].full_name || leaderboard[1].username}
            </h4>
            <p className="text-3xs text-indigo-500 dark:text-indigo-400 font-extrabold flex items-center gap-0.5 mt-0.5">
              <Star size={10} className="fill-indigo-500" />
              <span>{leaderboard[1].total_points} PTS</span>
            </p>
            <div className="flex gap-2 mt-2 text-slate-400 text-3xs font-semibold">
              <span>{leaderboard[1].problems_solved}solved</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-orange-500"><Flame size={10} />{leaderboard[1].current_streak}d</span>
            </div>
          </div>
        )}

        {/* Number 1 Crown */}
        {leaderboard.length > 0 && (
          <div className="order-1 sm:order-2 flex flex-col items-center justify-end p-6 bg-gradient-to-b from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900 rounded-2xl border-2 border-indigo-500/80 text-center h-60 shadow-lg relative transform sm:scale-105">
            <span className="absolute -top-4 text-3xl animate-bounce">👑</span>
            <div className="relative">
              <img
                src={leaderboard[0].avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256'}
                alt={leaderboard[0].username}
                className="h-18 w-18 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
              />
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[11px] font-black h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">1</span>
            </div>
            <h4 className="mt-3 text-sm font-black text-slate-900 dark:text-white truncate max-w-[140px]">
              {leaderboard[0].full_name || leaderboard[0].username}
            </h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-1 mt-0.5">
              <Star size={11} className="fill-indigo-650" />
              <span>{leaderboard[0].total_points} PTS</span>
            </p>
            <div className="flex gap-2.5 mt-3 text-slate-500 dark:text-slate-400 text-3xs font-bold uppercase tracking-wider">
              <span>{leaderboard[0].problems_solved} solved</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-orange-500"><Flame size={11} />{leaderboard[0].current_streak}d streak</span>
            </div>
          </div>
        )}

        {/* Number 3 */}
        {leaderboard.length > 2 && (
          <div className="order-3 flex flex-col items-center justify-end p-5 bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center h-48 self-end shadow-xs">
            <div className="relative">
              <img
                src={leaderboard[2].avatar_url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256'}
                alt={leaderboard[2].username}
                className="h-12 w-12 rounded-full object-cover border-2 border-amber-600 shadow-md"
              />
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">3</span>
            </div>
            <h4 className="mt-2 text-sm font-bold text-slate-800 dark:text-white truncate max-w-[110px]">
              {leaderboard[2].full_name || leaderboard[2].username}
            </h4>
            <p className="text-3xs text-indigo-500 dark:text-indigo-400 font-extrabold flex items-center gap-0.5 mt-0.5">
              <Star size={10} className="fill-indigo-500" />
              <span>{leaderboard[2].total_points} PTS</span>
            </p>
            <div className="flex gap-2 mt-2 text-slate-400 text-3xs font-semibold">
              <span>{leaderboard[2].problems_solved} solves</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-orange-500"><Flame size={10} />{leaderboard[2].current_streak}d</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Ranking Table listing */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/60 dark:bg-slate-950/30">
                <th className="px-6 py-4 w-16 text-center">Rank</th>
                <th className="px-6 py-4">Developer</th>
                <th className="px-6 py-4 text-center">Problems Solved</th>
                <th className="px-6 py-4 text-center">Active Streak</th>
                <th className="px-6 py-4 text-right">Merit Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
              {leaderboard.map((student) => {
                const isCurrentUser = currentUsername === student.username;
                const medalSymbol = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : null;

                return (
                  <tr
                    id={`leaderboard-row-${student.username}`}
                    key={student.username}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      {medalSymbol ? (
                        <span className="text-lg">{medalSymbol}</span>
                      ) : (
                        <span className="font-mono text-xs font-bold text-slate-400">#{student.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256'}
                          alt={student.username}
                          className="h-8 w-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <span>{student.full_name || student.username}</span>
                            {isCurrentUser && (
                              <span className="rounded bg-indigo-600 px-1 py-0.5 text-4xs font-bold uppercase text-white tracking-widest leading-none">You</span>
                            )}
                          </p>
                          <p className="text-4xs text-slate-400 font-mono">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-center gap-1">
                        <Target size={14} className="text-indigo-400 dark:text-indigo-500" />
                        <span>{student.problems_solved}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                      <div className="flex items-center justify-center gap-1 text-orange-500">
                        <Flame size={14} className="fill-orange-500" />
                        <span>{student.current_streak} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                        <Award size={13} />
                        {student.total_points} PTS
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
