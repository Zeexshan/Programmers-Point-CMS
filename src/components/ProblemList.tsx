/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Problem } from '../types';
import { Search, Flame, Award, Layers, Sparkles, ServerCrash, Check, BookOpen, Clock } from 'lucide-react';

interface ProblemListProps {
  problems: Problem[];
  solvedIds: Set<string>;
  onSelectProblem: (id: string) => void;
  userStats: {
    total_points: number;
    problems_solved: number;
    current_streak: number;
    longest_streak: number;
  };
  mode: string;
}

export default function ProblemList({
  problems,
  solvedIds,
  onSelectProblem,
  userStats,
  mode
}: ProblemListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive available categories
  const categories = ['All', ...Array.from(new Set(problems.map(p => p.category)))];

  // Filter problems
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div id="problem-list-container" className="py-6 space-y-6">
      {/* progress banner metrics dashboard */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2 text-orange-500 dark:bg-orange-950/40">
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Active Streak</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {userStats.current_streak} {userStats.current_streak === 1 ? 'day' : 'days'}
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-medium">Longest: {userStats.longest_streak} days</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-500 dark:bg-indigo-950/40">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Solve Merits</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {userStats.total_points} PTS
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-medium">Rankings refresh daily</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2 text-violet-500 dark:bg-violet-950/40">
              <Check size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Problems Solved</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {solvedIds.size} / {problems.length}
              </h3>
            </div>
          </div>
          {/* Solving percentage bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${problems.length ? (solvedIds.size / problems.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-500 dark:bg-emerald-950/40">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Provider Status</p>
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 uppercase truncate">
                {mode === 'google-sheets' ? 'Sheets Sync' : 'Default Sandbox'}
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-medium truncate">
            {mode === 'google-sheets' ? 'Connected to Problem Bank' : 'Local Fallback active'}
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-50 p-4 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            id="problem-search"
            type="text"
            placeholder="Search problems by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Difficulties */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              id={`diff-btn-${diff.toLowerCase()}`}
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              Category: {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Main Problems Table Card Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/60 dark:bg-slate-950/30">
                <th className="px-6 py-4 w-12 text-center">Status</th>
                <th className="px-6 py-4">Challenge Title</th>
                <th className="px-6 py-4">Section / Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-center">Points Award</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((p) => {
                  const isSolved = solvedIds.has(p.id);
                  return (
                    <tr
                      id={`problem-row-${p.id}`}
                      key={p.id}
                      className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 text-center">
                        {isSolved ? (
                          <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="mx-auto h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          onClick={() => onSelectProblem(p.id)}
                          className="cursor-pointer font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400"
                        >
                          {p.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <Layers size={11} />
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.difficulty === 'Easy'
                              ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : p.difficulty === 'Medium'
                              ? 'bg-amber-50 text-amber-650 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-650 dark:bg-rose-950/30 dark:text-rose-450'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {p.points}p
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`solve-btn-${p.id}`}
                          onClick={() => onSelectProblem(p.id)}
                          className="rounded-lg bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white"
                        >
                          Solve Challenge
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <ServerCrash className="mx-auto mb-2 text-slate-300 dark:text-slate-750" size={32} />
                    <p className="text-sm font-semibold">No problems match your selection criteria</p>
                    <p className="text-xs text-slate-400">Try modifying filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
