"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "next/navigation";
import {
  Bot, Users, FolderKanban, Layers,
  Store, Sparkles, ArrowRight, X,
} from "lucide-react";

const FEATURES = [
  { icon: Users, label: "Team Management", color: "bg-blue-500" },
  { icon: FolderKanban, label: "Project Tracking", color: "bg-orange-500" },
  { icon: Layers, label: "Task Management", color: "bg-indigo-500" },
  { icon: Bot, label: "AI Employees", color: "bg-violet-500" },
  { icon: Store, label: "AI Marketplace", color: "bg-pink-500" },
];

const LS_KEY = "cms_welcome_shown_v1";

export default function WelcomeModal() {
  const auth = useAuth();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0); // 0 = welcome, 1 = features, 2 = ready

  const companyId = auth?.companyId;
  const companyName = auth?.company?.name ?? "your company";
  const userName = auth?.currentUser?.name || auth?.currentUser?.email || "there";

  useEffect(() => {
    if (!companyId || !auth?.isHydrated) return;
    const key = `${LS_KEY}_${companyId}`;
    const shown = localStorage.getItem(key);
    // Only show if never shown AND user is new (no departments)
    if (!shown && onboarding?.isNewUser) {
      // Small delay so dashboard loads first
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, [companyId, auth?.isHydrated, onboarding?.isNewUser]);

  function handleClose() {
    if (companyId) {
      localStorage.setItem(`${LS_KEY}_${companyId}`, "true");
    }
    setShow(false);
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleClose();
      router.push("/dashboard/departments");
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="p-8 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl shadow-indigo-900/50">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to CMS Platform! 🎉
            </h2>
            <p className="text-gray-400 mb-2">
              Hi <span className="text-indigo-400 font-semibold">{userName}</span>!
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              <span className="text-white font-semibold">{companyName}</span> is ready.
              You&apos;re about to set up the world&apos;s first company management system
              with real AI employees working on your tasks.
            </p>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Let&apos;s get started
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleClose}
              className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              I&apos;ll explore on my own
            </button>
          </div>
        )}

        {/* Step 1 — Features overview */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-2 text-center">
              Here&apos;s what you can do
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Everything you need to run your company
            </p>

            <div className="space-y-3 mb-8">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`w-9 h-9 rounded-lg ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">{f.label}</span>
                    <span className="ml-auto text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              Show me how
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Ready to go */}
        {step === 2 && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              You&apos;re all set!
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We&apos;ll guide you through 5 quick steps to get
              your company fully configured. It takes less than 5 minutes.
            </p>

            <div className="bg-indigo-950/50 border border-indigo-900/50 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-3">
                Quick setup checklist
              </p>
              {[
                "Create your first department",
                "Add your first employee",
                "Create your first project",
                "Assign your first task",
                "Try an AI employee",
              ].map((item, i) => (
                <div key={item} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-5 h-5 rounded-full border border-indigo-700 flex items-center justify-center text-[10px] text-indigo-400 flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Start with departments
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
