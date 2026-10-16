import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { SchoolDashboard } from './components/dashboard/SchoolDashboard';
import { AttendanceTracker } from './components/attendance/AttendanceTracker';
import { GradebookManager } from './components/grades/GradebookManager';
import { FacultyScheduleView } from './components/faculty/FacultyScheduleView';
import { BillingDashboard } from './components/billing/BillingDashboard';
import { AnalyticsPortal } from './components/analytics/AnalyticsPortal';
import { E2EESecurityVault } from './components/security/E2EESecurityVault';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { FlutterSimulator } from './components/mobile/FlutterSimulator';
import { HeadmasterDashboard } from './components/headmaster/HeadmasterDashboard';
import { ParentPortal } from './components/parent/ParentPortal';
import { SubjectManagement } from './components/courses/SubjectManagement';
import { BoardingExeatManager } from './components/boarding/BoardingExeatManager';
import { AccessibilityToolbar } from './components/accessibility/AccessibilityToolbar';
import { AccessibilityModal } from './components/accessibility/AccessibilityModal';
import { VoiceCommandModal } from './components/accessibility/VoiceCommandModal';
import { ScreenMagnifier } from './components/accessibility/ScreenMagnifier';
import { VoiceNarratorBanner } from './components/accessibility/VoiceNarratorBanner';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { ShieldCheck, GraduationCap, Smartphone, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeView, mobilePreviewMode, setMobilePreviewMode, currentRole } = useSchool();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative pb-28 sm:pb-16">
      {/* Accessible Skip Link for Screen Readers & Keyboard Navigation */}
      <a href="#main-content" className="sr-skip-link">
        Skip to main content
      </a>

      {/* Top Accessibility & Voice Control Toolbar */}
      <AccessibilityToolbar />

      {/* Main Institutional Header & Navigation */}
      <Navbar />
      <ToastContainer />

      {/* Accessible Modals & Assistive Overlays */}
      <AccessibilityModal />
      <VoiceCommandModal />
      <ScreenMagnifier />
      <VoiceNarratorBanner />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 focus:outline-none">
        {mobilePreviewMode === 'mobile_flutter' ? (
          <FlutterSimulator />
        ) : (
          <>
            {activeView === 'dashboard' && (
              currentRole === 'parent' ? <ParentPortal /> : currentRole === 'headmaster' || currentRole === 'assistant_head' ? <HeadmasterDashboard /> : <SchoolDashboard />
            )}
            {activeView === 'headmaster' && <HeadmasterDashboard />}
            {activeView === 'parent-portal' && <ParentPortal />}
            {activeView === 'boarding-exeat' && <BoardingExeatManager />}
            {activeView === 'audit' && <HeadmasterDashboard />}
            {activeView === 'subjects' && <SubjectManagement />}
            {activeView === 'attendance' && <AttendanceTracker />}
            {activeView === 'grades' && <GradebookManager />}
            {activeView === 'faculty-schedule' && <FacultyScheduleView />}
            {activeView === 'billing' && <BillingDashboard />}
            {activeView === 'analytics' && <AnalyticsPortal />}
            {activeView === 'security' && <E2EESecurityVault />}
            {activeView === 'notifications' && <NotificationCenter />}
          </>
        )}
      </main>

      {/* Responsive Mobile Sticky Bottom Navigation for Smartphones */}
      <MobileBottomNav />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-900 text-white flex items-center justify-center font-bold text-[10px]">
              GB
            </div>
            <div>
              <span className="font-bold text-slate-900">Gabbybru Company Ltd · Educational Group Management</span>
              <span className="text-slate-400 ml-2">© 2026 Primary, JHS &amp; SHS Academy</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              AES-256-GCM E2EE Protected
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-blue-700 font-medium">
              <span className="font-black italic">VISA</span>
              3-D Secure Verified
            </span>
            <span>·</span>
            <button
              onClick={() => setMobilePreviewMode('mobile_flutter')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Flutter Cross-Platform Simulator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <SchoolProvider>
        <MainAppContent />
      </SchoolProvider>
    </AccessibilityProvider>
  );
}
