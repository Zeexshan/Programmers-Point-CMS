/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string; // auth.users UUID
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export type SubmissionStatus = 'accepted' | 'wrong' | 'error' | 'timeout' | 'running';

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  problem_title?: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  points_earned: number;
  submitted_at: string;
  stdout?: string;
  error_detail?: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  problems_solved: number;
  current_streak: number;
  longest_streak: number;
  last_solved_date?: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_emoji: string;
  criteria_type: 'total_points' | 'problems_solved' | 'streak';
  criteria_value: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface MonthlyRanking {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  month: number;
  year: number;
  rank: number;
  total_points: number;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  points: number;
  category: string;
  boilerplate: {
    javascript?: string;
    python?: string;
    cpp?: string;
    java?: string;
  };
  test_cases: TestCase[];
}
