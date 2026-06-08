/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, Save, Award, Clipboard, ShieldCheck, HelpCircle, Flame, Star, Send } from 'lucide-react';

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_emoji: string;
}

interface ProfileSettingsProps {
  user: any;
  onUpdateUser: (updatedFields: any) => void;
  onRefreshStats: () => void;
}

export default function ProfileSettings({ user, onUpdateUser, onRefreshStats }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Stats details loaded via API
  const [stats, setStats] = useState({
    total_points: 0,
    problems_solved: 0,
    current_streak: 0,
    longest_streak: 0,
    total_submissions: 0,
    badges: [] as any[]
  });

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const response = await fetch(`/api/user-stats/${user.id}`);
        const data = await response.json();
        if (data.success) {
          setStats({
            total_points: data.total_points,
            problems_solved: data.problems_solved,
            current_streak: data.current_streak,
            longest_streak: data.longest_streak,
            total_submissions: data.total_submissions,
            badges: data.badges
          });
        }
      } catch (err) {
        console.error('Failed fetching credentials telemetry.', err);
      }
    }
    if (user?.id) {
      loadTelemetry();
    }
  }, [user, saving]);

  // Update text fields
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Direct state update or DB post
      const response = await fetch('/api/submissions/save', { // simple save trigger
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          problem_id: 'sync-profile', // custom profile update code key
          code: JSON.stringify({ fullName, bio }),
          language: 'meta',
          status: 'accepted',
          points_earned: 0
        })
      });

      onUpdateUser({
        full_name: fullName,
        bio: bio
      });
      alert('Profile details updated successfully!');
      onRefreshStats();
    } catch (err) {
      alert('Error updating profile info.');
    } finally {
      setSaving(false);
    }
  };

  // Convert uploaded image to base64 and post to public compilation/avatar engine
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile picture size must not exceed 5MB!');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64String,
            user_id: user.id
          })
        });

        const data = await response.json();
        if (data.success) {
          onUpdateUser({ avatar_url: data.avatar_url });
          alert('Avatar picture uploaded and synchronized successfully!');
        } else {
          throw new Error(data.error);
        }
      } catch (err: any) {
        alert('Image sync failed: ' + (err.message || 'Check Cloudinary limits.'));
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="profile-container" className="py-6 space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row gap-6 bg-white border border-slate-200 p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-xs">
        {/* Left avatar edit container */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group cursor-pointer inline-block rounded-full overflow-hidden border-4 border-indigo-100 dark:border-slate-800">
            <img
              id="profile-avatar-display"
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256'}
              alt={user?.username}
              className="h-28 w-28 rounded-full object-cover transition duration-300 group-hover:scale-105"
            />
            {/* Hover overlay edit trigger */}
            <label
              htmlFor="avatar-file-input"
              className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <Camera size={20} />
              <span className="text-4xs font-bold uppercase tracking-wider mt-1">Upload Pfp</span>
            </label>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
          {uploading && (
            <span className="text-4xs text-indigo-500 font-extrabold uppercase mt-2 animate-pulse">Syncing Image...</span>
          )}

          <div className="mt-3 text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {user?.full_name || user?.username}
            </h3>
            <p className="text-xs text-slate-400 font-mono font-medium">@{user?.username}</p>
          </div>
        </div>

        {/* Right bio text inputs section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800/60">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Academic Portfolio</span>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-3xs font-black text-slate-450 uppercase mb-1">Full Representative Name</label>
                <input
                  id="profile-full-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-transparent py-2 px-3 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-850 dark:text-white"
                  placeholder="Demo Instructor"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-slate-450 uppercase mb-1">Unique Identifier</label>
                <input
                  type="text"
                  disabled
                  value={user?.email || 'N/A'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-400 dark:border-slate-850"
                  title="Unique emails cannot be altered after sign up"
                />
              </div>
            </div>

            <div>
              <label className="block text-3xs font-black text-slate-450 uppercase mb-1">Developer Bio</label>
              <textarea
                id="profile-bio-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2 px-3 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-850 dark:text-white"
                placeholder="Share your goals and stream specialization details..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-3xs text-emerald-500 font-extrabold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Account registered: {user?.id?.includes('demo') ? 'Guest' : 'Supabase integration client'}
              </span>

              <button
                id="profile-save-btn"
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={14} />
                <span>Save portfolio changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Badges and detailed metric counters split layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left detailed statistics panel */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Challenge Statistics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50/50 dark:border-slate-850 pb-2">
              <span className="text-slate-500 text-xs font-semibold">Total Points Cumulative</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                <Star size={13} className="fill-indigo-600" />
                {stats.total_points}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50/50 dark:border-slate-850 pb-2">
              <span className="text-slate-500 text-xs font-semibold">Problems Answered Correctly</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{stats.problems_solved} solved</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50/50 dark:border-slate-850 pb-2">
              <span className="text-slate-500 text-xs font-semibold">Total Code Submissions</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">{stats.total_submissions} runs</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50/50 dark:border-slate-850 pb-2">
              <span className="text-slate-500 text-xs font-semibold">Solve Success Ratio</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                {stats.total_submissions ? Math.round((stats.problems_solved / stats.total_submissions) * 100) : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold">Solving Streak Maximums</span>
              <span className="text-sm font-black text-orange-500 flex items-center gap-0.5">
                <Flame size={13} className="fill-orange-500" />
                {stats.longest_streak} days
              </span>
            </div>
          </div>
        </div>

        {/* Right accolades badges panel */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Earned Platform Badges ({stats.badges.length})</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.badges.length > 0 ? (
              stats.badges.map((b, idx) => {
                const badgeInfo = b.badges || b;
                return (
                  <div key={idx} className="flex gap-3 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/40 relative overflow-hidden group">
                    <span className="absolute right-2 top-2 text-indigo-500 opacity-25 group-hover:scale-105 transition"><Award size={24} /></span>
                    <div className="text-3xl shrink-0 p-1.5 bg-white rounded-lg border border-indigo-100/60 dark:bg-slate-900 dark:border-slate-800 h-14 w-14 flex items-center justify-center">
                      {badgeInfo.icon_emoji || '🔥'}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">{badgeInfo.name}</h5>
                      <p className="text-3xs text-slate-500 leading-normal mt-0.5 line-clamp-2">{badgeInfo.description}</p>
                      <p className="text-4xs font-mono font-bold text-indigo-500 tracking-wider uppercase mt-1">Earned on platform</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
                <Award className="mx-auto mb-1.5 text-slate-350" size={32} />
                <p className="text-xs font-bold">No badges unlocked yet</p>
                <p className="text-4xs text-slate-400 px-6 max-w-sm mx-auto">Complete programming challenges, accumulate points, and maintain active solving streaks to trigger automatic awards!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
