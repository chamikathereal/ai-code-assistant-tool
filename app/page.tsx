"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-black text-slate-900 dark:text-white">

        <div className="mx-auto max-w-6xl p-6 space-y-6">

          {/* HEADER */}
          <header className="flex items-center justify-between p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 shadow-xl">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                AI Code Assistant
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Fix & improve your code instantly with AI
              </p>
            </div>
            <ThemeToggle />
          </header>

          {/* INPUT */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-5 transition-all">

            <label className="text-sm font-medium mb-2 block">
              Code Editor
            </label>

            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (analyzed) setAnalyzed(false);
              }}
              placeholder="Paste your code here..."
              className="w-full h-48 resize-none rounded-xl bg-slate-950 text-white font-mono text-sm p-4 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={analyze}
                disabled={isEmpty || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-all"
              >
                {loading ? "Analyzing..." : "Analyze Code"}
              </Button>

              {loading && (
                <div className="text-xs text-blue-500 animate-pulse">
                  AI is thinking...
                </div>
              )}

              {error && (
                <span className="text-xs text-red-500">{error}</span>
              )}
            </div>
          </section>

          {/* OUTPUT */}
          {analyzed && (
            <section className="grid lg:grid-cols-2 gap-6 animate-fade-in">

              {/* LEFT */}
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-900">
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg">

                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Your Code
                    </h2>
                    <button
                      onClick={() => copyToClipboard(leftOutput)}
                      className="text-xs px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    >
                      Copy
                    </button>
                  </div>

                  <pre
                    ref={leftRef}
                    className="h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs font-mono"
                  >
                    <code className="language-javascript">{leftOutput}</code>
                  </pre>
                </div>
              </div>

              {/* RIGHT */}
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl">
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-4">

                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      AI Corrected Code
                    </h2>
                    <button
                      onClick={() => copyToClipboard(rightOutput)}
                      className="text-xs px-2 py-1 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition"
                    >
                      Copy
                    </button>
                  </div>

                  <pre
                    ref={rightRef}
                    className="h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs font-mono"
                  >
                    <code className="language-javascript">{rightOutput}</code>
                  </pre>
                </div>
              </div>

            </section>
          )}
        </div>
      </div>
    </Providers>
  );
}