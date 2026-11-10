import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquare,
  Zap,
  ShieldCheck,
  Users,
  ArrowRight,
  Radio,
  CheckCheck,
  Sparkles,
  Pin,
  Eye,
} from "lucide-react";

const Intro = () => {
  const { user, loading } = useAuth();

  // If already authenticated, redirect straight to /chat
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6067f5] border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading ChatCircle...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 selection:bg-[#6067f5] selection:text-white">
      {/* Soft background ambient gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#edeef9]/80 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[450px] w-[500px] rounded-full bg-indigo-50/70 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[500px] rounded-full bg-emerald-50/60 blur-[100px]" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6067f5] shadow-md shadow-indigo-500/20">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                ChatCircle
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-[#edeef9] px-2.5 py-0.5 text-[11px] font-semibold text-[#6067f5] sm:inline-flex">
                <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                Socket.IO v4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-2xl bg-[#6067f5] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#5259e8] hover:shadow-indigo-500/30"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 sm:px-8 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#6067f5]" />
            <span>Fast, Clean & Professional WebSocket Chat</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.15]">
            Real-time conversations,{" "}
            <span className="bg-gradient-to-r from-[#6067f5] via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              beautifully simple.
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Experience modern 1-on-1 chatting powered by WebSockets. Instant
            deliveries, multi-tab presence tracking, and a calm, distraction-free
            interface designed for focus.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6067f5] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] hover:bg-[#5259e8] sm:w-auto"
            >
              <span>Start Chatting Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:w-auto"
            >
              <span>Sign In</span>
            </Link>
          </div>

          {/* Highlights pills */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live presence</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <CheckCheck className="h-3.5 w-3.5 text-[#6067f5]" />
              <span>Bi-directional WebSockets</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#6067f5]" />
              <span>Secure sessions</span>
            </div>
          </div>
        </div>

        {/* Live Mockup UI Preview Card matching new design */}
        <div className="mt-16 mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xl sm:p-5">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#fafbfe] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  ChatCircle — Design Chat Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Socket Connected</span>
              </div>
            </div>

            {/* Inner Showcase Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Mock Sidebar */}
              <div className="hidden border-r border-slate-100 bg-white p-4 md:block">
                <div className="rounded-2xl bg-[#edeef9] px-3.5 py-2 text-xs font-medium text-slate-500">
                  Search
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#edeef9] p-2.5">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white text-xs">
                        DC
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold text-slate-900">
                          Design chat
                        </p>
                        <span className="text-[10px] text-slate-400">4m</span>
                      </div>
                      <p className="truncate text-[11px] font-medium text-[#6067f5]">
                        Jessie Rollins sent...
                      </p>
                    </div>
                    <Pin size={12} className="rotate-45 fill-[#6067f5] text-[#6067f5]" />
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-[#f7f8fc] transition">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 font-bold text-white text-xs">
                        OC
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold text-slate-800">
                          Osman Campos
                        </p>
                        <span className="text-[10px] text-slate-400">20m</span>
                      </div>
                      <p className="truncate text-[11px] text-slate-500">
                        You: Hey! We are ready...
                      </p>
                    </div>
                    <CheckCheck size={13} className="text-[#6067f5]" />
                  </div>
                </div>
              </div>

              {/* Mock Chat Stream */}
              <div className="col-span-2 flex flex-col bg-white p-5">
                {/* Header */}
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Design chat
                  </h3>
                  <p className="text-xs text-slate-400">
                    23 members, 10 online
                  </p>
                </div>

                {/* Messages */}
                <div className="my-6 space-y-4">
                  <div className="flex items-end gap-2.5 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-rose-500 text-white text-xs font-bold shrink-0">
                      JL
                    </div>
                    <div className="max-w-[80%] rounded-3xl rounded-tl-xs bg-[#f0f2fa] px-4 py-2.5 text-xs text-slate-800">
                      <p className="text-[#5d60f5] font-bold text-[11px] mb-0.5">
                        Jasmin Lowery
                      </p>
                      <p>I added new flows to our design system. Now you can use them!</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <Eye size={11} />
                        <span>23 • 09:20</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2.5 justify-end">
                    <div className="max-w-[80%] rounded-3xl rounded-br-xs bg-[#6067f5] px-4 py-2.5 text-xs text-white shadow-sm shadow-indigo-500/15">
                      <p>Jaden, congratulations! Will be glad to work with you on this 🚀</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-indigo-200">
                        <Eye size={11} />
                        <span>10 • 09:27</span>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#6067f5] text-white text-xs font-bold shrink-0">
                      Me
                    </div>
                  </div>
                </div>

                {/* Input mockup */}
                <div className="mt-auto flex items-center gap-2 rounded-2xl bg-[#edeef9] px-4 py-2 text-xs text-slate-400">
                  <span className="flex-1 text-slate-400">Write a message...</span>
                  <div className="rounded-xl bg-[#6067f5] px-3 py-1 font-semibold text-white text-[11px]">
                    Send ➤
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-[#fafbfe] p-7 transition hover:shadow-md hover:border-slate-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-[#6067f5]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Instant WebSockets
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Bi-directional messaging powered by Socket.IO rooms. Messages land
              in real time with sub-millisecond response.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-[#fafbfe] p-7 transition hover:shadow-md hover:border-slate-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Presence & Multi-Tab Tracking
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Intelligent multi-tab connection management keeps user presence
              accurate and shows live green status dots.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-[#fafbfe] p-7 transition hover:shadow-md hover:border-slate-200 sm:col-span-2 lg:col-span-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Secure Cookie Sessions
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              HttpOnly JWT cookies safeguard API routes and authenticate
              the initial Socket.IO handshake automatically.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-400">
        <p>© 2026 ChatCircle. Professional real-time messaging application.</p>
      </footer>
    </div>
  );
};

export default Intro;
