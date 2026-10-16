import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  X,
  Eye,
  Volume2,
  Mic,
  Smartphone,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Key,
  ShieldCheck,
  Type,
  Maximize2,
} from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    setContrastTheme,
    setFontScale,
    toggleHyperLegibleFont,
    toggleScreenMagnifier,
    isMenuOpen,
    setIsMenuOpen,
    screenReaderActive,
    toggleScreenReader,
    speak,
    stopSpeaking,
    triggerHaptic,
    startVoiceCommand,
  } = useAccessibility();

  if (!isMenuOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="a11y-dialog-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Disability &amp; Digital Inclusion Center
              </h2>
              <p className="text-xs text-slate-300">
                Assistive tools for partial eye blindness, complete blindness, and mobile accessibility
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('click');
              setIsMenuOpen(false);
            }}
            aria-label="Close accessibility settings"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-6 text-slate-800">
          {/* SECTION 1: FOR PERSONS WITH COMPLETE BLINDNESS (AUDIO FIRST) */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-indigo-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Audio Screen Reader (For Complete Blindness)
                </h3>
              </div>
              <button
                onClick={() => {
                  toggleScreenReader();
                  triggerHaptic('click');
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all border ${
                  screenReaderActive
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {screenReaderActive ? 'Narrator Active' : 'Enable Narrator'}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Built-in text-to-speech reads every screen, student report card, percentage grade, time-stamped exeat pass, and incoming parent SMS alert aloud.
            </p>

            {/* Voice Narrator on Hover & Click (User Requested) */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    🎙️ Voice Narrator (Hover &amp; Click Description)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Speaks and describes buttons, inputs, tabs, and cards when you hover over or click them.
                  </span>
                </div>
                <button
                  onClick={() => {
                    updateSetting('narratorActive', !settings.narratorActive);
                    speak(
                      !settings.narratorActive
                        ? 'Voice narrator enabled for hover and click'
                        : 'Voice narrator disabled',
                      true
                    );
                    triggerHaptic('success');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    settings.narratorActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {settings.narratorActive ? 'Narrator Active (ON)' : 'Narrator Muted (OFF)'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={settings.narrateOnHover}
                    onChange={(e) => updateSetting('narrateOnHover', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Speak &amp; Describe on Hover (Mouse / Pointer)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={settings.narrateOnClick}
                    onChange={(e) => updateSetting('narrateOnClick', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Speak &amp; Describe on Click / Tap</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Speech Rate (Speed)
                </label>
                <div className="flex items-center gap-1.5">
                  {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        updateSetting('speechRate', rate);
                        speak(`Speech speed set to ${rate}x`, true);
                      }}
                      className={`flex-1 py-1 text-xs font-semibold rounded-md border ${
                        settings.speechRate === rate
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audio Test &amp; Voice Commands
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      speak('Welcome to Gabbybru Educational Management System. Voice reader is fully functional on your smartphone and computer.', true);
                    }}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test Voice</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      startVoiceCommand();
                    }}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Input</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tactile & Tap Feedback */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.hapticFeedback}
                  onChange={(e) => {
                    updateSetting('hapticFeedback', e.target.checked);
                    triggerHaptic('success');
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Phone Tactile Vibration (Haptics)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.soundFeedback}
                  onChange={(e) => updateSetting('soundFeedback', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Audio Earcon Chimes</span>
              </label>
            </div>
          </div>

          {/* SECTION 2: FOR PERSONS WITH PARTIAL EYE BLINDNESS / LOW VISION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                High Contrast &amp; Low-Vision Clarity Modes
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Select specialized color palettes and text scalings designed for low vision, cataracts, glaucoma, and partial eye blindness.
            </p>

            {/* Contrast Theme Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'default',
                  title: 'Default Slate',
                  desc: 'Modern balanced',
                  previewBg: 'bg-slate-100 text-slate-900 border-slate-300',
                },
                {
                  id: 'high-contrast-yellow',
                  title: 'Yellow on Black',
                  desc: 'Optimal for low vision',
                  previewBg: 'bg-black text-yellow-300 border-yellow-400 font-bold',
                },
                {
                  id: 'high-contrast-black',
                  title: 'White on Black',
                  desc: 'Monochrome Dark',
                  previewBg: 'bg-black text-white border-white font-bold',
                },
                {
                  id: 'high-contrast-white',
                  title: 'Black on White',
                  desc: 'Crisp High Light',
                  previewBg: 'bg-white text-black border-black font-bold',
                },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setContrastTheme(theme.id as any);
                    speak(`Contrast changed to ${theme.title}`, true);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    settings.contrastTheme === theme.id
                      ? 'ring-2 ring-indigo-500 border-indigo-600'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg text-xs mb-2 border ${theme.previewBg} flex items-center justify-between`}>
                    <span>Aa %</span>
                    {settings.contrastTheme === theme.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-xs font-bold text-slate-900">{theme.title}</div>
                  <div className="text-[10px] text-slate-500">{theme.desc}</div>
                </button>
              ))}
            </div>

            {/* Font Zoom Scaling */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Text Magnification &amp; Font Size
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {settings.fontScale}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[100, 125, 150, 175, 200].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => {
                      setFontScale(scale as any);
                      speak(`Text size set to ${scale} percent`, true);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      settings.fontScale === scale
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {scale}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                200% scale enables large, high-legibility view across mobile screens and desktops without horizontal distortion.
              </p>
            </div>

            {/* Additional Low-Vision Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.hyperLegibleFont}
                  onChange={toggleHyperLegibleFont}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Hyper-Legible Font</span>
                  <span className="text-slate-500 text-[11px]">
                    Switches to distinct letterforms designed to prevent glyph confusion for partial vision.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.screenMagnifier}
                  onChange={toggleScreenMagnifier}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Reading Magnifier Lens</span>
                  <span className="text-slate-500 text-[11px]">
                    Magnifies grades, report card details, and timestamps directly under finger or cursor.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highVisibilityFocus}
                  onChange={(e) => updateSetting('highVisibilityFocus', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Neon Focus Indicator</span>
                  <span className="text-slate-500 text-[11px]">
                    3px ultra-bright glowing outline so you never lose keyboard or touch focus.
                  </span>
                </div>
              </label>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Text Spacing</span>
                <div className="flex gap-1.5">
                  {(['normal', 'relaxed', 'wide'] as const).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => updateSetting('spacingScale', spacing)}
                      className={`flex-1 py-1 text-xs capitalize rounded border ${
                        settings.spacingScale === spacing
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: KEYBOARD & PHONE HOTKEYS */}
          <div className="bg-slate-100 rounded-xl p-4 text-xs space-y-2 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Keyboard &amp; Assistive Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold">Alt + N</kbd>
                <span className="text-slate-600 block mt-0.5 font-bold text-indigo-700">Voice Narrator</span>
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold">Alt + S</kbd>
                <span className="text-slate-600 block mt-0.5">Read screen</span>
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold">Alt + V</kbd>
                <span className="text-slate-600 block mt-0.5">Voice command</span>
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold">Alt + C</kbd>
                <span className="text-slate-600 block mt-0.5">Toggle contrast</span>
              </div>
              <div>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold">Esc</kbd>
                <span className="text-slate-600 block mt-0.5">Silence voice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('success');
              setIsMenuOpen(false);
              speak('Accessibility settings applied successfully.', true);
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Done &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
