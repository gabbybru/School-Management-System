import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { UserRole } from '../../types';
import { SchoolManagerModal } from '../schools/SchoolManagerModal';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Bell,
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Award,
  Lock,
  Unlock,
  Radio,
  BookOpen,
  Search,
  RotateCcw,
  Building2,
  Clock,
  UserCheck,
  ChevronDown,
  Plus,
  Compass,
  Eye,
  Volume2,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    mobilePreviewMode,
    setMobilePreviewMode,
    isE2EEUnlocked,
    setIsE2EEUnlocked,
    notifications,
    searchQuery,
    setSearchQuery,
    resetDemoData,
    schools,
    activeSchoolId,
    setActiveSchoolId,
    activeSchool,
    currentParent,
  } = useSchool();

  const { speak, triggerHaptic, setIsMenuOpen, narratorActive, toggleNarrator } = useAccessibility();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showSchoolManagerModal, setShowSchoolManagerModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const unreadNotifs = notifications.filter((n) => n.status !== 'read');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'headmaster', 'assistant_head', 'faculty', 'parent', 'student'] },
    { id: 'headmaster', label: 'Headmaster Controls', icon: UserCheck, roles: ['admin', 'headmaster', 'assistant_head'] },
    { id: 'boarding-exeat', label: 'Boarding & Exeat', icon: Compass, roles: ['admin', 'headmaster', 'assistant_head', 'faculty', 'parent'] },
    { id: 'subjects', label: 'Subjects & Teachers', icon: BookOpen, roles: ['admin', 'headmaster', 'assistant_head', 'faculty'] },
    { id: 'attendance', label: 'Attendance', icon: Users, roles: ['admin', 'headmaster', 'assistant_head', 'faculty', 'parent', 'student'] },
    { id: 'grades', label: 'Gradebook & Reports', icon: Award, roles: ['admin', 'headmaster', 'assistant_head', 'faculty', 'parent', 'student'] },
    { id: 'parent-portal', label: 'Parent Portal & SMS', icon: Smartphone, roles: ['admin', 'parent'] },
    { id: 'faculty-schedule', label: 'Faculty Timetable', icon: Calendar, roles: ['admin', 'headmaster', 'assistant_head', 'faculty', 'student'] },
    { id: 'billing', label: 'Visa Billing & Fees', icon: CreditCard, roles: ['admin', 'parent'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'headmaster', 'faculty'] },
    { id: 'audit', label: 'Timestamped Audit Trail', icon: Clock, roles: ['admin', 'headmaster', 'assistant_head'] },
    { id: 'security', label: 'E2EE Vault', icon: Lock, roles: ['admin'] },
    { id: 'notifications', label: 'Automated Alerts', icon: Radio, roles: ['admin', 'headmaster', 'parent', 'faculty'] },
  ];

  const roleLabels: Record<UserRole, { label: string; desc: string; icon: string }> = {
    admin: { label: 'Administrator', desc: 'Full institutional controls & multi-schools', icon: '🏛️' },
    headmaster: { label: 'Headmaster / Principal', desc: 'Assign teachers, manage photos & verify grades', icon: '🎓' },
    assistant_head: { label: 'Assistant Headmaster', desc: 'Boarding, exeat permits & timetable management', icon: '👔' },
    faculty: { label: 'Faculty / Teacher', desc: 'Gradebook, roll call & personal timetable', icon: '👨‍🏫' },
    parent: { label: 'Parent / Guardian', desc: 'Live result SMS alerts & Visa payments', icon: '👪' },
    student: { label: 'Student', desc: 'My grades in %, GPA & daily schedule', icon: '🎒' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Institutional Credentials & System Security */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AES-256-GCM Zero-Knowledge Vault Active
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 font-semibold">
            Gabbybru Company Ltd · Basic Education Group
          </span>
          <span className="hidden lg:inline text-indigo-400 font-mono text-[11px]">
            [{activeSchool.name}]
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* E2EE Master Key Status */}
          <button
            onClick={() => setIsE2EEUnlocked(!isE2EEUnlocked)}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
            title="Click to toggle E2EE lock status"
          >
            {isE2EEUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-mono text-[11px]">E2EE Decrypted</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-mono text-[11px]">E2EE Locked</span>
              </>
            )}
          </button>

          <span className="text-slate-500">|</span>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* School Brand & Active School Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-950 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-500/30 shrink-0">
              <GraduationCap className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Gabbybru Company Ltd
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 hidden sm:inline">
                  Primary, JHS &amp; SHS
                </span>
              </div>

              {/* Multi-School Selector Dropdown */}
              <div className="relative mt-0.5">
                <button
                  onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-700 transition-colors"
                >
                  <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                    {activeSchool.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showSchoolDropdown && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Campuses &amp; Schools ({schools.length})</span>
                      <button
                        onClick={() => {
                          setShowSchoolDropdown(false);
                          setShowSchoolManagerModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold capitalize flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add School</span>
                      </button>
                    </div>

                    <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                      {schools.map((sch) => (
                        <button
                          key={sch.id}
                          onClick={() => {
                            setActiveSchoolId(sch.id);
                            setShowSchoolDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                            activeSchoolId === sch.id
                              ? 'bg-indigo-50 border border-indigo-200 font-bold text-indigo-950'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Building2 className={`w-4 h-4 mt-0.5 shrink-0 ${activeSchoolId === sch.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{sch.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {sch.city} · Headmaster: {sch.headmasterName}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 px-2">
                      <button
                        onClick={() => {
                          setShowSchoolDropdown(false);
                          setShowSchoolManagerModal(true);
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register Another School Campus</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden xl:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, course, fee, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Right Controls: Role Switcher & Mobile Simulator Toggle */}
          <div className="flex items-center gap-2">
            {/* Multi-School Manage Button for Administrator */}
            <button
              onClick={() => setShowSchoolManagerModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              title="Add or manage school campuses"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Schools ({schools.length})</span>
            </button>

            {/* Cross-Platform Flutter Simulator Switch */}
            <button
              onClick={() => {
                setMobilePreviewMode(mobilePreviewMode === 'web' ? 'mobile_flutter' : 'web');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                mobilePreviewMode === 'mobile_flutter'
                  ? 'bg-blue-600 border-blue-700 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
              title="Toggle Flutter Cross-Platform Mobile Experience"
            >
              <Smartphone className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
              <span className="hidden sm:inline">
                {mobilePreviewMode === 'mobile_flutter' ? 'Return to Web' : 'Flutter Mobile App'}
              </span>
              <span className="sm:hidden">App</span>
            </button>

            {/* Notification Drawer Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotificationsDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Automated Notification Stream</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{notifications.length} total</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              n.type === 'attendance'
                                ? 'text-amber-600'
                                : n.type === 'payment_receipt'
                                ? 'text-emerald-600'
                                : 'text-indigo-600'
                            }`}
                          >
                            {n.type.replace('_', ' ')} · {n.channel.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.timestamp.substring(11, 16)}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 flex justify-between">
                    <button
                      onClick={() => {
                        setActiveView('notifications');
                        setShowNotificationsDrawer(false);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      View All Automated Logs →
                    </button>
                    <button
                      onClick={() => setShowNotificationsDrawer(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-950 text-xs font-semibold transition-all"
              >
                <span>{roleLabels[currentRole]?.icon || '🎓'}</span>
                <span className="hidden md:inline">{roleLabels[currentRole]?.label || 'User'}</span>
                <span className="text-[10px] text-indigo-500 ml-0.5">▼</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona
                  </div>
                  {(['admin', 'headmaster', 'assistant_head', 'faculty', 'parent', 'student'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentRole(role);
                        setShowRoleMenu(false);
                        if (role === 'headmaster') setActiveView('headmaster');
                        if (role === 'assistant_head') setActiveView('boarding-exeat');
                        if (role === 'parent') setActiveView('parent-portal');
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                        currentRole === role ? 'bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-950' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-base leading-none">{roleLabels[role]?.icon}</span>
                      <div>
                        <div className="font-semibold text-slate-900">{roleLabels[role]?.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{roleLabels[role]?.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => {
                triggerHaptic('click');
                setShowMobileDrawer(!showMobileDrawer);
              }}
              aria-label="Toggle navigation menu"
              className="sm:hidden p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              {showMobileDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Filtered by current role) */}
        {mobilePreviewMode === 'web' && (
          <nav className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
            {navItems
              .filter((item) => item.roles.includes(currentRole))
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        )}
      </div>

      {/* Mobile Drawer Menu for Phones */}
      {showMobileDrawer && (
        <div className="sm:hidden fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md overflow-y-auto p-4 text-white animate-in slide-in-from-top duration-200 pb-28">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  GB
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Gabbybru Academy Navigation
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Primary, JHS &amp; SHS Portals
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('click');
                  setShowMobileDrawer(false);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voice Narrator & Accessibility Quick Controls */}
            <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-yellow-300 block">
                    🎙️ Spoken Voice Narrator
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Reads &amp; describes buttons on hover/touch
                  </span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('click');
                    toggleNarrator();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    narratorActive
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {narratorActive ? 'Narrator: ON' : 'Narrator: OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-indigo-900/60 text-xs">
                <button
                  onClick={() => {
                    setShowMobileDrawer(false);
                    setIsMenuOpen(true);
                    speak('Opening complete accessibility and disability options', true);
                  }}
                  className="text-yellow-300 hover:text-yellow-200 underline font-semibold text-[11px]"
                >
                  ⚙️ High Contrast &amp; Font Zoom Options →
                </button>
              </div>
            </div>

            {/* Mobile Persona / Role Switcher */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active User Role: <strong className="text-indigo-400">{roleLabels[currentRole]?.label}</strong>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['headmaster', 'assistant_head', 'faculty', 'parent', 'student', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      triggerHaptic('click');
                      setCurrentRole(role);
                      if (role === 'headmaster') setActiveView('headmaster');
                      if (role === 'assistant_head') setActiveView('boarding-exeat');
                      if (role === 'parent') setActiveView('parent-portal');
                      speak(`Switched role to ${roleLabels[role]?.label}`, true);
                      setShowMobileDrawer(false);
                    }}
                    className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      currentRole === role
                        ? 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{roleLabels[role]?.icon}</span>
                    <span className="truncate">{roleLabels[role]?.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* School Switcher */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Campus
              </span>
              <span className="text-xs font-bold text-white block mb-2">{activeSchool.name}</span>
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowSchoolManagerModal(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Switch / Add School Campus</span>
              </button>
            </div>

            {/* Navigation Destinations */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                Portal Sections ({navItems.filter((i) => i.roles.includes(currentRole)).length})
              </span>
              {navItems
                .filter((item) => item.roles.includes(currentRole))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        triggerHaptic('navigate');
                        setActiveView(item.id);
                        setShowMobileDrawer(false);
                        speak(`Navigated to ${item.label}`, true);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-indigo-300" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Multi-School Modal */}
      <SchoolManagerModal
        isOpen={showSchoolManagerModal}
        onClose={() => setShowSchoolManagerModal(false)}
      />
    </header>
  );
};
