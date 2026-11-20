import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export const PomodoroWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === "work") {
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("work");
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#252B35]">
        <button
          onClick={() => {
            setMode("work");
            setTimeLeft(25 * 60);
            setIsRunning(false);
          }}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            mode === "work" ? "bg-[#E99A43] text-black font-semibold" : "text-[#9299A5]"
          }`}
        >
          Focus (25m)
        </button>
        <button
          onClick={() => {
            setMode("break");
            setTimeLeft(5 * 60);
            setIsRunning(false);
          }}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            mode === "break" ? "bg-[#E99A43] text-black font-semibold" : "text-[#9299A5]"
          }`}
        >
          Break (5m)
        </button>
      </div>

      <div className="text-4xl font-extrabold tracking-wider text-[#F3F4F6] font-mono">
        {timeFormatted}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTimer}
          className="px-4 py-2 rounded-lg bg-[#E99A43] text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-[#F0A857] transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? "Pause" : "Start"}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-lg bg-[#252B35] text-[#9299A5] hover:text-[#F3F4F6] transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
