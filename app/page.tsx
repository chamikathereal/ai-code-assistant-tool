"use client";


import { useMemo, useState } from "react";
import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import java from "highlight.js/lib/languages/java";
import "highlight.js/styles/github-dark.css";

import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Providers } from "./providers";

const INITIAL_CODE = `// Example: it is a simple JavaScript function
function greet(name) {
  console.log("Hello, " + name)
}

greet("World")`;

export default function Home() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEmpty = code.trim().length === 0;


  // Syntax highlighting for both code blocks
  const leftRef = useRef<HTMLPreElement>(null);
  const rightRef = useRef<HTMLPreElement>(null);
  const leftOutput = useMemo(() => (analyzed ? code : ""), [analyzed, code]);
  const rightOutput = useMemo(() => (analyzed ? output : ""), [analyzed, output]);

  useEffect(() => {
    hljs.registerLanguage("javascript", javascript);
    hljs.registerLanguage("java", java);
    if (leftRef.current) hljs.highlightElement(leftRef.current);
    if (rightRef.current) hljs.highlightElement(rightRef.current);
  }, [leftOutput, rightOutput]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const analyze = async () => {
    setLoading(true);
    setError("");
    setAnalyzed(false);
    setOutput("");
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setOutput(data.result);
      setAnalyzed(true);
    } catch (err: any) {
      setError(err.message || "Failed to analyze code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Providers>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div>
              <h1 className="text-3xl font-bold">AI Code Assistant</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Enter code, click Analyze, and see corrected version side-by-side.</p>
            </div>
            <ThemeToggle />
          </header>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="mb-2 block text-sm font-medium" htmlFor="code-input">
              Code editor (input)
            </label>
            <textarea
              id="code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (analyzed) setAnalyzed(false);
              }}
              placeholder="Paste your code here..."
              className="h-44 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={analyze} disabled={isEmpty || loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">After analyze, split view shows input (left) and corrected output (right).</p>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </section>

          {analyzed && (
            <section className="grid gap-4 lg:grid-cols-2 animate-fade-in">
              <article className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
                <h2 className="mb-2 text-lg font-semibold flex items-center justify-between">
                  Your Code
                  <button
                    className="ml-2 px-2 py-1 text-xs rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    onClick={() => copyToClipboard(leftOutput)}
                    title="Copy code"
                  >Copy</button>
                </h2>
                <pre
                  ref={leftRef}
                  className="h-72 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono dark:border-slate-700 dark:bg-slate-950 hljs"
                >
                  <code className="language-javascript">{leftOutput}</code>
                </pre>
              </article>
              <article className="relative rounded-xl border-2 border-blue-400 bg-white p-4 shadow-lg dark:border-blue-700 dark:bg-slate-900 transition-all">
                <h2 className="mb-2 text-lg font-semibold flex items-center justify-between text-blue-700 dark:text-blue-300">
                  AI Corrected Code
                  <button
                    className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition"
                    onClick={() => copyToClipboard(rightOutput)}
                    title="Copy code"
                  >Copy</button>
                </h2>
                <pre
                  ref={rightRef}
                  className="h-72 overflow-auto rounded-md border border-blue-200 bg-blue-50 p-3 text-xs font-mono dark:border-blue-700 dark:bg-blue-950 hljs"
                >
                  <code className="language-javascript">{rightOutput}</code>
                </pre>
              </article>
            </section>
          )}
        </div>
      </div>
    </Providers>
  );
}
