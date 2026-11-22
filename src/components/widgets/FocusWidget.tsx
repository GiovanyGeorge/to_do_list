import React, { useEffect } from "react";
import { Play, Pause, RotateCcw, Check, Sparkles } from "lucide-react";
import { useFocusStore } from "@/store/useFocusStore";

export const FocusWidget: React.FC = () => {
  const {
    currentSession,
    elapsedSeconds,
    status,
    todayFocusSeconds,
    fetchCurrentSession,
    fetchTodayFocusSeconds,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetFocus,
    endFocus,
    tick,
  } = useFocusStore();

  useEffect(() => {
    fetchCurrentSession();
    fetchTodayFocusSeconds();

    // Listen to focus state changes from other windows/main
    const unsubscribe = window.electronAPI?.onFocusStateChanged?.(() => {
      fetchCurrentSession();
      fetchTodayFocusSeconds();
    });

    return () => {
      unsubscribe?.();
    };
  }, [fetchCurrentSession, fetchTodayFocusSeconds]);

  // Tick interval for smooth UI display based on timestamps
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (status === "focusing") {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, tick]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const formatShortDuration = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="h-full flex flex-col justify-between p-2 select-none font-sans">
      {/* Top Session Title / Info */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#252B35] text-[#E99A43] border border-[#2A303C]">
          <Sparkles className="w-3 h-3 text-[#E99A43]" />
          <span>
            {status === "focusing"
              ? "Session Active"
              : status === "paused"
              ? "Paused"
              : "Ready to Focus"}
          </span>
        </div>
        {currentSession?.title && (
          <p className="text-xs text-[#9299A5] truncate max-w-[260px] mx-auto">
            {currentSession.title}
          </p>
        )}
      </div>

      {/* Main Stopwatch Display */}
      <div className="my-auto text-center py-4">
        <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-[#F3F4F6] drop-shadow-sm tabular-nums">
          {formatTimer(elapsedSeconds)}
        </div>
        <p className="text-[11px] text-[#6B7280] mt-1.5 font-medium">
          Open-ended Stopwatch
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          {status === "ready" ? (
            <button
              onClick={() => startFocus()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#E99A43] hover:bg-[#F0A857] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Focus</span>
            </button>
          ) : status === "focusing" ? (
            <>
              <button
                onClick={() => pauseFocus()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#252B35] hover:bg-[#2A303C] text-[#F3F4F6] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#374151] transition-all active:scale-95"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
              <button
                onClick={() => endFocus()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>End</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => resumeFocus()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#E99A43] hover:bg-[#F0A857] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={() => resetFocus()}
                className="py-2.5 px-3 rounded-xl bg-[#252B35] hover:bg-red-950/40 text-[#9299A5] hover:text-red-400 font-semibold text-xs flex items-center justify-center gap-1 border border-[#374151] transition-all active:scale-95"
                title="Reset session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => endFocus()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>

        {/* Today's Accumulated Focus Time */}
        <div className="pt-2 border-t border-[#2A303C]/70 flex items-center justify-between text-[11px] text-[#9299A5]">
          <span>Focus Time Today</span>
          <span className="font-semibold text-[#F3F4F6] font-mono">
            {formatShortDuration(todayFocusSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
