import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Course, FacultyMember, Student, GradeItem, AssistantHead } from '../../types';
import {
  UserCheck,
  Camera,
  Image,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Upload,
  RefreshCw,
  Send,
  Building,
  ShieldCheck,
  UserPlus,
  Volume2,
} from 'lucide-react';

export const HeadmasterDashboard: React.FC = () => {
  const {
    activeSchool,
    students,
    courses,
    faculty,
    grades,
    auditLogs,
    assignTeacherToSubject,
    updateStudentPhoto,
    searchQuery,
    assistantHeads,
    addAssistantHead,
    currentRole,
  } = useSchool();

  const { speak, triggerHaptic } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'teachers' | 'assistant_heads' | 'photos' | 'results' | 'audit'>('teachers');

  // Assistant Head State
  const [assistantFacultyId, setAssistantFacultyId] = useState<string>(faculty[0]?.id || '');
  const [assistantPortfolio, setAssistantPortfolio] = useState<AssistantHead['portfolio']>('Domestic & Boarding');

  // Teacher Assignment State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedLeadTeacherId, setSelectedLeadTeacherId] = useState<string>('');
  const [selectedCoTeacherNames, setSelectedCoTeacherNames] = useState<string[]>([]);
  const [newCoTeacherName, setNewCoTeacherName] = useState('');

  // Student Photo State
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<Student>(students[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Preset portrait sample images
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  ];

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleAppointAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantFacultyId) return;
    triggerHaptic('success');
    addAssistantHead(assistantFacultyId, assistantPortfolio);
    speak(`Appointed Assistant Head for ${assistantPortfolio} portfolio`, true);
  };

  const handleAssignTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedLeadTeacherId) return;
    assignTeacherToSubject(selectedCourseId, selectedLeadTeacherId, selectedCoTeacherNames);
  };

  const handleUpdateStudentPhotoSubmit = (newUrl: string) => {
    if (!selectedStudentForPhoto || !newUrl.trim()) return;
    updateStudentPhoto(selectedStudentForPhoto.id, newUrl.trim());
    setSelectedStudentForPhoto({
      ...selectedStudentForPhoto,
      avatar: newUrl.trim(),
      photoUpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-950 flex items-center justify-center text-white shadow-xs">
              <UserCheck className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Headmaster Management Portal
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  {activeSchool.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                School Leadership: Assign teachers to subjects, manage student pictures, oversee percentage results, and audit changes with live timestamps.
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus Headmaster</span>
            <span className="font-bold text-slate-900 text-sm">{activeSchool.headmasterName}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mt-5 overflow-x-auto">
          {[
            { id: 'teachers', label: 'Assign & Manage Teachers' },
            { id: 'assistant_heads', label: `Appoint Assistant Heads (${assistantHeads?.length || 0})` },
            { id: 'photos', label: 'Student Pictures & Timestamps' },
            { id: 'results', label: 'Review Grades in Percentages (%)' },
            { id: 'audit', label: 'System Timestamped Change Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TEACHER ASSIGNMENT */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign Teachers to Subject</h3>
              <p className="text-xs text-slate-500">
                Headmaster authorization to assign primary and co-teachers who can enter grades.
              </p>
            </div>

            <form onSubmit={handleAssignTeacherSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const c = courses.find((crs) => crs.id === e.target.value);
                    if (c) {
                      setSelectedLeadTeacherId(c.facultyId);
                      setSelectedCoTeacherNames(c.coTeachers || []);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <optgroup label="── Primary School ──">
                    {courses
                      .filter((c) => c.department === 'Primary')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gradeLevel})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="── Junior High School (JHS) ──">
                    {courses
                      .filter((c) => c.department === 'JHS')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gradeLevel})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="── Senior High School (SHS) ──">
                    {courses
                      .filter((c) => c.department === 'SHS')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gradeLevel})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Designate Lead Instructor
                </label>
                <select
                  required
                  value={selectedLeadTeacherId || currentCourse?.facultyId}
                  onChange={(e) => setSelectedLeadTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — ({f.department} - {f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Add Co-Teacher (Collaborative / Lab Assistant)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type assistant teacher name..."
                    value={newCoTeacherName}
                    onChange={(e) => setNewCoTeacherName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCoTeacherName.trim()) {
                        setSelectedCoTeacherNames([...selectedCoTeacherNames, newCoTeacherName.trim()]);
                        setNewCoTeacherName('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 font-semibold rounded-lg text-slate-800"
                  >
                    Add
                  </button>
                </div>

                {selectedCoTeacherNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCoTeacherNames.map((ct, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700"
                      >
                        <span>{ct}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCoTeacherNames(selectedCoTeacherNames.filter((t) => t !== ct))}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200/60 rounded-lg text-[11px] text-indigo-950">
                ⚡ Audit Guarantee: Headmaster assignment will be stamped with the current date, time, and actor identification in the school audit log.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                Confirm &amp; Publish Teacher Assignment
              </button>
            </form>
          </div>

          {/* Current Subject Roster & Assigned Teachers */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Subjects &amp; Teaching Staff ({courses.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono">Headmaster Authorized</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {courses.map((c) => (
                <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          c.department === 'Primary'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.department === 'JHS'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {c.department}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Lead Instructor: <strong className="text-slate-800">{c.facultyName}</strong> · Room: {c.room} · {c.gradeLevel}
                    </div>
                    {c.coTeachers && c.coTeachers.length > 0 && (
                      <div className="text-[10px] text-indigo-700 mt-0.5">
                        Co-Teachers: {c.coTeachers.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Last Stamped: {c.updatedAt || '2026-10-15'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setSelectedLeadTeacherId(c.facultyId);
                        setSelectedCoTeacherNames(c.coTeachers || []);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1"
                    >
                      Reassign →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPOINT ASSISTANT HEADMASTERS (EXCLUSIVE TO HEADMASTER) */}
      {activeTab === 'assistant_heads' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Headmaster Exclusive Authority</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Appoint Assistant Headmaster</h3>
              <p className="text-xs text-slate-500">
                Only the Headmaster can appoint an Assistant Head to oversee portfolios like Boarding, Exeat Passes, Academics, and Administration.
              </p>
            </div>

            <form onSubmit={handleAppointAssistantSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Designate Faculty Member
                </label>
                <select
                  value={assistantFacultyId}
                  onChange={(e) => setAssistantFacultyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 font-semibold"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — ({f.department} · {f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Assigned Administrative Portfolio
                </label>
                <select
                  value={assistantPortfolio}
                  onChange={(e) => setAssistantPortfolio(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 font-semibold"
                >
                  <option value="Domestic & Boarding">Domestic &amp; Boarding (Authorizes Exeat Permits)</option>
                  <option value="Academics">Academics (Master Schedules &amp; Grades)</option>
                  <option value="Administration">General Campus Administration</option>
                  <option value="Student Affairs">Student Affairs &amp; Welfare</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>Delegated Permissions:</span>
                </div>
                <div>• Login authority as Assistant Headmaster with immutable timestamping</div>
                <div>• Power to approve student Exeat slips and dispatch automated parent SMS alerts</div>
                <div>• Oversight of teachers and percentage-based gradebooks</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Appoint &amp; Stamped into School Roll</span>
              </button>
            </form>
          </div>

          {/* Assistant Heads Roster */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Official Assistant Headmasters ({assistantHeads?.length || 0})
              </h3>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Headmaster Certified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(assistantHeads || []).map((asst) => (
                <div
                  key={asst.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{asst.name}</h4>
                      <span className="text-xs font-semibold text-indigo-700 block">
                        Assistant Headmaster · {asst.portfolio}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        triggerHaptic('click');
                        speak(`Assistant Headmaster ${asst.name}, Portfolio: ${asst.portfolio}. Appointed by ${asst.appointedByHeadmaster} at ${asst.appointedAt}. Contact: ${asst.phone}`, true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600"
                      aria-label={`Read details for ${asst.name}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>Phone: <span className="font-mono text-slate-800">{asst.phone}</span></div>
                    <div>Email: <span className="font-mono text-slate-800">{asst.email}</span></div>
                    <div>Appointed by: <strong>{asst.appointedByHeadmaster}</strong></div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {asst.appointedAt}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {asst.canApproveExeat ? 'Exeat Signing Authorized' : 'Standard'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">ID: {asst.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT PICTURES & TIMESTAMPS */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Select Student to Manage Picture</h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {students.map((stu) => {
                const isSelected = stu.id === selectedStudentForPhoto?.id;
                return (
                  <button
                    key={stu.id}
                    onClick={() => setSelectedStudentForPhoto(stu)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={stu.avatar} alt={stu.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {stu.rollNumber} · {stu.gradeLevel}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{stu.department}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Picture Upload & Timestamp Manager */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Student Official Picture: {selectedStudentForPhoto?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono text-slate-700">{selectedStudentForPhoto?.rollNumber}</span> · Department: {selectedStudentForPhoto?.department} ({selectedStudentForPhoto?.gradeLevel})
                </p>
              </div>

              {/* Timestamp Badge */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Photo Timestamp</span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedStudentForPhoto?.photoUpdatedAt || '2026-10-15 08:15:00'}
                </span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">
                  Verified by {selectedStudentForPhoto?.photoUpdatedBy || 'Headmaster'}
                </span>
              </div>
            </div>

            {/* Current Picture Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative group">
                <img
                  src={selectedStudentForPhoto?.avatar}
                  alt={selectedStudentForPhoto?.name}
                  className="w-28 h-28 rounded-2xl object-cover shadow-md ring-4 ring-white"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Identity Photo</span>
                <div className="font-bold text-slate-900 text-sm">{selectedStudentForPhoto?.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Parent Contact: {selectedStudentForPhoto?.parentName} ({selectedStudentForPhoto?.parentPhone})
                </div>
                <div className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved for student ID cards, printable report transcripts &amp; app portal.</span>
                </div>
              </div>
            </div>

            {/* Choose from Preset Sample Pictures or Type URL */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select from Verified Student Portraits
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {sampleAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateStudentPhotoSubmit(url)}
                    className="group relative rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 focus:ring-indigo-600 transition-all"
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-16 object-cover" />
                    <span className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      Apply
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image URL Upload */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Or Type / Paste Custom Photo Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/student-portrait.jpg"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoUrl) {
                      handleUpdateStudentPhotoSubmit(customPhotoUrl);
                      setCustomPhotoUrl('');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW GRADES IN PERCENTAGES (%) */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Academic Results Review &amp; Percentage Verification
              </h3>
              <p className="text-xs text-slate-500">
                All assessment scores computed and displayed in percentages (%) with modification timestamps.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold text-xs">
              Scale: 100% Percentile System
            </div>
          </div>

          {/* Mobile View: Stacked Cards for Smartphones */}
          <div className="sm:hidden p-3 space-y-3">
            {grades.map((g) => {
              const pct = g.percentage || Number(((g.score / g.maxScore) * 100).toFixed(1));
              const isHigh = pct >= 80;
              const isLow = pct < 50;

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{g.studentName}</h4>
                      <span className="text-xs text-slate-600 block">{g.courseName} · {g.title}</span>
                    </div>
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
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Raw Score: <strong className="font-mono text-slate-900">{g.score}/{g.maxScore}</strong></span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      SMS Sent
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Entered by: <strong className="text-slate-700">{g.updatedBy || 'Teacher'}</strong></span>
                    <span className="font-mono text-[10px]">{g.updatedAt ? g.updatedAt.slice(0, 16) : '2026-10-15'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 font-black text-slate-900">Percentage (%)</th>
                  <th className="py-3 px-4">Entered By</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Parent SMS Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g) => {
                  const pct = g.percentage || Number(((g.score / g.maxScore) * 100).toFixed(1));
                  const isHigh = pct >= 80;
                  const isLow = pct < 50;

                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{g.studentName}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{g.courseName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{g.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {g.score} / {g.maxScore}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-black text-sm px-2.5 py-1 rounded-md border ${
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
                      <td className="py-3 px-4 text-slate-600 font-medium">{g.updatedBy || 'Teacher'}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {g.updatedAt || '2026-10-15 08:30:00'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          SMS Dispatched
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM TIMESTAMPMED CHANGE LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Audit Log &amp; Modification Timestamps
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit trail showing every update, timestamp, actor identity, and target entity.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} Events Logged</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {log.targetType.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-indigo-700">{log.targetName}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{log.details}</p>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Actor: <span className="text-slate-700 font-medium">{log.actorName}</span> ({log.actorRole})
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
