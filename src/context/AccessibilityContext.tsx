import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  AccessibilitySettings,
  ContrastTheme,
  FontScale,
  SpacingScale,
} from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  
  // High Contrast & Vision
  setContrastTheme: (theme: ContrastTheme) => void;
  setFontScale: (scale: FontScale) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleHyperLegibleFont: () => void;
  toggleScreenMagnifier: () => void;
  
  // Audio Screen Reader (Speech Synthesis)
  isSpeaking: boolean;
  screenReaderActive: boolean;
  toggleScreenReader: () => void;
  speak: (text: string, priority?: boolean) => void;
  stopSpeaking: () => void;
  readScreenSummary: (viewName: string, additionalContext?: string) => void;

  // ── HOVER & CLICK VOICE NARRATOR ──
  narratorActive: boolean;
  narrateOnHover: boolean;
  narrateOnClick: boolean;
  lastNarratedText: string;
  isNarrating: boolean;
  toggleNarrator: () => void;
  setNarratorActive: (active: boolean) => void;
  toggleNarrateOnHover: () => void;
  toggleNarrateOnClick: () => void;
  setSpeechRate: (rate: number) => void;
  describeAndSpeakElement: (el: HTMLElement, eventType?: 'hover' | 'click' | 'focus') => void;
  
  // Voice Command & Hands-Free Input (Speech Recognition)
  isListening: boolean;
  speechSupported: boolean;
  startVoiceCommand: () => void;
  stopVoiceCommand: () => void;
  lastVoiceTranscript: string;
  voiceCommandModalOpen: boolean;
  setVoiceCommandModalOpen: (open: boolean) => void;
  registerVoiceCommandHandler: (handler: (command: string) => boolean) => void;

  // Accessibility Menu Dialog
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;

  // Haptic Feedback for Blind users on phone
  triggerHaptic: (type?: 'click' | 'success' | 'alert' | 'navigate') => void;
  
  // Web Audio Earcons (Audio Cues)
  playAudioChime: (type: 'navigate' | 'toggle' | 'confirm' | 'alert') => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  contrastTheme: 'default',
  fontScale: 100,
  hyperLegibleFont: false,
  spacingScale: 'normal',
  screenReaderActive: false,
  speechRate: 1.0,
  autoSpeakOnTouch: true,
  soundFeedback: true,
  hapticFeedback: true,
  screenMagnifier: false,
  magnifierZoom: 2.0,
  highlightLinks: false,
  highVisibilityFocus: true,
  narratorActive: true, // Enabled so hover and click speech immediately works as requested
  narrateOnHover: true,
  narrateOnClick: true,
  narratorVerbosity: 'detailed',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('gabbybru_a11y_settings_v2');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState('');
  const [voiceCommandModalOpen, setVoiceCommandModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Voice Narrator State
  const [lastNarratedText, setLastNarratedText] = useState('Voice Narrator is active: Hover over or tap any button to hear descriptions.');
  const [isNarrating, setIsNarrating] = useState(false);
  const lastHoveredElementRef = useRef<HTMLElement | null>(null);
  const hoverTimerRef = useRef<any>(null);

  const voiceCommandHandlersRef = useRef<((command: string) => boolean)[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('gabbybru_a11y_settings_v2', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Apply CSS Classes & Variables to Root Document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove(
      'theme-high-contrast-yellow',
      'theme-high-contrast-black',
      'theme-high-contrast-white',
      'font-scale-100',
      'font-scale-125',
      'font-scale-150',
      'font-scale-175',
      'font-scale-200',
      'hyper-legible-font',
      'high-visibility-focus'
    );

    if (settings.contrastTheme !== 'default') {
      root.classList.add(`theme-${settings.contrastTheme}`);
      body.classList.add(`theme-${settings.contrastTheme}`);
    } else {
      body.classList.remove(
        'theme-high-contrast-yellow',
        'theme-high-contrast-black',
        'theme-high-contrast-white'
      );
    }

    // Font scaling
    root.classList.add(`font-scale-${settings.fontScale}`);
    root.style.fontSize = `${(settings.fontScale / 100) * 16}px`;

    // Hyper-legible font
    if (settings.hyperLegibleFont) {
      root.classList.add('hyper-legible-font');
    }

    // High visibility focus
    if (settings.highVisibilityFocus) {
      root.classList.add('high-visibility-focus');
    }

    // Spacing
    if (settings.spacingScale === 'relaxed') {
      root.style.letterSpacing = '0.025em';
      root.style.lineHeight = '1.7';
    } else if (settings.spacingScale === 'wide') {
      root.style.letterSpacing = '0.05em';
      root.style.lineHeight = '1.85';
    } else {
      root.style.letterSpacing = 'normal';
      root.style.lineHeight = 'normal';
    }
  }, [settings]);

  // Audio Earcon synthesis via Web Audio API
  const playAudioChime = useCallback((type: 'navigate' | 'toggle' | 'confirm' | 'alert') => {
    if (!settings.soundFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'navigate') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'toggle') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(349.23, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }, [settings.soundFeedback]);

  // Haptic Feedback for Mobile Phones
  const triggerHaptic = useCallback((type: 'click' | 'success' | 'alert' | 'navigate' = 'click') => {
    if (!settings.hapticFeedback || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    try {
      if (type === 'click') {
        navigator.vibrate(25);
      } else if (type === 'navigate') {
        navigator.vibrate(35);
      } else if (type === 'success') {
        navigator.vibrate([40, 30, 60]);
      } else if (type === 'alert') {
        navigator.vibrate([80, 50, 80]);
      }
    } catch (e) {
      // Vibration ignored
    }
  }, [settings.hapticFeedback]);

  // Screen Reader Speech Synthesis (Built-in Voice Reader)
  const speak = useCallback((text: string, priority: boolean = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (priority) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speechRate || 1.0;
      utterance.pitch = 1.0;

      // Select natural English voice if possible
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('UK') || v.name.includes('US'))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsNarrating(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsNarrating(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsNarrating(false);
      };

      window.speechSynthesis.speak(utterance);
      triggerHaptic('click');
    } catch (e) {
      console.error('Speech error:', e);
      setIsSpeaking(false);
      setIsNarrating(false);
    }
  }, [settings.speechRate, triggerHaptic]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsNarrating(false);
      playAudioChime('toggle');
    }
  }, [playAudioChime]);

  const toggleScreenReader = useCallback(() => {
    const nextState = !settings.screenReaderActive;
    setSettings((prev) => ({ ...prev, screenReaderActive: nextState }));
    playAudioChime('toggle');
    triggerHaptic('success');
    if (nextState) {
      speak('Audio screen reader voice assistant activated. Navigation and content will be read aloud. Press Alt plus S to read current screen, or Alt plus V for voice commands.', true);
    } else {
      speak('Audio screen reader deactivated.', true);
    }
  }, [settings.screenReaderActive, playAudioChime, triggerHaptic, speak]);

  const readScreenSummary = useCallback((viewName: string, additionalContext?: string) => {
    let summary = `Currently viewing ${viewName}. `;
    if (additionalContext) {
      summary += additionalContext;
    }
    summary += ' Hover over or tap any button to hear what it does, or speak voice commands.';
    speak(summary, true);
    setLastNarratedText(summary);
    triggerHaptic('navigate');
  }, [speak, triggerHaptic]);

  // ── ELEMENT NARRATOR ENGINE (Describes buttons, inputs, tabs on hover/click) ──
  const describeAndSpeakElement = useCallback((el: HTMLElement, eventType: 'hover' | 'click' | 'focus' = 'hover') => {
    // If element has data-narration, prioritize it
    const explicitNarration = el.getAttribute('data-narration') || el.closest('[data-narration]')?.getAttribute('data-narration');
    if (explicitNarration) {
      const formatted = eventType === 'click' ? `Clicked: ${explicitNarration}` : explicitNarration;
      setLastNarratedText(formatted);
      speak(formatted, true);
      return;
    }

    const interactive = (el.closest('button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], summary') as HTMLElement) || el;
    const tag = interactive.tagName.toLowerCase();
    const role = interactive.getAttribute('role');
    const ariaLabel = interactive.getAttribute('aria-label');
    const title = interactive.getAttribute('title');
    const isSelected = interactive.getAttribute('aria-selected') === 'true';
    const isChecked = interactive.getAttribute('aria-checked') === 'true' || (interactive as HTMLInputElement).checked;
    const isDisabled = (interactive as HTMLButtonElement).disabled;

    let rawText = ariaLabel || title || interactive.innerText || '';
    // Clean emojis & excess whitespace
    rawText = rawText.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    rawText = rawText.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    let roleLabel = 'Button';
    if (tag === 'a') roleLabel = 'Link';
    else if (role === 'tab') roleLabel = 'Tab';
    else if (role === 'switch') roleLabel = 'Switch';
    else if (tag === 'input') {
      const type = (interactive as HTMLInputElement).type;
      roleLabel = type === 'checkbox' ? 'Checkbox' : type === 'radio' ? 'Radio choice' : 'Text field';
      if (!rawText) rawText = (interactive as HTMLInputElement).placeholder || 'Type here';
    } else if (tag === 'select') {
      roleLabel = 'Dropdown menu';
    }

    if (!rawText) {
      rawText = 'Interactive option';
    }

    let stateText = '';
    if (isSelected) stateText = ', currently selected';
    if (isChecked) stateText = ', checked';
    if (isDisabled) stateText = ', disabled';

    // Contextual hints
    let hint = '';
    const lower = rawText.toLowerCase();
    if (lower.includes('assign') || lower.includes('teacher')) {
      hint = 'Assigns lead instructors and co-teachers across multiple classes.';
    } else if (lower.includes('assistant head') || lower.includes('appoint')) {
      hint = 'Headmaster exclusive authority to appoint Assistant Heads for boarding and academic portfolios.';
    } else if (lower.includes('exeat') || lower.includes('pass')) {
      hint = 'Boarding student leave management with gate pass tokens and automated parent SMS.';
    } else if (lower.includes('listen') || lower.includes('aloud')) {
      hint = 'Voice narrator reads the page out loud for visually impaired users.';
    } else if (lower.includes('contrast')) {
      hint = 'Cycles high-contrast color palettes for low vision clarity.';
    } else if (lower.includes('grade') || lower.includes('score') || lower.includes('%')) {
      hint = 'Inspect and update student percentage marks and gradebooks.';
    } else if (lower.includes('save') || lower.includes('confirm') || lower.includes('publish')) {
      hint = 'Commits updates to the school record with immutable date and time audit stamp.';
    } else if (lower.includes('dashboard') || lower.includes('home')) {
      hint = 'Navigates to school overview and core performance metrics.';
    } else if (lower.includes('parent')) {
      hint = 'Parent portal for real-time result SMS alerts and Visa fee payments.';
    } else if (lower.includes('voice')) {
      hint = 'Voice command listener for hands-free spoken operation.';
    }

    let fullDescription = '';
    if (eventType === 'click') {
      fullDescription = `Selected ${roleLabel}: ${rawText}${stateText}. ${hint}`;
    } else if (eventType === 'focus') {
      fullDescription = `Focused on ${roleLabel}: ${rawText}${stateText}. ${hint}`;
    } else {
      fullDescription = `${roleLabel}: ${rawText}${stateText}. ${hint}`;
    }

    setLastNarratedText(fullDescription.trim());
    speak(fullDescription.trim(), true);
  }, [speak]);

  // ── GLOBAL HOVER & CLICK LISTENER FOR VOICE NARRATOR ──
  useEffect(() => {
    if (!settings.narratorActive) return;

    const handleMouseOver = (e: MouseEvent) => {
      if (!settings.narrateOnHover) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [data-narration], summary'
      ) as HTMLElement | null;

      if (!interactive) return;
      if (lastHoveredElementRef.current === interactive) return;
      lastHoveredElementRef.current = interactive;

      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      // Fast, natural 110ms dwell time
      hoverTimerRef.current = setTimeout(() => {
        describeAndSpeakElement(interactive, 'hover');
      }, 110);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (lastHoveredElementRef.current && (!related || !lastHoveredElementRef.current.contains(related))) {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        lastHoveredElementRef.current = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!settings.narrateOnClick) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [data-narration], summary'
      ) as HTMLElement | null;

      if (interactive) {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        describeAndSpeakElement(interactive, 'click');
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!settings.narrateOnHover) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [data-narration], summary'
      ) as HTMLElement | null;

      if (interactive) {
        describeAndSpeakElement(interactive, 'focus');
      }
    };

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('click', handleClick, { capture: true, passive: true });
    document.addEventListener('focusin', handleFocusIn, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocusIn);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [settings.narratorActive, settings.narrateOnHover, settings.narrateOnClick, describeAndSpeakElement]);

  const toggleNarrator = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.narratorActive;
      if (next) {
        speak('Voice narrator enabled. Hover over or tap any button to hear it read and described aloud. Press Alt plus N to toggle.', true);
      } else {
        speak('Voice narrator muted.', true);
      }
      return { ...prev, narratorActive: next };
    });
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [speak, playAudioChime, triggerHaptic]);

  const setNarratorActive = useCallback((active: boolean) => {
    setSettings((prev) => ({ ...prev, narratorActive: active }));
    if (active) {
      speak('Voice narrator enabled. Hover over any button to hear its description.', true);
    } else {
      speak('Voice narrator disabled.', true);
    }
  }, [speak]);

  const toggleNarrateOnHover = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.narrateOnHover;
      speak(next ? 'Hover narration enabled' : 'Hover narration disabled. Voice speaks on click only.', true);
      return { ...prev, narrateOnHover: next };
    });
  }, [speak]);

  const toggleNarrateOnClick = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.narrateOnClick;
      speak(next ? 'Click narration enabled' : 'Click narration disabled', true);
      return { ...prev, narrateOnClick: next };
    });
  }, [speak]);

  const setSpeechRate = useCallback((rate: number) => {
    setSettings((prev) => ({ ...prev, speechRate: rate }));
    speak(`Speech rate set to ${rate} times speed.`, true);
  }, [speak]);

  // Voice Command Handlers Registration
  const registerVoiceCommandHandler = useCallback((handler: (command: string) => boolean) => {
    voiceCommandHandlersRef.current.push(handler);
  }, []);

  const executeVoiceCommand = useCallback((rawCommand: string) => {
    const clean = rawCommand.toLowerCase().trim();
    setLastVoiceTranscript(rawCommand);
    playAudioChime('confirm');
    triggerHaptic('success');

    // Built-in accessibility commands
    if (clean.includes('narrator') || clean.includes('read buttons') || clean.includes('voice hover')) {
      toggleNarrator();
      return;
    }

    if (clean.includes('high contrast') || clean.includes('yellow on black') || clean.includes('contrast')) {
      if (settings.contrastTheme === 'default') {
        setSettings((prev) => ({ ...prev, contrastTheme: 'high-contrast-yellow' }));
        speak('High contrast yellow on black mode enabled for visual clarity.', true);
      } else {
        setSettings((prev) => ({ ...prev, contrastTheme: 'default' }));
        speak('Standard contrast mode restored.', true);
      }
      return;
    }

    if (clean.includes('bigger text') || clean.includes('large text') || clean.includes('increase font') || clean.includes('zoom in')) {
      setSettings((prev) => {
        const next = Math.min(200, prev.fontScale + 25) as FontScale;
        return { ...prev, fontScale: next };
      });
      speak('Text size increased.', true);
      return;
    }

    if (clean.includes('smaller text') || clean.includes('decrease font') || clean.includes('zoom out')) {
      setSettings((prev) => {
        const next = Math.max(100, prev.fontScale - 25) as FontScale;
        return { ...prev, fontScale: next };
      });
      speak('Text size decreased.', true);
      return;
    }

    if (clean.includes('read screen') || clean.includes('read page') || clean.includes('what is on the screen')) {
      const activeHeading = document.querySelector('h1, h2')?.textContent || 'Current Page';
      speak(`Reading screen: ${activeHeading}.`, true);
      return;
    }

    if (clean.includes('stop reading') || clean.includes('silence') || clean.includes('quiet')) {
      stopSpeaking();
      return;
    }

    if (clean.includes('magnifier') || clean.includes('zoom lens')) {
      setSettings((prev) => ({ ...prev, screenMagnifier: !prev.screenMagnifier }));
      speak(settings.screenMagnifier ? 'Magnifier turned off' : 'Reading magnifier lens activated', true);
      return;
    }

    // Delegate to application view handlers
    let handled = false;
    for (const handler of voiceCommandHandlersRef.current) {
      if (handler(clean)) {
        handled = true;
        break;
      }
    }

    if (!handled) {
      speak(`Voice command "${rawCommand}" recognized. Say dashboard, grades, parent portal, exeat, or high contrast.`, true);
    }
  }, [settings.contrastTheme, settings.screenMagnifier, toggleNarrator, playAudioChime, triggerHaptic, speak, stopSpeaking]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          playAudioChime('navigate');
          triggerHaptic('click');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          executeVoiceCommand(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [executeVoiceCommand, playAudioChime, triggerHaptic]);

  const startVoiceCommand = useCallback(() => {
    setVoiceCommandModalOpen(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        speak('Listening for voice command. Speak now.', true);
      } catch (e) {
        // already started
      }
    } else {
      speak('Voice modal open. You can tap simulated commands below.', true);
    }
  }, [speak]);

  const stopVoiceCommand = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  // Keyboard Shortcuts (Alt+A menu, Alt+S screen, Alt+V voice, Alt+C contrast, Alt+N narrator)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
        playAudioChime('toggle');
      } else if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        toggleNarrator();
      } else if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const main = document.querySelector('main');
        const text = main ? main.innerText.slice(0, 400) : 'Gabbybru Educational Management System.';
        speak(`Reading current section: ${text}`, true);
      } else if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        startVoiceCommand();
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setSettings((prev) => ({
          ...prev,
          contrastTheme: prev.contrastTheme === 'default' ? 'high-contrast-yellow' : 'default',
        }));
        playAudioChime('confirm');
      } else if (e.key === 'Escape') {
        stopSpeaking();
        setIsMenuOpen(false);
        setVoiceCommandModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speak, startVoiceCommand, stopSpeaking, playAudioChime, toggleNarrator]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [playAudioChime, triggerHaptic]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    playAudioChime('confirm');
    triggerHaptic('success');
    speak('Accessibility settings reset to default.', true);
  }, [playAudioChime, triggerHaptic, speak]);

  const setContrastTheme = useCallback((theme: ContrastTheme) => {
    updateSetting('contrastTheme', theme);
  }, [updateSetting]);

  const setFontScale = useCallback((scale: FontScale) => {
    updateSetting('fontScale', scale);
  }, [updateSetting]);

  const increaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const scales: FontScale[] = [100, 125, 150, 175, 200];
      const currentIndex = scales.indexOf(prev.fontScale);
      const nextIndex = Math.min(scales.length - 1, currentIndex + 1);
      const nextScale = scales[nextIndex];
      speak(`Font size ${nextScale} percent`, true);
      return { ...prev, fontScale: nextScale };
    });
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [speak, playAudioChime, triggerHaptic]);

  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => {
      const scales: FontScale[] = [100, 125, 150, 175, 200];
      const currentIndex = scales.indexOf(prev.fontScale);
      const nextIndex = Math.max(0, currentIndex - 1);
      const nextScale = scales[nextIndex];
      speak(`Font size ${nextScale} percent`, true);
      return { ...prev, fontScale: nextScale };
    });
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [speak, playAudioChime, triggerHaptic]);

  const toggleHyperLegibleFont = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.hyperLegibleFont;
      speak(next ? 'Hyper-legible font enabled' : 'Default font restored', true);
      return { ...prev, hyperLegibleFont: next };
    });
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [speak, playAudioChime, triggerHaptic]);

  const toggleScreenMagnifier = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.screenMagnifier;
      speak(next ? 'Reading magnifier lens enabled. Move your finger or mouse over text to zoom.' : 'Reading magnifier disabled', true);
      return { ...prev, screenMagnifier: next };
    });
    playAudioChime('toggle');
    triggerHaptic('click');
  }, [speak, playAudioChime, triggerHaptic]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        setContrastTheme,
        setFontScale,
        increaseFontSize,
        decreaseFontSize,
        toggleHyperLegibleFont,
        toggleScreenMagnifier,
        isSpeaking,
        screenReaderActive: settings.screenReaderActive,
        toggleScreenReader,
        speak,
        stopSpeaking,
        readScreenSummary,
        // Narrator exports
        narratorActive: settings.narratorActive,
        narrateOnHover: settings.narrateOnHover,
        narrateOnClick: settings.narrateOnClick,
        lastNarratedText,
        isNarrating,
        toggleNarrator,
        setNarratorActive,
        toggleNarrateOnHover,
        toggleNarrateOnClick,
        setSpeechRate,
        describeAndSpeakElement,
        // Voice commands & menu
        isListening,
        speechSupported,
        startVoiceCommand,
        stopVoiceCommand,
        lastVoiceTranscript,
        voiceCommandModalOpen,
        setVoiceCommandModalOpen,
        registerVoiceCommandHandler,
        isMenuOpen,
        setIsMenuOpen,
        triggerHaptic,
        playAudioChime,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
