import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { ZoomIn, X, Move, Sparkles } from 'lucide-react';

export const ScreenMagnifier: React.FC = () => {
  const { settings, toggleScreenMagnifier } = useAccessibility();
  const [hoveredText, setHoveredText] = useState<string>('');
  const [hoveredTag, setHoveredTag] = useState<string>('');

  useEffect(() => {
    if (!settings.screenMagnifier) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const elem = document.elementFromPoint(clientX, clientY);
      if (elem && !elem.closest('#screen-magnifier-lens')) {
        const text = (elem as HTMLElement).innerText || elem.textContent || '';
        if (text.trim() && text.length < 300) {
          setHoveredText(text.trim());
          setHoveredTag(elem.tagName.toLowerCase());
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [settings.screenMagnifier]);

  if (!settings.screenMagnifier) return null;

  return (
    <div
      id="screen-magnifier-lens"
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 bg-black text-yellow-300 border-2 border-yellow-400 rounded-2xl shadow-2xl p-4 transition-all"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-yellow-400/40 text-[11px] font-bold uppercase tracking-wider text-yellow-200">
        <div className="flex items-center gap-1.5">
          <ZoomIn className="w-4 h-4 text-yellow-300" />
          <span>Low-Vision Reading Loupe (2x)</span>
        </div>
        <button
          onClick={toggleScreenMagnifier}
          aria-label="Close reading magnifier"
          className="p-1 hover:bg-yellow-400/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="min-h-[50px] flex items-center">
        {hoveredText ? (
          <div>
            <span className="text-[10px] text-cyan-300 uppercase font-mono block mb-0.5">
              Target Element: [{hoveredTag || 'content'}]
            </span>
            <div className="text-base sm:text-lg font-black tracking-wide leading-snug break-words">
              {hoveredText}
            </div>
          </div>
        ) : (
          <div className="text-xs text-yellow-300/70 italic">
            Move finger or mouse across the screen to magnify text here in high-contrast yellow on black.
          </div>
        )}
      </div>
    </div>
  );
};
