import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSchool } from '../../context/SchoolContext';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Navigation,
  Eye,
  BookOpen,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const VoiceCommandModal: React.FC = () => {
  const {
    isListening,
    speechSupported,
    startVoiceCommand,
    stopVoiceCommand,
    lastVoiceTranscript,
    voiceCommandModalOpen,
    setVoiceCommandModalOpen,
    speak,
    stopSpeaking,
    readScreenSummary,
    setContrastTheme,
    settings,
    increaseFontSize,
    decreaseFontSize,
    triggerHaptic,
  } = useAccessibility();

  const { setActiveView, setCurrentRole } = useSchool();
  const [manualCommandInput, setManualCommandInput] = useState('');

  if (!voiceCommandModalOpen) return null;

  const handleSimulateCommand = (command: string, feedback: string) => {
    triggerHaptic('success');
    speak(feedback, true);

    const clean = command.toLowerCase();
    if (clean.includes('dashboard')) {
      setActiveView('dashboard');
    } else if (clean.includes('grades') || clean.includes('results')) {
      setActiveView('grades');
    } else if (clean.includes('parent')) {
      setCurrentRole('parent');
      setActiveView('parent-portal');
    } else if (clean.includes('headmaster')) {
      setCurrentRole('headmaster');
      setActiveView('headmaster');
    } else if (clean.includes('exeat') || clean.includes('boarding')) {
      setActiveView('boarding-exeat');
    } else if (clean.includes('subjects') || clean.includes('courses')) {
      setActiveView('subjects');
    } else if (clean.includes('attendance')) {
      setActiveView('attendance');
    } else if (clean.includes('contrast')) {
      setContrastTheme(settings.contrastTheme === 'default' ? 'high-contrast-yellow' : 'default');
    } else if (clean.includes('bigger')) {
      increaseFontSize();
    } else if (clean.includes('smaller')) {
      decreaseFontSize();
    } else if (clean.includes('read')) {
      readScreenSummary('Current Screen');
    }

    setVoiceCommandModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-slate-950 border-2 border-indigo-500 rounded-3xl max-w-lg w-full text-white p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            stopVoiceCommand();
            setVoiceCommandModalOpen(false);
          }}
          aria-label="Close voice assistant"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Active Microphone State */}
        <div className="text-center pt-2 pb-6">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
            </div>
            {isListening && (
              <span className="absolute -inset-2 rounded-full border-2 border-red-400 animate-ping opacity-75" />
            )}
          </div>

          <h3 id="voice-modal-title" className="text-xl font-black text-white tracking-tight">
            {isListening ? 'Listening for your voice...' : 'Hands-Free Voice Navigation'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isListening
              ? 'Speak clearly into your phone or microphone now.'
              : speechSupported
              ? 'Tap microphone to speak, or use one-touch voice commands below.'
              : 'Direct voice speech recognition available on supported browsers. Tap any command button below.'}
          </p>

          {/* Transcript feedback */}
          {lastVoiceTranscript && (
            <div className="mt-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg inline-block text-xs font-mono text-amber-300">
              "{lastVoiceTranscript}"
            </div>
          )}
        </div>

        {/* Quick Voice Command Triggers (Immediate Tap or Voice) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Instant Spoken Commands (Tap or Say Aloud)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSimulateCommand('dashboard', 'Navigating to School Dashboard')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <Navigation className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">"Go to Dashboard"</span>
                <span className="text-[10px] text-slate-400">Home overview</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulateCommand('grades', 'Opening Student Gradebook with percentage marks')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">"View Grades"</span>
                <span className="text-[10px] text-slate-400">Percentage results</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulateCommand('parent', 'Opening Parent Portal with live SMS alerts')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <Users className="w-4 h-4 text-pink-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">"Parent Portal"</span>
                <span className="text-[10px] text-slate-400">Student reports &amp; SMS</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulateCommand('exeat', 'Opening Boarding and Exeat Pass manager')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">"Exeat &amp; Boarding"</span>
                <span className="text-[10px] text-slate-400">Student leave slips</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulateCommand('contrast', 'Toggling high contrast mode')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-yellow-300 shrink-0" />
              <div>
                <span className="font-bold text-white block">"High Contrast"</span>
                <span className="text-[10px] text-slate-400">Yellow on black</span>
              </div>
            </button>

            <button
              onClick={() => handleSimulateCommand('read', 'Reading current screen aloud')}
              className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left flex items-center gap-2.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">"Read Screen"</span>
                <span className="text-[10px] text-slate-400">Full voice narrative</span>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Voice Simulator Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCommandInput.trim()) {
              handleSimulateCommand(manualCommandInput, `Executing voice command: ${manualCommandInput}`);
              setManualCommandInput('');
            }
          }}
          className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={manualCommandInput}
            onChange={(e) => setManualCommandInput(e.target.value)}
            placeholder="Or type voice command (e.g., 'results', 'exeat')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
          >
            Speak
          </button>
        </form>
      </div>
    </div>
  );
};
