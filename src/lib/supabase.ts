/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Retrieve values directly, falling back to process.env (Node server) or import.meta.env (client dev setup)
const supabaseUrl = typeof process !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : ((import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.VITE_NEXT_PUBLIC_SUPABASE_URL);

const supabaseAnonKey = typeof process !== 'undefined'
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseServiceRoleKey = typeof process !== 'undefined'
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : undefined;

// Create public client
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Create admin client (server side only)
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null;

/**
 * Checks if Supabase client is properly initialized
 */
export function isSupabaseConfigured() {
  return !!supabaseClient;
}

/**
 * Checks if Supabase server-side Admin client is properly initialized
 */
export function isSupabaseAdminConfigured() {
  return !!supabaseAdmin;
}
