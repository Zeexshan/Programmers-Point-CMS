/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Key, Mail, User, ShieldAlert, MonitorPlay, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!supabaseClient) {
      setErrorMsg('Supabase is not configured yet. Please log in using "Guest Demo Account".');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim() || 'coder_' + Math.random().toString(36).substring(7),
              full_name: fullName.trim() || 'Institute Student'
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            username: username || 'coder_new',
            full_name: fullName || 'New Student',
            avatar_url: '',
            bio: 'Learning coding on Programmers Point!'
          });
          onClose();
        }
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          // Fetch associated profile
          const { data: prof } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            username: prof?.username || 'user_' + data.user.id.substring(0, 6),
            full_name: prof?.full_name || '',
            avatar_url: prof?.avatar_url || '',
            bio: prof?.bio || ''
          });
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role: 'admin' | 'student') => {
    const demoUser = role === 'admin' ? {
      id: 'demo-admin-id',
      email: 'admin@programmerspoint.com',
      username: 'admin_coder',
      full_name: 'Lead Instructor',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256',
      bio: 'Admin & Lead Curriculum Creator at Programmers Point programming institute.',
      created_at: new Date().toISOString()
    } : {
      id: 'demo-user-id',
      email: 'student@programmerspoint.com',
      username: 'coder_demo',
      full_name: 'Demo Programmer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
      bio: 'Solving hard bugs, one semicolon at a time. Coding from Google AI Studio!',
      created_at: new Date().toISOString()
    };
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div id="auth-modal" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all">
        <div className="bg-slate-50 p-6 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Programmers Point</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Join the code solving arena</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 text-sm">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 mb-6">
            <button
              id="signin-tab-btn"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${!isSignUp ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              id="signup-tab-btn"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${isSignUp ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSupabaseAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Username (unique)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="signup-username"
                      type="text"
                      required
                      placeholder="ninja_coder"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="signup-fullname"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="student@institute.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : isSignUp ? (
                <>
                  <UserPlus size={16} />
                  <span>Register Student</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In student</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-800"></span>
            <span className="relative bg-white px-3 text-xs font-bold text-slate-400 uppercase dark:bg-slate-900">
              Or bypass for sandbox preview
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="login-demo-student-btn"
              onClick={() => loginAsDemo('student')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <MonitorPlay size={14} className="text-indigo-500" />
              <span>Guest Student</span>
            </button>
            <button
              id="login-demo-admin-btn"
              onClick={() => loginAsDemo('admin')}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ShieldAlert size={14} className="text-emerald-500" />
              <span>Guest Instructor</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <button id="close-auth-btn" onClick={onClose} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold underline">
            Continue browsing without login
          </button>
        </div>
      </div>
    </div>
  );
}
