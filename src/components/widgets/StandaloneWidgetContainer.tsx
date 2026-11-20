import React from "react";
import { X, Minus } from "lucide-react";

interface StandaloneWidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export const StandaloneWidgetContainer: React.FC<StandaloneWidgetContainerProps> = ({
  title,
  children,
}) => {
  const handleClose = () => window.electronAPI?.closeWindow();
  const handleMinimize = () => window.electronAPI?.minimizeWindow();

  return (
    <div className="h-screen w-screen bg-[#111318] text-[#F3F4F6] flex flex-col overflow-hidden border border-[#2A303C] rounded-xl select-none shadow-2xl">
      {/* Draggable Titlebar */}
      <div className="h-9 px-3 bg-[#151920] border-b border-[#2A303C] flex items-center justify-between titlebar-drag-region">
        <span className="text-xs font-semibold text-[#F3F4F6] tracking-wide truncate">
          {title}
        </span>
        <div className="flex items-center gap-1 titlebar-no-drag">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-[#252B35] rounded text-[#9299A5] hover:text-[#F3F4F6] transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-600 rounded text-[#9299A5] hover:text-white transition-colors"
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
