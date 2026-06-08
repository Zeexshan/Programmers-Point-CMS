/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Problem, SubmissionStatus } from '../types';
import { ChevronLeft, Play, Send, RotateCcw, AlertCircle, CheckCircle, Terminal, HelpCircle, Loader2, Sparkles } from 'lucide-react';

interface CodeArenaProps {
  problem: Problem;
  userId: string | null;
  onBack: () => void;
  onRefreshStats: () => void;
  onRequireAuth: () => void;
  currentTheme: 'light' | 'dark';
}

export default function CodeArena({
  problem,
  userId,
  onBack,
  onRefreshStats,
  onRequireAuth,
  currentTheme
}: CodeArenaProps) {
  // Select active language
  const [lang, setLang] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState('');
  
  // Terminal status
  const [activeTab, setActiveTab] = useState<'testcases' | 'results'>('testcases');
  const [executionLoading, setExecutionLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [execStatus, setExecStatus] = useState<SubmissionStatus | null>(null);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [tcResults, setTcResults] = useState<any[] | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Sync boilerplate on language switch
  useEffect(() => {
    if (lang === 'javascript') {
      setCode(problem.boilerplate.javascript || `function solution() {\n  // Write JavaScript code here\n}`);
    } else {
      setCode(problem.boilerplate.python || `def solution():\n    # Write Python code here\n    pass`);
    }
  }, [lang, problem]);

  const handleReset = () => {
    if (window.confirm('Reset your code back to the challenge starting template?')) {
      if (lang === 'javascript') {
        setCode(problem.boilerplate.javascript || '');
      } else {
        setCode(problem.boilerplate.python || '');
      }
    }
  };

  // Run user code via compiler API
  const handleRunCode = async (isSubmission = false) => {
    if (isSubmission) {
      setSubmitLoading(true);
    } else {
      setExecutionLoading(true);
    }
    setActiveTab('results');
    setExecStatus('running');
    setStderr('');
    setStdout('');
    setTcResults(null);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: lang,
          problemId: problem.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Compilation engine timeout.');
      }

      setExecStatus(result.status);
      setStdout(result.stdout || '');
      setStderr(result.stderr || '');
      setTcResults(result.test_case_results || []);
      setPointsEarned(result.points_earned || 0);

      // If it's a real submission, persist to database
      if (isSubmission) {
        // Fallback user ID if no logged-in student (sync anonymous state or prompt)
        const targetUserId = userId || 'demo-user-id';

        await fetch('/api/submissions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: targetUserId,
            problem_id: problem.id,
            code,
            language: lang,
            status: result.status,
            points_earned: result.points_earned || 0
          })
        });

        // Trigger updates
        onRefreshStats();
        if (!userId) {
          // Tell them they solved but as guest
          alert(`Great! Challenge evaluated as ${result.status.toUpperCase()}! Please log in to permanently track your progress.`);
        }
      }
    } catch (err: any) {
      setExecStatus('error');
      setStderr(err.message || 'Connecting to sandbox failed.');
    } finally {
      setExecutionLoading(false);
      setSubmitLoading(false);
    }
  };

  // Basic layout renderer for problem description in clean jsx blocks
  const renderDescription = (text: string) => {
    return text.split('\n\n').map((block, i) => {
      if (block.startsWith('###') || block.startsWith('##')) {
        const title = block.replace(/^#+\s*/, '');
        return <h4 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">{title}</h4>;
      }
      if (block.startsWith('```')) {
        const codeText = block.replace(/```[a-zA-Z]*\n?|```$/g, '');
        return (
          <pre key={i} className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3 font-mono text-xs text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-pre">
            {codeText}
          </pre>
        );
      }
      return (
        <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {block.split('`').map((part, pi) => {
            if (part && pi % 2 === 1) {
              return (
                <code key={pi} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-850 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {part}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div id="code-arena-layout" className="flex flex-col h-[calc(100vh-4.5rem)] -mx-4 sm:-mx-6 transition-all">
      {/* Title Header split row */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <button
            id="arena-back-btn"
            onClick={onBack}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{problem.title}</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-3xs font-semibold ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
              }`}>
                {problem.difficulty}
              </span>
            </h2>
            <span className="text-4xs font-semibold text-slate-400 uppercase tracking-widest">{problem.category}</span>
          </div>
        </div>

        {/* IDE language switch controls */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850">
            <button
              id="lang-js-btn"
              onClick={() => setLang('javascript')}
              className={`px-3 py-1 text-3xs font-extrabold rounded-md uppercase tracking-wider transition ${
                lang === 'javascript'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-850 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'
              }`}
            >
              NodeJS (JS)
            </button>
            <button
              id="lang-py-btn"
              onClick={() => setLang('python')}
              className={`px-3 py-1 text-3xs font-extrabold rounded-md uppercase tracking-wider transition ${
                lang === 'python'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-850 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-250'
              }`}
            >
              Python 3
            </button>
          </div>

          <button
            id="arena-reset-template"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-3xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            title="Reset starting boilerplate code"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Dual Columns Panels split layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden min-h-0 bg-slate-50 dark:bg-slate-950">
        {/* Left Column: Problem Details */}
        <div className="w-full md:w-1/2 flex flex-col min-h-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-900">
              <span className="text-xs font-bold text-slate-400 uppercase">Challenge Description</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Award: +{problem.points} Merit Points</span>
            </div>
            
            <div id="problem-markdown-body" className="space-y-4 font-sans text-slate-700 dark:text-slate-300">
              {renderDescription(problem.description)}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Sandboxed Console */}
        <div className="w-full md:w-1/2 flex flex-col min-h-0 bg-white dark:bg-slate-950 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-900">
          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[30vh] border-b border-slate-200 dark:border-slate-800 relative">
            <MonacoEditor
              id="monaco-code-editor"
              height="100%"
              language={lang}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={currentTheme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                fontSize: 13,
                fontFamily: "Fira Code, JetBrains Mono, monospace",
                minimap: { enabled: false },
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbersMinChars: 3,
                automaticLayout: true
              }}
            />
          </div>

          {/* Compile Panel logs output Console */}
          <div className="h-56 shrink-0 flex flex-col bg-slate-50 dark:bg-slate-900 border-t border-slate-250 dark:border-slate-850">
            {/* Console Navigation Tab titles split */}
            <div className="flex shrink-0 border-b border-slate-200 bg-slate-100 px-4 dark:border-slate-800 dark:bg-slate-950/40 justify-between items-center h-8">
              <div className="flex gap-2">
                <button
                  id="console-testcases-tab"
                  onClick={() => setActiveTab('testcases')}
                  className={`flex items-center gap-1.5 py-1 text-3xs font-extrabold uppercase tracking-wide border-b-2 transition ${
                    activeTab === 'testcases' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  <HelpCircle size={12} />
                  <span>Interactive Test Cases</span>
                </button>
                <button
                  id="console-results-tab"
                  onClick={() => setActiveTab('results')}
                  className={`flex items-center gap-1.5 py-1 text-3xs font-extrabold uppercase tracking-wide border-b-2 transition ${
                    activeTab === 'results' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  <Terminal size={12} />
                  <span>Compiler Outputs</span>
                </button>
              </div>

              {/* Loader */}
              {execStatus === 'running' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Compiling Sandboxed Containers...</span>
                </div>
              )}
            </div>

            {/* Console Screen Body */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs min-h-0 bg-slate-950 text-slate-350 dark:bg-slate-950 dark:text-slate-200">
              {activeTab === 'testcases' ? (
                <div className="space-y-3">
                  {problem.test_cases.map((tc, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500/50 pl-2.5 space-y-1">
                      <p className="font-bold text-xs text-indigo-400 tracking-wider">Test Case #{idx + 1}</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <p><span className="font-semibold text-slate-500 font-sans">Input:</span> <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 text-slate-300 rounded font-mono">{tc.input}</code></p>
                        <p><span className="font-semibold text-slate-500 font-sans">Expected output:</span> <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 text-emerald-400 rounded font-mono">{tc.expected}</code></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full space-y-2">
                  {execStatus === 'running' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1.5 py-6">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                      <p className="font-sans text-xs font-semibold">Deploying isolated micro-sandbox ...</p>
                    </div>
                  )}

                  {execStatus === null && (
                    <p className="text-slate-500 italic text-center py-6 font-sans">
                      Run test cases or submit solution to execute on public compilers.
                    </p>
                  )}

                  {execStatus && execStatus !== 'running' && (
                    <div className="space-y-4">
                      {/* Overall badge banner */}
                      <div className={`p-3 rounded-lg flex items-center justify-between border ${
                        execStatus === 'accepted'
                          ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400'
                          : execStatus === 'wrong'
                          ? 'bg-rose-950/30 border-rose-900/60 text-rose-400'
                          : 'bg-amber-950/30 border-amber-900/60 text-amber-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {execStatus === 'accepted' ? (
                            <CheckCircle size={18} />
                          ) : (
                            <AlertCircle size={18} />
                          )}
                          <div className="font-sans">
                            <p className="text-sm font-black">
                              {execStatus === 'accepted' ? 'ACCEPTED' : execStatus === 'wrong' ? 'WRONG ANSWER' : 'COMPILE/RUNTIME ERROR'}
                            </p>
                            <p className="text-4xs uppercase tracking-wider text-slate-400">
                              {execStatus === 'accepted' ? `All test cases cleared successfully!` : `Solution failed evaluation constraints.`}
                            </p>
                          </div>
                        </div>

                        {execStatus === 'accepted' && (
                          <div className="flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-3xs font-extrabold text-white animate-bounce font-sans">
                            <Sparkles size={11} />
                            <span>+{pointsEarned} POINTS</span>
                          </div>
                        )}
                      </div>

                      {/* Diagnostic Outputs */}
                      {tcResults && tcResults.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-slate-400 tracking-wider text-3xs font-black uppercase text-slate-500 font-sans border-b border-slate-900 pb-1">Evaluated Results Dashboard</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tcResults.map((tc, tcIdx) => (
                              <div key={tcIdx} className={`p-2 rounded border text-3xs ${
                                tc.passed ? 'bg-emerald-950/10 border-emerald-950 text-emerald-500' : 'bg-rose-950/10 border-rose-950 text-rose-500'
                              }`}>
                                <p className="font-black font-sans uppercase">Case #{tcIdx + 1}: {tc.passed ? 'Passed 🎉' : 'Failed'}</p>
                                {tc.error ? (
                                  <p className="mt-1 font-mono text-xs text-rose-350 bg-rose-950/30 border border-rose-900 rounded p-1">{tc.error}</p>
                                ) : (
                                  <div className="grid grid-cols-1 gap-0.5 mt-1 font-mono text-[10px] text-slate-400">
                                    <p><span className="text-slate-500">Actual:</span> {JSON.stringify(tc.actual)}</p>
                                    <p><span className="text-slate-500">Expected:</span> {JSON.stringify(tc.expected)}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stdout Logs terminal representation */}
                      {(stdout || stderr) && (
                        <div className="space-y-1 bg-slate-900 p-2.5 rounded border border-slate-800">
                          <p className="text-3xs text-slate-500 font-bold tracking-wider uppercase font-sans">Terminal Console Logs (Stdout/Stderr)</p>
                          {stdout && <pre className="text-3xs text-slate-300 whitespace-pre overflow-x-auto">{stdout}</pre>}
                          {stderr && <pre className="text-3xs text-rose-400 whitespace-pre overflow-x-auto">{stderr}</pre>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Console Control Row */}
            <div className="shrink-0 flex items-center justify-between border-t border-slate-250 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950/60 h-12">
              <div className="flex gap-2 text-4xs font-bold text-slate-400 font-sans uppercase">
                <span>Compiler Status: ONLINE</span>
              </div>

              <div className="flex gap-2">
                <button
                  id="arena-run-tests-btn"
                  onClick={() => handleRunCode(false)}
                  disabled={executionLoading || submitLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-350 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <Play size={12} className="text-indigo-500 fill-indigo-500" />
                  <span>Run Tests</span>
                </button>

                <button
                  id="arena-submit-btn"
                  onClick={() => handleRunCode(true)}
                  disabled={executionLoading || submitLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>Submit Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
