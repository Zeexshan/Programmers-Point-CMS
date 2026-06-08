/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchProblemsFromSheet } from './src/lib/sheets';
import { fallbackProblems } from './src/problems-bank';
import { supabaseAdmin, supabaseClient } from './src/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary if keys exist
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.replace(/^[\["]+|[\]"]+$/g, '');
const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^[\["]+|[\]"]+$/g, '');
const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^[\["]+|[\]"]+$/g, '');

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('Cloudinary configured successfully.');
} else {
  console.warn('Cloudinary not configured. Undergoing local base64 upload mode.');
}

// Verify that all required environment variables are present and not empty/placeholder
const requiredKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_SHEETS_ID',
  'GOOGLE_SERVICE_ACCOUNT_JSON'
];

for (const key of requiredKeys) {
  const value = process.env[key];
  if (!value || value.trim() === '' || value.includes('placeholder') || value === `MY_${key}` || value.includes('sb_secret_placeholder')) {
    console.error(`\n======================================================`);
    console.error(`FATAL ERROR: Required environment variable "${key}" is missing or empty!`);
    console.error(`Please register "${key}" in your .env file to run Programmers Point.`);
    console.error(`======================================================\n`);
    throw new Error(`CRITICAL CONFIGURATION ERROR: Required environment variable ${key} is missing or empty. Server is refusing to run.`);
  }
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // API ROUTE: FETCH PROBLEMS (from custom Google Sheet or fallback)
  app.get('/api/problems', async (req, res) => {
    try {
      const sheetId = process.env.GOOGLE_SHEETS_ID;
      if (sheetId && sheetId !== 'MY_GOOGLE_SHEETS_ID') {
        const sheetProblems = await fetchProblemsFromSheet(sheetId);
        if (sheetProblems && sheetProblems.length > 0) {
          return res.json({ success: true, mode: 'google-sheets', data: sheetProblems });
        }
      }
      // If sheets fail or empty, use fallback problems bank
      return res.json({ success: true, mode: 'local-fallback', data: fallbackProblems });
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      // Resilience fallback
      return res.json({ success: true, mode: 'local-fallback-error', data: fallbackProblems });
    }
  });

  // API ROUTE: EXECUTE CODE THROUGH PISTON SANDBOX
  app.post('/api/execute', async (req, res) => {
    const { code, language, problemId } = req.body;
    if (!code || !language || !problemId) {
      return res.status(400).json({ error: 'Missing code, language, or problem ID.' });
    }

    // 1. Fetch the target problem descriptors (to acquire test cases)
    let problems = fallbackProblems;
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (sheetId && sheetId !== 'MY_GOOGLE_SHEETS_ID') {
      const sheetProblems = await fetchProblemsFromSheet(sheetId);
      if (sheetProblems && sheetProblems.length > 0) {
        problems = sheetProblems;
      }
    }
    const problem = problems.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem definition not found.' });
    }

    try {
      // 2. Synthesize compiler runner harness based on language
      let runtimeLang = 'javascript';
      let runtimeVersion = '*';
      let wrappedFileContent = '';

      if (language === 'javascript' || language === 'node') {
        runtimeLang = 'javascript';
        runtimeVersion = '*';
        const tcString = JSON.stringify(problem.test_cases);
        wrappedFileContent = `
${code}

// Test cases run harness injected by Programmers Point Platform
const testCases = ${tcString};
function runTestCases() {
  let fn = null;
  const commonNames = ['twoSum', 'isPalindrome', 'fib', 'reverseString', 'two_sum', 'is_palindrome', 'fibonacci'];
  
  // Scour scopes for solution method
  for (let name of commonNames) {
    if (typeof globalThis[name] === 'function') {
      fn = globalThis[name];
      break;
    }
  }
  if (!fn) {
    const keys = Object.keys(globalThis);
    for (let key of keys) {
      if (typeof globalThis[key] === 'function' && !['runTestCases', 'fetch', 'setTimeout', 'setInterval', 'clearTimeout'].includes(key)) {
        fn = globalThis[key];
        break;
      }
    }
  }

  if (!fn) {
    console.log("EVAL_ERROR: No user solution function found globally.");
    return;
  }

  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const inputArgs = JSON.parse(tc.input);
      const expectedOut = JSON.parse(tc.expected);
      const output = fn(...inputArgs);
      
      const passed = JSON.stringify(output) === JSON.stringify(expectedOut);
      results.push({
        index: i,
        passed,
        actual: output,
        expected: expectedOut
      });
    } catch (err) {
      results.push({
        index: i,
        passed: false,
        error: err.message
      });
    }
  }
  console.log("EVAL_RESULTS_JSON:" + JSON.stringify(results));
}

runTestCases();
`;
      } else if (language === 'python' || language === 'python3') {
        runtimeLang = 'python';
        runtimeVersion = '*';
        const tcString = JSON.stringify(problem.test_cases);
        wrappedFileContent = `
import json
import sys

# User Submission Code Loaded
${code}

# Test cases runner harness
test_cases = json.loads('''${tcString}''')

fn = None
for name in ['two_sum', 'is_palindrome', 'fib', 'reverse_string', 'twoSum', 'isPalindrome', 'fibonacci']:
    if name in globals() and callable(globals()[name]):
        fn = globals()[name]
        break

if not fn:
    for name, obj in list(globals().items()):
        if callable(obj) and not name.startswith('__') and name not in ['json', 'sys']:
            fn = obj
            break

if not fn:
    print("EVAL_ERROR: No solution function detected.")
    sys.exit(0)

results = []
for i, tc in enumerate(test_cases):
    try {
        args = json.loads(tc['input'])
        expected = json.loads(tc['expected'])
        actual = fn(*args)
        passed = actual == expected
        results.append({
            "index": i,
            "passed": passed,
            "actual": actual,
            "expected": expected
        })
    except Exception as e:
        results.append({
            "index": i,
            "passed": False,
            "error": str(e)
        })

print("EVAL_RESULTS_JSON:" + json.dumps(results))
`;
      } else {
        return res.status(400).json({ error: 'Language not supported by automated testing.' });
      }

      // 3. Post execution command directly to public Piston engine
      const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: runtimeLang,
          version: runtimeVersion,
          files: [
            {
              name: runtimeLang === 'javascript' ? 'solution.js' : 'solution.py',
              content: wrappedFileContent
            }
          ]
        })
      });

      if (!pistonResponse.ok) {
        throw new Error(`Piston API returned status ${pistonResponse.status}`);
      }

      const rawRunData: any = await pistonResponse.json();
      const stdout = rawRunData.run?.stdout || '';
      const stderr = rawRunData.run?.stderr || '';

      // Parse status
      let parsedResults: any = null;
      let status: 'accepted' | 'wrong' | 'error' | 'timeout' = 'wrong';

      if (stderr) {
        status = 'error';
      } else if (stdout.includes('EVAL_ERROR')) {
        status = 'error';
      } else {
        const jsonMatch = stdout.match(/EVAL_RESULTS_JSON:(.*)/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedResults = JSON.parse(jsonMatch[1]);
            const allPassed = parsedResults.every((tc: any) => tc.passed === true);
            status = allPassed ? 'accepted' : 'wrong';
          } catch (e) {
            status = 'error';
          }
        } else {
          status = 'error';
        }
      }

      const responsePayload = {
        success: true,
        status,
        stdout,
        stderr,
        test_case_results: parsedResults,
        points_earned: status === 'accepted' ? problem.points : 0
      };

      return res.json(responsePayload);
    } catch (error: any) {
      console.error('Piston Sandbox execution failure:', error);
      return res.status(500).json({ error: 'Sandbox execution error.', details: error.message });
    }
  });

  // API ROUTE: SAVE SUBMISSIONS & MERIT POINTS
  app.post('/api/submissions/save', async (req, res) => {
    const { user_id, problem_id, code, language, status, points_earned } = req.body;
    if (!user_id || !problem_id || !status) {
      return res.status(400).json({ error: 'Missing required sync data fields.' });
    }

    try {
      // If Supabase Admin Client is up, insert directly into live remote database
      if (supabaseAdmin) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user_id).single();
        if (!profile) {
          // Try to bootstrap user profile if it doesn't exist
          await supabaseAdmin.from('profiles').insert({
            id: user_id,
            username: `user_${user_id.substring(0, 8)}`,
            full_name: 'Coder',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'
          });
        }

        // Insert Submission row
        const { data: sub, error: subErr } = await supabaseAdmin.from('submissions').insert({
          user_id,
          problem_id,
          code,
          language,
          status,
          points_earned
        }).select().single();

        if (subErr) throw subErr;

        // Fetch current points total to increment
        const { data: currentPts, error: ptErr } = await supabaseAdmin
          .from('user_points')
          .select('*')
          .eq('user_id', user_id)
          .single();

        let updatedPoints = points_earned;
        let finalSolvedCount = status === 'accepted' ? 1 : 0;
        let currentStreak = 1;
        let longestStreak = 1;

        if (currentPts) {
          updatedPoints = currentPts.total_points + points_earned;
          finalSolvedCount = currentPts.problems_solved + (status === 'accepted' ? 1 : 0);
          
          // Basic streak calculations
          const today = new Date().toISOString().split('T')[0];
          if (currentPts.last_solved_date === today) {
            currentStreak = currentPts.current_streak;
          } else {
            // Check if last solve was yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (currentPts.last_solved_date === yesterdayStr) {
              currentStreak = currentPts.current_streak + (status === 'accepted' ? 1 : 0);
            } else {
              currentStreak = status === 'accepted' ? 1 : 0;
            }
          }
          longestStreak = Math.max(currentPts.longest_streak, currentStreak);

          await supabaseAdmin.from('user_points').update({
            total_points: updatedPoints,
            problems_solved: finalSolvedCount,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_solved_date: status === 'accepted' ? today : currentPts.last_solved_date
          }).eq('user_id', user_id);
        } else {
          await supabaseAdmin.from('user_points').insert({
            user_id,
            total_points: points_earned,
            problems_solved: status === 'accepted' ? 1 : 0,
            current_streak: status === 'accepted' ? 1 : 0,
            longest_streak: status === 'accepted' ? 1 : 0,
            last_solved_date: status === 'accepted' ? new Date().toISOString().split('T')[0] : null
          });
        }

        // Eval badges thresholds for live client
        const { data: badges } = await supabaseAdmin.from('badges').select('*');
        if (badges) {
          for (let badge of badges) {
            let qualifies = false;
            if (badge.criteria_type === 'total_points' && updatedPoints >= badge.criteria_value) qualifies = true;
            if (badge.criteria_type === 'problems_solved' && finalSolvedCount >= badge.criteria_value) qualifies = true;
            if (badge.criteria_type === 'streak' && currentStreak >= badge.criteria_value) qualifies = true;

            if (qualifies) {
              // Earn badge without duplication
              try {
                await supabaseAdmin.from('user_badges').insert({
                  user_id,
                  badge_id: badge.id
                });
              } catch (badgeErr) {
                // Ignore key constraint duplication errors
              }
            }
          }
        }

        return res.json({ success: true, mode: 'supabase', data: sub });
      } else {
        return res.status(500).json({ error: 'Supabase client is not configured.' });
      }
    } catch (err: any) {
      console.error('Failed to register solve data:', err);
      return res.status(500).json({ error: 'DB persistence error.', details: err.message });
    }
  });

  // API ROUTE: FETCH USER STATS SUMMARY & SOLVED RATIOS
  app.get('/api/user-stats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client is not configured.' });
      }
      const { data: pts } = await supabaseAdmin.from('user_points').select('*').eq('user_id', userId).single();
      const { data: subCount } = await supabaseAdmin.from('submissions').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      const { data: badges } = await supabaseAdmin.from('user_badges').select('*, badges(*)').eq('user_id', userId);

      return res.json({
        success: true,
        total_points: pts?.total_points || 0,
        problems_solved: pts?.problems_solved || 0,
        current_streak: pts?.current_streak || 0,
        longest_streak: pts?.longest_streak || 0,
        total_submissions: subCount || 0,
        badges: badges || []
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed getting user telemetry.' });
    }
  });

  // API ROUTE: CLOUDINARY AVATAR AND IMAGE STORAGE UPLOADS
  app.post('/api/upload-avatar', async (req, res) => {
    const { image, user_id } = req.body; // base64 payload
    if (!image || !user_id) {
      return res.status(400).json({ error: 'Missing base64 image content or user target ID.' });
    }

    try {
      let finalAvatarUrl = '';

      if (cloudName && apiKey && apiSecret) {
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'programmers_point_avatars',
          public_id: `avatar_${user_id}`,
          overwrite: true
        });
        finalAvatarUrl = uploadResponse.secure_url;
      } else {
        // Fallback: Use directly in the client as local storage base64
        finalAvatarUrl = image;
      }

      // Sync into DB profiles
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client is not configured.' });
      }
      await supabaseAdmin.from('profiles').update({ avatar_url: finalAvatarUrl }).eq('id', user_id);

      return res.json({ success: true, avatar_url: finalAvatarUrl });
    } catch (error: any) {
      console.error('Image upload failed:', error);
      return res.status(500).json({ error: 'Upload failed.', details: error.message });
    }
  });

  // API ROUTE: FETCH LEADERBOARD / scoreboard DIVISION
  app.get('/api/leaderboard', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase client is not configured.' });
      }
      // SQL query pulling users join points
      const { data, error } = await supabaseAdmin
        .from('user_points')
        .select('total_points, problems_solved, current_streak, profiles(username, full_name, avatar_url)')
        .order('total_points', { ascending: false });

      if (error) throw error;

      const formatted = data.map((item: any, rankIdx: number) => ({
        rank: rankIdx + 1,
        username: item.profiles?.username || 'Unknown Coder',
        full_name: item.profiles?.full_name || '',
        avatar_url: item.profiles?.avatar_url || '',
        total_points: item.total_points,
        problems_solved: item.problems_solved,
        current_streak: item.current_streak
      }));

      return res.json({ success: true, leaderboard: formatted });
    } catch (err: any) {
      return res.status(500).json({ error: 'Leaderboard loading failed.', details: err.message });
    }
  });

  // Vite development live middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production statics files delivery
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Programmers Point full-stack engine running on port ${PORT}`);
  });
}

startServer();
