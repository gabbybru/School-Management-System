import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Volume2,
  VolumeX,
  Mic,
  Eye,
  ZoomIn,
  ZoomOut,
  Settings,
  HelpCircle,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const {
    settings,
    isSpeaking,
    screenReaderActive,
    toggleScreenReader,
    stopSpeaking,
    readScreenSummary,
    increaseFontSize,
    decreaseFontSize,
    setContrastTheme,
    startVoiceCommand,
    isListening,
    setIsMenuOpen,
    triggerHaptic,
    toggleScreenMagnifier,
    narratorActive,
    toggleNarrator,
    isNarrating,
  } = useAccessibility();

  const activeHeading = () => {
    return document.querySelector('h1')?.textContent || 'Gabbybru Educational Portal';
  };

  const cycleContrast = () => {
    triggerHaptic('click');
    if (settings.contrastTheme === 'default') {
      setContrastTheme('high-contrast-yellow');
    } else if (settings.contrastTheme === 'high-contrast-yellow') {
      setContrastTheme('high-contrast-black');
    } else if (settings.contrastTheme === 'high-contrast-black') {
      setContrastTheme('high-contrast-white');
    } else {
      setContrastTheme('default');
    }
  };

  return (
    <aside
      aria-label="Disability & Accessibility Control Hub"
      className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs px-3 sm:px-6 py-2 transition-colors sticky top-0 z-40 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Assistive Tech Status / Voice Screen Reader */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('click');
              if (isSpeaking) {
                stopSpeaking();
              } else {
                readScreenSummary(activeHeading());
              }
            }}
            aria-label={isSpeaking ? 'Stop voice readout' : 'Read current screen aloud for blind and low vision users (Hotkey: Alt+S)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all text-xs border ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                : screenReaderActive
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-950" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Listen Aloud</span>
                <span className="sm:hidden">Listen</span>
                <span className="text-[10px] opacity-75 font-mono hidden md:inline">(Alt+S)</span>
              </>
            )}
          </button>

          {/* Voice Command Button */}
          <button
            onClick={() => {
              triggerHaptic('click');
              startVoiceCommand();
            }}
            aria-label="Speak hands-free voice command (Hotkey: Alt+V)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all text-xs border ${
              isListening
                ? 'bg-red-500 text-white border-red-300 animate-ping'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Voice Control</span>
            <span className="sm:hidden">Voice</span>
            <span className="text-[10px] opacity-75 font-mono hidden md:inline">(Alt+V)</span>
          </button>

          {/* Voice Narrator on Hover & Click (User Requested Feature) */}
          <button
            onClick={() => {
              triggerHaptic('click');
              toggleNarrator();
            }}
            aria-pressed={narratorActive}
            aria-label={
              narratorActive
                ? 'Voice Narrator active: Reads and describes buttons on hover or click. Tap to mute (Alt+N)'
                : 'Turn ON Voice Narrator for button hover and click readout (Alt+N)'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all text-xs border ${
              narratorActive
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs ring-1 ring-indigo-400/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${narratorActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Narrator</span>
            <span className={`text-[10px] uppercase font-bold px-1 py-0.2 rounded ${narratorActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
              {narratorActive ? 'ON' : 'OFF'}
            </span>
            <span className="text-[10px] opacity-75 font-mono hidden xl:inline">(Alt+N)</span>
          </button>

          {/* Screen Reader Toggle */}
          <button
            onClick={toggleScreenReader}
            aria-pressed={screenReaderActive}
            aria-label="Toggle full audio screen reader narration"
            className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${
              screenReaderActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${screenReaderActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Screen Reader {screenReaderActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Vision & Contrast Controls for Partial Blindness / Low Vision */}
        <div className="flex items-center gap-1.5">
          {/* Contrast Mode Cycler */}
          <button
            onClick={cycleContrast}
            aria-label={`Switch contrast mode (Current: ${settings.contrastTheme}). Hotkey: Alt+C`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Contrast:</span>
            <span className="font-bold text-yellow-300">
              {settings.contrastTheme === 'default'
                ? 'Standard'
                : settings.contrastTheme === 'high-contrast-yellow'
                ? 'Yellow/Black'
                : settings.contrastTheme === 'high-contrast-black'
                ? 'Dark AAA'
                : 'Light AAA'}
            </span>
          </button>

          {/* Text Size Resizer */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-md p-0.5" role="group" aria-label="Font size controls">
            <button
              onClick={decreaseFontSize}
              disabled={settings.fontScale <= 100}
              aria-label="Decrease text size"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono font-bold text-amber-300" aria-label={`Current text scale: ${settings.fontScale} percent`}>
              {settings.fontScale}%
            </span>
            <button
              onClick={increaseFontSize}
              disabled={settings.fontScale >= 200}
              aria-label="Increase text size for partial blindness"
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Screen Magnifier */}
          <button
            onClick={() => {
              triggerHaptic('click');
              toggleScreenMagnifier();
            }}
            aria-pressed={settings.screenMagnifier}
            aria-label="Toggle 2x Reading Magnifier Loupe for low vision"
            className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-semibold border ${
              settings.screenMagnifier
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>Loupe</span>
          </button>

          {/* Detailed Accessibility Dialog Launcher */}
          <button
            onClick={() => {
              triggerHaptic('click');
              setIsMenuOpen(true);
            }}
            aria-label="Open comprehensive accessibility & disability settings (Hotkey: Alt+A)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">A11y Menu</span>
            <span className="sm:hidden">Options</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
