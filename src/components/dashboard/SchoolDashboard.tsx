import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Award,
  Calendar,
  CreditCard,
  ShieldCheck,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Compass,
} from 'lucide-react';

export const SchoolDashboard: React.FC = () => {
  const {
    students,
    courses,
    faculty,
    invoices,
    grades,
    attendance,
    notifications,
    currentRole,
    setActiveView,
    setMobilePreviewMode,
  } = useSchool();

  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const avgAttendance = (
    students.reduce((sum, s) => sum + s.attendanceRate, 0) / (students.length || 1)
  ).toFixed(1);

  const roleWelcomes: Record<string, { title: string; subtitle: string }> = {
    admin: {
      title: 'Gabbybru Company Ltd · Administrator Overview',
      subtitle: 'Complete institutional controls: Primary & JHS subject creation, teacher assignments, E2EE vault, Visa fee collections, and automated parent alerting.',
    },
    headmaster: {
      title: 'Gabbybru Headmaster Management Command',
      subtitle: 'Assign and authorize teachers to enter grades, manage student pictures, oversee percentage results, and audit timestamped records.',
    },
    assistant_head: {
      title: 'Assistant Headmaster Operations Command',
      subtitle: 'Manage student boarding house accommodation, sign official exeat passes, coordinate timetables, and monitor percentage grades.',
    },
    faculty: {
      title: 'Primary & JHS Faculty Workspace',
      subtitle: 'Class roll-call rosters, continuous gradebook evaluation, personal timetable, and student progress tracking.',
    },
    parent: {
      title: 'Parent & Guardian Secure Portal',
      subtitle: 'Live student attendance alerts, continuous grade reports in percentages (%), electronic transcripts, and secure Visa fee payments.',
    },
    student: {
      title: 'Student Academic Dashboard',
      subtitle: 'My daily timetable, real-time GPA tracking, upcoming exams, and digital school identity.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gabbybru Company Ltd · Primary, JHS &amp; SHS Academy Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {roleWelcomes[currentRole]?.title || 'Gabbybru Basic School Portal'}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {roleWelcomes[currentRole]?.subtitle || 'School Management System'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 shrink-0">
            {(currentRole === 'admin' || currentRole === 'headmaster' || currentRole === 'assistant_head') && (
              <button
                onClick={() => setActiveView('headmaster')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Headmaster Controls</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('boarding-exeat')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Boarding &amp; Exeat Slips</span>
            </button>

            <button
              onClick={() => setActiveView('parent-portal')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Parent Portal &amp; SMS</span>
            </button>

            <button
              onClick={() => setActiveView('attendance')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Roll Call</span>
            </button>

            <button
              onClick={() => setMobilePreviewMode('mobile_flutter')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Flutter App</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div
          onClick={() => setActiveView('attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{avgAttendance}%</div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target 95.0% exceeded</span>
          </div>
        </div>

        {/* Visa Revenue KPI */}
        <div
          onClick={() => setActiveView('billing')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visa Fees Settled</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })} pending
          </div>
        </div>

        {/* Academic Cohort GPA */}
        <div
          onClick={() => setActiveView('grades')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mean Cohort GPA</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">3.82 / 4.00</div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">
            <span>{grades.length} graded assessments</span>
          </div>
        </div>

        {/* Automated Notifications Dispatched */}
        <div
          onClick={() => setActiveView('notifications')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Automated Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{notifications.length}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SMS, Email & Push active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Overview (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Today's Academic Teaching Schedule</h2>
              <p className="text-xs text-slate-500">Periods 1 through 5 scheduled for Friday sessions</p>
            </div>
            <button
              onClick={() => setActiveView('faculty-schedule')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Timetable</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { period: 1, time: '08:30 - 09:20', course: 'Modern World History & Governance', teacher: 'Dr. Kenneth Howard', room: 'Room 204', grade: 'Grade 10-A', status: 'In Session' },
              { period: 2, time: '09:30 - 10:20', course: 'Advanced Calculus Problem Solving', teacher: 'Dr. Aris Thorne', room: 'Hall 302', grade: 'Grade 10-A', status: 'Upcoming' },
              { period: 3, time: '10:35 - 11:25', course: 'Physics Experimental Demo', teacher: 'Prof. Elena Rostova', room: 'Science Lab 2', grade: 'Grade 10-A', status: 'Upcoming' },
              { period: 4, time: '11:35 - 12:25', course: 'Project Showcase & Code Review', teacher: 'Marcus Vance, M.Sc.', room: 'Tech Hub 4', grade: 'Grade 10-A', status: 'Upcoming' },
            ].map((slot, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/40 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-900 font-mono text-xs font-bold shrink-0">
                    P{slot.period}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{slot.course}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {slot.teacher} · <span className="font-mono text-slate-700">{slot.room}</span> · {slot.grade}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                  <span className="text-slate-500">{slot.time}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.status === 'In Session'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Activity Feed (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Live Institutional Stream</h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 4).map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      item.type === 'attendance'
                        ? 'text-amber-700'
                        : item.type === 'payment_receipt'
                        ? 'text-emerald-700'
                        : 'text-indigo-700'
                    }`}
                  >
                    {item.type.replace('_', ' ')} · {item.channel.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.timestamp.substring(11, 16)}</span>
                </div>
                <div className="font-bold text-slate-900">{item.title}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveView('notifications')}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
          >
            View All Automated Log Events →
          </button>
        </div>
      </div>
    </div>
  );
};
