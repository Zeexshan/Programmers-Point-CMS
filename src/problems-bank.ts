/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Problem } from './types';

export const fallbackProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

### Example 3:
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`
`,
    points: 10,
    category: 'Arrays & Hashing',
    boilerplate: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    test_cases: [
      { input: '[[2,7,11,15], 9]', expected: '[0,1]' },
      { input: '[[3,2,4], 6]', expected: '[1,2]' },
      { input: '[[3,3], 6]', expected: '[0,1]' }
    ]
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` *if it is a **palindrome**, or \`false\` otherwise*.

### Example 1:
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

### Example 2:
\`\`\`
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
\`\`\`
`,
    points: 15,
    category: 'Two Pointers',
    boilerplate: {
      javascript: `function isPalindrome(s) {
  // Write your code here
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      python: `def is_palindrome(s: str) -> bool:
    # Write your code here
    cleaned = "".join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`
    },
    test_cases: [
      { input: '["A man, a plan, a canal: Panama"]', expected: 'true' },
      { input: '["race a car"]', expected: 'false' },
      { input: '[" "]', expected: 'true' }
    ]
  },
  {
    id: 'fibonacci-number',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from \`0\` and \`1\`. That is:

\`\`\`
F(0) = 0, F(1) = 1
F(N) = F(N - 1) + F(N - 2), for N > 1.
\`\`\`

Given \`n\`, calculate \`F(n)\`.

### Example 1:
\`\`\`
Input: n = 2
Output: 1
Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
\`\`\`

### Example 2:
\`\`\`
Input: n = 4
Output: 3
Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.
\`\`\`
`,
    points: 10,
    category: 'Dynamic Programming',
    boilerplate: {
      javascript: `function fib(n) {
  // Write your code here
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
      python: `def fib(n: int) -> int:
    # Write your code here
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`
    },
    test_cases: [
      { input: '[2]', expected: '1' },
      { input: '[3]', expected: '2' },
      { input: '[4]', expected: '3' },
      { input: '[9]', expected: '34' }
    ]
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with \`O(1)\` extra memory.

### Example 1:
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

### Example 2:
\`\`\`
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
\`\`\`
`,
    points: 10,
    category: 'Two Pointers',
    boilerplate: {
      javascript: `function reverseString(s) {
  // Write your code here
  s.reverse();
  return s;
}`,
      python: `def reverse_string(s):
    # Write your code here
    s.reverse()
    return s`
    },
    test_cases: [
      { input: '[["h","e","l","l","o"]]', expected: '["o","l","l","e","h"]' },
      { input: '[["H","a","n","n","a","h"]]', expected: '["h","a","n","n","a","H"]' }
    ]
  }
];
