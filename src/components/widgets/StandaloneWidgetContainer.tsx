import React, { useState } from "react";
import { X, Minus, Pin, PinOff } from "lucide-react";
import type { WidgetType } from "@shared/types/ipc";

interface StandaloneWidgetContainerProps {
  title: string;
  widgetType?: WidgetType;
  children: React.ReactNode;
}

export const StandaloneWidgetContainer: React.FC<StandaloneWidgetContainerProps> = ({
  title,
  widgetType,
  children,
}) => {
  const [isPinned, setIsPinned] = useState(true);

  const handleClose = () => window.electronAPI?.closeWindow();
  const handleMinimize = () => window.electronAPI?.minimizeWindow();

  const handleTogglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    if (widgetType && window.electronAPI?.setWidgetAlwaysOnTop) {
      window.electronAPI.setWidgetAlwaysOnTop(widgetType, nextPinned);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#111318] text-[#F3F4F6] flex flex-col overflow-hidden border border-[#2A303C] rounded-xl select-none shadow-2xl">
      {/* Draggable Titlebar */}
      <div className="h-9 px-3 bg-[#151920] border-b border-[#2A303C] flex items-center justify-between titlebar-drag-region">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-[#E99A43] shrink-0" />
          <span className="text-xs font-semibold text-[#F3F4F6] tracking-wide truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 titlebar-no-drag">
          <button
            onClick={handleTogglePin}
            className={`p-1 rounded transition-colors ${
              isPinned
                ? "text-[#E99A43] bg-[#E99A43]/15"
                : "text-[#9299A5] hover:text-[#F3F4F6] hover:bg-[#252B35]"
            }`}
            title={isPinned ? "Unpin (Disable Always on Top)" : "Pin (Always on Top)"}
          >
            {isPinned ? <Pin className="w-3 h-3 fill-current" /> : <PinOff className="w-3 h-3" />}
          </button>
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-[#252B35] rounded text-[#9299A5] hover:text-[#F3F4F6] transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-600 rounded text-[#9299A5] hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="flex-1 overflow-y-auto p-3.5 bg-[#111318]">
        {children}
      </div>
    </div>
  );
};
