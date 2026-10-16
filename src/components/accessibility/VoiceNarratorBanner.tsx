import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MousePointer,
  Hand,
  Settings,
} from 'lucide-react';

export const VoiceNarratorBanner: React.FC = () => {
  const {
    narratorActive,
    toggleNarrator,
    narrateOnHover,
    toggleNarrateOnHover,
    narrateOnClick,
    toggleNarrateOnClick,
    lastNarratedText,
    isNarrating,
    stopSpeaking,
    settings,
    setSpeechRate,
    triggerHaptic,
    setIsMenuOpen,
  } = useAccessibility();

  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <section
      aria-label="Voice Narrator Subtitle and Controls HUD"
      className="fixed bottom-16 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 z-40 max-w-lg transition-all duration-300"
    >
      <div
        className={`bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border transition-all ${
          narratorActive
            ? 'border-indigo-500/60 ring-2 ring-indigo-500/20'
            : 'border-slate-800 opacity-90'
        } ${isMinimized ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'}`}
      >
        {/* Header / Control Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Status indicator button */}
            <button
              onClick={() => {
                triggerHaptic('click');
                toggleNarrator();
              }}
              aria-label={
                narratorActive
                  ? 'Mute voice narrator (Hotkey: Alt+N)'
                  : 'Turn on voice narrator for hover and click readout (Hotkey: Alt+N)'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                narratorActive
                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {narratorActive ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>Narrator ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>Narrator OFF</span>
                </>
              )}
            </button>

            {narratorActive && isNarrating && (
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden xs:inline">Speaking</span>
              </div>
            )}

            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              (Alt+N)
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Hover Mode Toggle */}
            {narratorActive && !isMinimized && (
              <button
                onClick={() => {
                  triggerHaptic('click');
                  toggleNarrateOnHover();
                }}
                title={narrateOnHover ? 'Hover narration is ON' : 'Hover narration is OFF'}
                aria-pressed={narrateOnHover}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  narrateOnHover
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-400/30'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Hover</span>
              </button>
            )}

            {/* Click Mode Toggle */}
            {narratorActive && !isMinimized && (
              <button
                onClick={() => {
                  triggerHaptic('click');
                  toggleNarrateOnClick();
                }}
                title={narrateOnClick ? 'Click narration is ON' : 'Click narration is OFF'}
                aria-pressed={narrateOnClick}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  narrateOnClick
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-400/30'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Click</span>
              </button>
            )}

            {/* Speech Rate Cycle */}
            {narratorActive && !isMinimized && (
              <button
                onClick={() => {
                  triggerHaptic('click');
                  const rates = [0.8, 1.0, 1.25, 1.5];
                  const currentIdx = rates.indexOf(settings.speechRate);
                  const nextRate = rates[(currentIdx + 1) % rates.length];
                  setSpeechRate(nextRate);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-mono font-bold"
                title="Change narration speaking rate"
              >
                {settings.speechRate}x
              </button>
            )}

            {/* Stop Voice */}
            {isNarrating && (
              <button
                onClick={stopSpeaking}
                className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs"
                title="Silence active narration"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Minimize / Expand */}
            <button
              onClick={() => {
                triggerHaptic('click');
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label={isMinimized ? 'Expand voice narrator subtitle HUD' : 'Collapse voice narrator subtitle HUD'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Subtitle Transcript Banner */}
        {!isMinimized && (
          <div className="mt-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                <Radio
                  className={`w-3.5 h-3.5 ${
                    isNarrating ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Spoken Subtitles &amp; Element Description
                </span>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-2 rounded-xl border border-slate-800 line-clamp-3 select-all"
                >
                  {lastNarratedText || 'Hover or click any button to hear speech description.'}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Blind &amp; Low-Vision Voice Navigation Active
              </span>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                All Disability Options
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
