import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  LayoutDashboard,
  Award,
  Users,
  Compass,
  Volume2,
  Mic,
  Eye,
  Menu,
} from 'lucide-react';

export const MobileBottomNav: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const { activeView, setActiveView, currentRole, setCurrentRole } = useSchool();
  const {
    speak,
    triggerHaptic,
    setIsMenuOpen,
    startVoiceCommand,
    isSpeaking,
    stopSpeaking,
    readScreenSummary,
    narratorActive,
    toggleNarrator,
  } = useAccessibility();

  const handleNavClick = (view: string, label: string, role?: any) => {
    triggerHaptic('navigate');
    if (role) {
      setCurrentRole(role);
    }
    setActiveView(view);
    speak(`Navigated to ${label}`, true);
  };

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-200 px-2 py-1 shadow-2xl backdrop-blur-md"
    >
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* 1. Dashboard */}
        <button
          onClick={() => handleNavClick('dashboard', 'School Dashboard')}
          aria-label="Dashboard"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeView === 'dashboard'
              ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Grades (%) */}
        <button
          onClick={() => handleNavClick('grades', 'Student Percentage Grades')}
          aria-label="Grades and Results"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeView === 'grades'
              ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Grades %</span>
        </button>

        {/* 3. Parent Portal */}
        <button
          onClick={() => handleNavClick('parent-portal', 'Parent Portal with Live SMS Alerts', 'parent')}
          aria-label="Parent Portal"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeView === 'parent-portal'
              ? 'bg-pink-600/30 text-pink-300 font-bold border border-pink-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Parent</span>
        </button>

        {/* 4. Boarding & Exeat */}
        <button
          onClick={() => handleNavClick('boarding-exeat', 'Boarding Students and Exeat Passes')}
          aria-label="Boarding and Exeat"
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeView === 'boarding-exeat'
              ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Exeat</span>
        </button>

        {/* 5. Accessibility & Voice Narrator */}
        <button
          onClick={() => {
            triggerHaptic('click');
            setIsMenuOpen(true);
            speak(
              narratorActive
                ? 'Opening accessibility options. Voice narrator is currently ON and will describe elements you touch.'
                : 'Opening accessibility options. Voice narrator is currently OFF.',
              true
            );
          }}
          aria-label="Accessibility and Voice Narrator"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl text-yellow-300 hover:text-yellow-200 transition-all font-bold"
        >
          <div className="relative">
            <Volume2 className="w-5 h-5 mb-0.5" />
            {narratorActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Narrator</span>
        </button>
      </div>
    </nav>
  );
};
