import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, GradeItem } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Users,
  Smartphone,
  Award,
  CheckCircle2,
  Calendar,
  CreditCard,
  Bell,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
  Clock,
  LogOut,
  UserPlus,
  LogIn,
  Volume2,
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const {
    students,
    grades,
    attendance,
    invoices,
    notifications,
    currentParent,
    registerParent,
    loginParent,
    logoutParent,
    sendManualNotification,
    setActiveView,
    activeSchool,
  } = useSchool();

  const { speak, triggerHaptic } = useAccessibility();

  // Auth Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+1 (555) 912-3401');
  const [regEmail, setRegEmail] = useState('');
  const [regRollNumber, setRegRollNumber] = useState(students[0]?.rollNumber || '');
  const [regPassword, setRegPassword] = useState('');

  // Active child selection for parents with multiple children
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Quick SMS simulation state
  const [customSmsText, setCustomSmsText] = useState('');

  // Find linked students for current parent
  const linkedStudents = useMemo(() => {
    if (!currentParent) return [];
    return students.filter(
      (s) =>
        currentParent.linkedStudentRollNumbers.includes(s.rollNumber) ||
        s.parentPhone.replace(/\D/g, '') === currentParent.phone.replace(/\D/g, '') ||
        s.parentEmail.toLowerCase() === currentParent.email.toLowerCase()
    );
  }, [currentParent, students]);

  // Fallback to first student if parent has no linked child yet
  const activeStudent: Student | undefined = useMemo(() => {
    if (selectedChildId) {
      return students.find((s) => s.id === selectedChildId);
    }
    return linkedStudents[0] || students[0];
  }, [selectedChildId, linkedStudents, students]);

  // Grades for active student
  const studentGrades = useMemo(() => {
    if (!activeStudent) return [];
    return grades.filter((g) => g.studentId === activeStudent.id);
  }, [activeStudent, grades]);

  // Overall percentage average
  const overallPercentage = useMemo(() => {
    if (studentGrades.length === 0) return 0;
    const total = studentGrades.reduce((sum, g) => sum + (g.percentage || (g.score / g.maxScore) * 100), 0);
    return (total / studentGrades.length).toFixed(1);
  }, [studentGrades]);

  // Student SMS notifications
  const studentSmsLogs = useMemo(() => {
    if (!activeStudent) return [];
    return notifications.filter(
      (n) =>
        n.recipientRole === 'parent' &&
        (n.recipientContact.includes(activeStudent.parentPhone) ||
          n.message.includes(activeStudent.name) ||
          (currentParent && n.recipientContact.includes(currentParent.phone)))
    );
  }, [activeStudent, notifications, currentParent]);

  // Handle Login Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginIdentifier.trim()) {
      setAuthError('Please enter your phone number or email.');
      return;
    }
    const res = loginParent(loginIdentifier);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // Handle Registration Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regPhone.trim() || !regRollNumber.trim()) {
      setAuthError('Please fill in your name, phone number, and student roll number.');
      return;
    }
    const res = registerParent(regName, regPhone, regEmail, regRollNumber);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // Trigger Instant Test SMS Alert
  const handleSendTestSms = () => {
    if (!activeStudent) return;
    const phone = currentParent?.phone || activeStudent.parentPhone;
    sendManualNotification({
      recipientName: currentParent?.name || activeStudent.parentName,
      recipientRole: 'parent',
      recipientContact: phone,
      type: 'academic',
      title: `Gabbybru Co. Ltd - SMS Result Alert`,
      message: `Dear Parent, Term 1 Academic Results for ${activeStudent.name} (${activeStudent.gradeLevel}) have been published: Overall Average ${overallPercentage}%. Log in to parent portal to view breakdown. Timestamp: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}.`,
      channel: 'sms',
      priority: 'high',
    });
  };

  // If not logged in as a parent, show login & registration portal
  if (!currentParent) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated SMS Result Alerts &amp; Real-Time Grades</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gabbybru Company Ltd · Parent &amp; Guardian Portal
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Create a parent account or log in to receive instant SMS alerts on your mobile phone any time your child's continuous assessment or exam results are posted in percentages (%).
            </p>
          </div>
        </div>

        {/* Auth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Parent Login</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  authMode === 'register'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {authError}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Phone Number (SMS) or Email
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 912-3401 or email"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Password / Access PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Parent Portal</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Parent / Guardian Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Sterling or Nana Kwame"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Phone Number for Instant SMS Alerts
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 912-3401"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Used by Gabbybru automated SMS gateway when exam results are published.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="parent@family.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Child Student Roll Number / ID to Link
                  </label>
                  <select
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.rollNumber}>
                        {s.name} — {s.rollNumber} ({s.department} {s.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account &amp; Activate SMS Alerts</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Demo Parent Accounts Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1-Click Quick Demo Parent Access
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select an existing registered parent to inspect the portal, official student pictures, and live SMS result notifications:
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Nana Kwame Mensah',
                  phone: '+1 (555) 912-3401',
                  child: 'Kofi Owusu Mensah',
                  grade: 'Primary 5',
                  dept: 'Primary',
                  photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Eleanor Sterling',
                  phone: '+1 (555) 912-3401',
                  child: 'Kwesi Mensah',
                  grade: 'JHS 2',
                  dept: 'JHS',
                  photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Harrison Montgomery',
                  phone: '+1 (555) 772-9903',
                  child: 'Kojo Asante Boateng',
                  grade: 'JHS 2',
                  dept: 'JHS',
                  photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
                },
              ].map((parent, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={parent.photo}
                      alt={parent.child}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{parent.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Child: <strong className="text-indigo-950">{parent.child}</strong> ({parent.grade})
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3" />
                        <span>SMS: {parent.phone}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      loginParent(parent.phone);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-colors"
                  >
                    Enter as {parent.name.split(' ')[0]} →
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Instant SMS Guarantee:</strong> Every time a teacher or headmaster records an exam or continuous assessment in the gradebook, our system instantly triggers an automated SMS to the registered parent's mobile phone with results in percentages (%).
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleReadChildResultsAloud = () => {
    if (!activeStudent) return;
    triggerHaptic('click');
    let text = `Results for your child ${activeStudent.name}, ${activeStudent.department} division, grade ${activeStudent.gradeLevel}. Overall continuous score ${overallPercentage} percent, Distinction honor. Registered parent phone for SMS alerts: ${currentParent?.phone}. `;
    studentGrades.forEach((g) => {
      const pct = g.percentage !== undefined ? g.percentage : ((g.score / g.maxScore) * 100).toFixed(1);
      text += `Course ${g.courseName}, assessment ${g.title}: ${pct} percent, score ${g.score} out of ${g.maxScore}. `;
    });
    text += `Attendance rate: ${activeStudent.attendanceRate} percent. Verified with official timestamp.`;
    speak(text, true);
  };

  // LOGGED IN VIEW FOR PARENT
  return (
    <div className="space-y-6">
      {/* Top Parent Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-950 flex items-center justify-center text-white shadow-xs">
              <User className="w-7 h-7 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Welcome, {currentParent.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  SMS Alerts Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gabbybru Parent Portal · Registered Phone: <span className="font-mono font-bold text-slate-800">{currentParent.phone}</span> · Campus: {activeSchool.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReadChildResultsAloud}
              aria-label="Listen to your child's complete results and grades aloud"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Volume2 className="w-4 h-4 text-indigo-200" />
              <span>Listen to Results Aloud</span>
            </button>

            <button
              onClick={handleSendTestSms}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              title="Test SMS alert dispatch to registered phone"
            >
              <Smartphone className="w-4 h-4" />
              <span>Test SMS Result Alert</span>
            </button>

            <button
              onClick={logoutParent}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Student Selector (if parent has multiple linked students) */}
        {linkedStudents.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Child:
            </span>
            <div className="flex gap-2">
              {linkedStudents.map((stu) => (
                <button
                  key={stu.id}
                  onClick={() => setSelectedChildId(stu.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeStudent?.id === stu.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {stu.name} ({stu.gradeLevel})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Child Identity Card with Official Picture & Timestamps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Student Identity
              </span>
              <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                {activeStudent.department}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Student Picture */}
              <div className="relative mb-3">
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-28 h-28 rounded-2xl object-cover shadow-md ring-4 ring-indigo-50"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white" title="Verified ID">
                  ✓
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{activeStudent.name}</h2>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Roll Number: <span className="font-bold text-slate-800">{activeStudent.rollNumber}</span>
              </p>
              <div className="text-xs text-indigo-700 font-semibold mt-1">
                {activeStudent.gradeLevel} · Section {activeStudent.section}
              </div>

              {/* Timestamp Badge */}
              <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 w-full text-center">
                <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                <span>Picture Stamped: </span>
                <span className="font-mono font-bold text-slate-800">{activeStudent.photoUpdatedAt || activeStudent.updatedAt}</span>
              </div>
            </div>

            {/* Attendance & Overall Performance Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-2xl font-black text-emerald-900 font-mono">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Grade 1 - Distinction</span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 text-center">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Attendance
                </span>
                <span className="text-2xl font-black text-blue-900 font-mono">
                  {activeStudent.attendanceRate}%
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5">Regular Attendance</span>
              </div>
            </div>

            {/* Visa Tuition Fee Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">School Fee Status</span>
                <span className="font-bold text-slate-900">
                  {activeStudent.feeStatus === 'paid' ? 'Term 1 Fully Settled' : 'Payment Due'}
                </span>
              </div>
              <button
                onClick={() => setActiveView('billing')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs"
              >
                Visa Billing →
              </button>
            </div>
          </div>

          {/* Academic Report Card: Percentage Breakdown & Remarks (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Terminal Results in Percentages (%) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Terminal Examination &amp; Continuous Assessment Results
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official scores computed and displayed strictly in percentages (%).
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Grading Scale</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">100% Percentile</span>
                </div>
              </div>

              {/* Subject Results Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Subject / Course</th>
                      <th className="py-2.5 px-3">Assessment</th>
                      <th className="py-2.5 px-3">Raw Score</th>
                      <th className="py-2.5 px-3 font-black text-slate-900">Percentage (%)</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentGrades.map((g) => {
                      const pct = g.percentage || Number(((g.score / g.maxScore) * 100).toFixed(1));
                      const isHigh = pct >= 80;
                      const isLow = pct < 50;

                      return (
                        <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{g.courseName}</td>
                          <td className="py-3 px-3 text-slate-600 font-medium">{g.title}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">
                            {g.score} / {g.maxScore}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-mono font-black text-xs px-2.5 py-1 rounded-md border ${
                                isHigh
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isLow
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-bold text-slate-700">
                              {pct >= 90 ? 'Grade 1' : pct >= 80 ? 'Grade 2' : pct >= 70 ? 'Grade 3' : 'Grade 4'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">
                            {g.updatedAt || '2026-10-15 08:30:00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live SMS Alert Phone Simulator: Real-Time Alerts sent to Parent's Phone */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Live SMS Result Stream ({currentParent.phone})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Automated carrier text alerts delivered immediately when grades are posted.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Gateway Connected
                </span>
              </div>

              {/* Simulated Phone Screen showing SMS messages */}
              <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-100 space-y-3 font-sans">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>SMS Gateway: GABBYBRU-SMS</span>
                  <span className="font-mono">Carrier: MTN / Vodafone / AT Ghana</span>
                </div>

                {studentSmsLogs.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No SMS messages yet. Click "Test SMS Result Alert" above or post a grade in the Gradebook.
                  </div>
                ) : (
                  studentSmsLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-indigo-950/70 border border-indigo-700/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          📱 {log.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed font-mono">
                        {log.message}
                      </p>
                      <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <span>✓✓ Delivered to {log.recipientContact}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
