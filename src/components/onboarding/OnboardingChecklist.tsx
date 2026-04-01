"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Circle, ChevronUp, ChevronDown,
  X, Trophy, Sparkles, Zap,
} from "lucide-react";

// Simple confetti burst
function fireConfetti() {
  if (typeof window === "undefined") return;
  const colors = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24"];
  const container = document.createElement("div");
  container.style.cssText = `
    position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;
  `;
  document.body.appendChild(container);

  for (let i = 0; i < 80; i++) {
    const particle = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const x = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = Math.random() * 1.5 + 1;

    particle.style.cssText = `
      position:absolute;
      left:${x}%;top:-10px;
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
      animation:confettiFall ${duration}s ${delay}s ease-in forwards;
    `;
    container.appendChild(particle);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(${Math.random() > 0.5 ? "" : "-"}720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    document.body.removeChild(container);
    document.head.removeChild(style);
  }, 3000);
}

export default function OnboardingChecklist() {
  const onboarding = useOnboarding();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(false);

  // Celebrate when all steps complete
  useEffect(() => {
    if (!onboarding) return;
    if (onboarding.completed && !prevCompleted) {
      setCelebrating(true);
      fireConfetti();
      setTimeout(() => setCelebrating(false), 4000);
    }
    setPrevCompleted(onboarding.completed);
  }, [onboarding?.completed]);

  // Don't show if dismissed or null
  if (!onboarding || onboarding.dismissed) return null;
  // Don't show if all done and celebration is over
  if (onboarding.completed && !celebrating) return null;

  const { steps, percentComplete, earnedPoints, totalPoints } = onboarding;
  const nextStep = steps.find((s) => !s.completed);

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 shadow-2xl shadow-black/30">
      {/* Celebration overlay */}
      {celebrating && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex flex-col items-center justify-center text-white text-center p-6">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-bold text-lg mb-1">Setup Complete!</h3>
          <p className="text-indigo-200 text-sm mb-4">
            You&apos;ve earned {totalPoints} points.<br />
            Your company is fully configured!
          </p>
          <button
            onClick={() => onboarding.dismiss()}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Let&apos;s go! 🚀
          </button>
        </div>
      )}

      <div className="bg-gray-950 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">Quick Setup</p>
                <p className="text-indigo-300 text-[10px]">
                  {earnedPoints}/{totalPoints} pts · {percentComplete}% done
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                {collapsed
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
                }
              </button>
              <button
                onClick={() => onboarding.dismiss()}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        {!collapsed && (
          <div className="divide-y divide-white/5">
            {steps.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-start gap-3 px-4 py-3 transition-all group ${
                  step.completed
                    ? "opacity-60"
                    : "hover:bg-white/5 cursor-pointer"
                }`}
              >
                {/* Check icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${
                    step.completed ? "text-gray-500 line-through" : "text-white"
                  }`}>
                    {step.title}
                  </p>
                  {!step.completed && (
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Points badge */}
                <div className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  step.completed
                    ? "bg-green-400/10 text-green-500"
                    : "bg-indigo-500/20 text-indigo-400"
                }`}>
                  +{step.points}pts
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Next action CTA */}
        {!collapsed && nextStep && (
          <div className="px-4 py-3 border-t border-white/5">
            <Link
              href={nextStep.href}
              className="flex items-center justify-between w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                {nextStep.title}
              </div>
              <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        )}

        {/* Collapsed quick stats */}
        {collapsed && (
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full ${s.completed ? "bg-green-400" : "bg-gray-700"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {steps.filter((s) => s.completed).length}/{steps.length} steps
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
