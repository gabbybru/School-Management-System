import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FlutterCodeExport } from './FlutterCodeExport';
import { VisaCheckoutModal } from '../billing/VisaCheckoutModal';
import {
  Smartphone,
  Apple,
  Wifi,
  Battery,
  Award,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Bell,
  ChevronRight,
  Code2,
} from 'lucide-react';

export const FlutterSimulator: React.FC = () => {
  const {
    students,
    courses,
    grades,
    invoices,
    mobileDeviceType,
    setMobileDeviceType,
    setMobilePreviewMode,
    recordAttendance,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'grades' | 'wallet'>('home');
  const [showCodeView, setShowCodeView] = useState(false);
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState<any | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(true);

  const student = students[0]; // Primary view: Alexander Sterling

  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const studentInvoices = invoices.filter((inv) => inv.studentId === student.id);
  const pendingInvoices = invoices.filter((inv) => inv.status !== 'paid');

  const isIOS = mobileDeviceType === 'ios';

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Cross-Platform Flutter Mobile Simulator (iOS & Android)
            </h2>
            <p className="text-xs text-slate-500">
              Native Flutter compilation target with adaptive Cupertino (iOS) and Material 3 (Android) UI components.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* OS Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMobileDeviceType('ios')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                isIOS ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Apple iOS</span>
            </button>
            <button
              onClick={() => setMobileDeviceType('android')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                !isIOS ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Android</span>
            </button>
          </div>

          {/* Toggle Code Export */}
          <button
            onClick={() => setShowCodeView(!showCodeView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              showCodeView
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCodeView ? 'Hide Flutter Code' : 'Flutter Source Code'}</span>
          </button>
        </div>
      </div>

      {showCodeView && <FlutterCodeExport />}

      {/* Mobile Device Frame Container */}
      <div className="flex justify-center items-center py-4">
        {/* Phone Frame */}
        <div
          className={`relative w-[380px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 ${
            isIOS ? 'border-slate-800 ring-8 ring-slate-900/40' : 'border-slate-800 ring-6 ring-slate-900/30'
          } flex flex-col`}
        >
          {/* Dynamic Island / Notch */}
          {isIOS && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950 ring-1 ring-blue-900" />
            </div>
          )}

          {/* Android Camera Hole */}
          {!isIOS && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 ring-1 ring-slate-800" />
          )}

          {/* Inner Phone Screen */}
          <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col text-slate-900 relative font-sans">
            {/* Mobile Status Bar */}
            <div className="h-11 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 pt-2 shrink-0 select-none">
              <span>08:42</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                  GB
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight">Gabbybru Mobile</h3>
                  <p className="text-[9px] text-slate-400 leading-tight">Primary &amp; JHS Flutter Client</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  E2EE OK
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Screen Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* TAB: HOME */}
              {activeTab === 'home' && (
                <>
                  {/* Digital Student Identity Card */}
                  <div className="rounded-2xl p-4 text-white bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-900 shadow-lg relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-blue-300 font-mono">
                          ACADEMIC YEAR 2026/27
                        </span>
                        <h4 className="text-base font-bold mt-0.5">{student.name}</h4>
                        <div className="text-[11px] text-blue-200 font-mono">
                          {student.gradeLevel}-{student.section} · {student.rollNumber}
                        </div>
                      </div>
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-blue-300 block">Cumulative GPA</span>
                        <span className="font-bold text-sm text-white">3.92 / 4.00</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-blue-300 block">Attendance</span>
                        <span className="font-bold text-sm text-emerald-400">98.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Class Countdown Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-indigo-600">Next Scheduled Class</span>
                      <span className="text-[10px] text-slate-400 font-mono">Starts in 18 min</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      Period 2: AP Physics & Lab Dynamics
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>Prof. Elena Rostova</span>
                      <span className="font-mono text-slate-700">Science Lab 2</span>
                    </div>
                  </div>

                  {/* Quick Action Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all text-left group"
                    >
                      <Users className="w-5 h-5 text-indigo-600 mb-1" />
                      <div className="font-bold text-slate-900 text-xs">Roll Call Tap</div>
                      <div className="text-[10px] text-slate-400">Check in today</div>
                    </button>

                    <button
                      onClick={() => setActiveTab('wallet')}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all text-left group"
                    >
                      <CreditCard className="w-5 h-5 text-blue-600 mb-1" />
                      <div className="font-bold text-slate-900 text-xs">Visa Fee Pay</div>
                      <div className="text-[10px] text-slate-400">Manage tuition</div>
                    </button>
                  </div>

                  {/* Automated Parent Notification Feed */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Recent Automated Alerts</span>
                      <span className="text-[10px] text-slate-400">Live SMS & Push</span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-950 text-[11px]">Visa Payment Confirmed</span>
                        <span className="text-[9px] text-slate-400">Today 08:15</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        $3,250.00 processed for Term 1 Tuition. Electronic receipt #TXN-998241 issued.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* TAB: ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Today's Student Tap-In
                    </span>
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center mx-auto">
                      <span className="text-xl font-black text-emerald-800">98%</span>
                      <span className="text-[8px] uppercase font-bold text-emerald-600">Rate</span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      {checkedInToday ? '✓ Present for Period 1' : 'Awaiting Roll Call'}
                    </div>

                    <button
                      onClick={() => {
                        setCheckedInToday(true);
                        recordAttendance(student.id, courses[0].id, 'present');
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      {checkedInToday ? 'Re-confirm Attendance Tap' : 'Tap to Mark Present'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Automated Parent Alerts</div>
                      <div className="text-[10px] text-slate-500">Unexcused absence sends SMS in 10m</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded">
                      Enabled
                    </span>
                  </div>
                </div>
              )}

              {/* TAB: GRADES */}
              {activeTab === 'grades' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-indigo-200">Cumulative GPA</span>
                      <div className="text-2xl font-black font-mono">3.92 / 4.00</div>
                      <span className="text-[10px] text-indigo-300">Dean's First Honors List</span>
                    </div>
                    <Award className="w-10 h-10 text-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Course Evaluations</span>
                    {studentGrades.slice(0, 4).map((g) => (
                      <div key={g.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{g.courseName}</div>
                          <div className="text-[10px] text-slate-500">{g.title}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-indigo-950 text-sm">
                            {g.score} / {g.maxScore}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {((g.score / g.maxScore) * 100).toFixed(0)}% · Grade A
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: WALLET */}
              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  {/* Visa Wallet Header */}
                  <div className="p-4 rounded-xl bg-gradient-to-tr from-blue-950 to-indigo-900 text-white space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-blue-200">Visa Parent Wallet</span>
                      <span className="font-black italic text-sm text-white">VISA</span>
                    </div>
                    <div className="text-xl font-bold font-mono">•••• 4242</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>AES-256 Tokenized Autopay Active</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Tuition & Fee Invoices</span>
                    {invoices.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{inv.description}</div>
                          <div className="text-[10px] text-slate-500 font-mono">${inv.amount.toFixed(2)} USD</div>
                        </div>
                        <div>
                          {inv.status === 'paid' ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Paid
                            </span>
                          ) : (
                            <button
                              onClick={() => setActiveInvoiceForPay(inv)}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold shadow-xs"
                            >
                              Pay with Visa
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar (Cupertino on iOS, Material 3 on Android) */}
            <div className={`px-4 py-2 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-around shrink-0 ${isIOS ? 'pb-5' : 'pb-2'}`}>
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'home' ? 'text-blue-900 font-bold' : 'text-slate-400'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-base">🏛️</span>
                </div>
                <span className="text-[10px]">Home</span>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'attendance' ? 'text-blue-900 font-bold' : 'text-slate-400'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px]">Roll Call</span>
              </button>

              <button
                onClick={() => setActiveTab('grades')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'grades' ? 'text-blue-900 font-bold' : 'text-slate-400'
                }`}
              >
                <Award className="w-4 h-4" />
                <span className="text-[10px]">Grades</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'wallet' ? 'text-blue-900 font-bold' : 'text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Visa Pay</span>
              </button>
            </div>

            {/* iOS Home Indicator Bar */}
            {isIOS && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full opacity-60" />
            )}
          </div>
        </div>
      </div>

      {/* Visa Payment Modal if triggered inside mobile simulator */}
      {activeInvoiceForPay && (
        <VisaCheckoutModal
          invoice={activeInvoiceForPay}
          onClose={() => setActiveInvoiceForPay(null)}
          onSuccess={() => setActiveInvoiceForPay(null)}
        />
      )}
    </div>
  );
};
