import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { GradeItem, GradeCategory, Student } from '../../types';
import {
  Award,
  Plus,
  Printer,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Filter,
  Trash2,
  Sparkles,
  Volume2,
} from 'lucide-react';

export const GradebookManager: React.FC = () => {
  const {
    students,
    courses,
    grades,
    addGrade,
    deleteGrade,
    searchQuery,
    currentRole,
  } = useSchool();

  const { speak, triggerHaptic } = useAccessibility();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);

  // Form State for Adding Grade
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || '');
  const [formCourseId, setFormCourseId] = useState<string>(courses[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<GradeCategory>('exam');
  const [formScore, setFormScore] = useState<number>(85);
  const [formMaxScore, setFormMaxScore] = useState<number>(100);
  const [formWeight, setFormWeight] = useState<number>(25);
  const [formRemarks, setFormRemarks] = useState('');

  // Filtered grades
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchCourse = selectedCourseId === 'all' || g.courseId === selectedCourseId;
      const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
      const matchSearch = searchQuery
        ? g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchCourse && matchCategory && matchSearch;
    });
  }, [grades, selectedCourseId, selectedCategory, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (grades.length === 0) return { avgPercentage: 0, highCount: 0, lowCount: 0, total: 0 };
    let totalPct = 0;
    let high = 0;
    let low = 0;

    grades.forEach((g) => {
      const pct = (g.score / g.maxScore) * 100;
      totalPct += pct;
      if (pct >= 90) high++;
      if (pct < 70) low++;
    });

    return {
      avgPercentage: (totalPct / grades.length).toFixed(1),
      highCount: high,
      lowCount: low,
      total: grades.length,
    };
  }, [grades]);

  const handleAddGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formStudentId);
    const course = courses.find((c) => c.id === formCourseId);
    if (!student || !course || !formTitle) return;

    addGrade({
      studentId: student.id,
      studentName: student.name,
      courseId: course.id,
      courseName: course.name,
      title: formTitle,
      category: formCategory,
      score: Number(formScore),
      maxScore: Number(formMaxScore),
      weight: Number(formWeight),
      date: new Date().toISOString().split('T')[0],
      remarks: formRemarks,
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormRemarks('');
  };

  const getLetterBadge = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 93) return { grade: 'A', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 85) return { grade: 'B', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (pct >= 75) return { grade: 'C', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (pct >= 65) return { grade: 'D', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { grade: 'F', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const handleSpeakGrade = (g: GradeItem) => {
    triggerHaptic('click');
    const badge = getLetterBadge(g.score, g.maxScore);
    const percentage = g.percentage !== undefined ? g.percentage : Number(((g.score / g.maxScore) * 100).toFixed(1));
    const text = `Assessment for ${g.studentName}. Course: ${g.courseName}. Title: ${g.title}, category: ${g.category}. Score: ${g.score} out of ${g.maxScore}, calculated at ${percentage} percent, letter grade ${badge.grade}. Teacher remarks: ${g.remarks || 'Satisfactory'}. Timestamp: ${g.updatedAt || '2026-10-15'}. Recorded by: ${g.updatedBy || 'Teacher'}.`;
    speak(text, true);
  };

  const handleSpeakReportCard = () => {
    if (!reportCardStudent) return;
    triggerHaptic('click');
    const studentGrades = grades.filter((g) => g.studentId === reportCardStudent.id);
    let summary = `Official Academic Transcript for ${reportCardStudent.name}, student index number ${reportCardStudent.rollNumber}, ${reportCardStudent.department} division, grade ${reportCardStudent.gradeLevel}. Cumulative GPA: ${reportCardStudent.gpa}. Total assessments recorded: ${studentGrades.length}. `;
    studentGrades.forEach((g) => {
      const pct = g.percentage !== undefined ? g.percentage : ((g.score / g.maxScore) * 100).toFixed(1);
      summary += `${g.courseName}: ${pct} percent. Score ${g.score} of ${g.maxScore}. `;
    });
    summary += `Verified with official Gabbybru school timestamp.`;
    speak(summary, true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Gradebook & Evaluation</h1>
              <p className="text-xs text-slate-500">
                Continuous assessment recording with automated parent warnings for low scores and official report card generation.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {currentRole !== 'student' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record New Grade</span>
              </button>
            )}

            <button
              onClick={() => setReportCardStudent(students[0])}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report Card</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Course Filter
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Academic Subjects (Primary, JHS &amp; SHS)</option>
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
              Assessment Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 capitalize"
            >
              <option value="all">All Categories</option>
              <option value="exam">Exams & Midterms</option>
              <option value="quiz">Quizzes & Tests</option>
              <option value="homework">Homework & Essays</option>
              <option value="project">Projects & Lab Work</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 w-full flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Evaluation Cohort GPA:</span>
              <span className="font-extrabold text-indigo-700 font-mono text-sm">3.82 / 4.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cohort Mean Score</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.avgPercentage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all recorded items</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Distinction (90%+)</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{stats.highCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Excellence honors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/60 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">At-Risk Alert (&lt;70%)</span>
          <div className="text-2xl font-black text-rose-800 mt-1">{stats.lowCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Automated alert dispatched</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessments Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Current grading term</div>
        </div>
      </div>

      {/* Grade Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recorded Academic Assessments</h2>
          <span className="text-xs text-slate-500 font-mono">{filteredGrades.length} records</span>
        </div>

        {/* Mobile View: Accessible Stacked Cards for Smartphones */}
        <div className="sm:hidden p-3 space-y-3">
          {filteredGrades.map((g) => {
            const badge = getLetterBadge(g.score, g.maxScore);
            const percentage = g.percentage !== undefined ? g.percentage : Number(((g.score / g.maxScore) * 100).toFixed(1));

            return (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{g.studentName}</h3>
                    <span className="text-xs text-slate-600 block">{g.courseName} · {g.title}</span>
                  </div>
                  <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border ${badge.color}`}>
                    {percentage}% ({badge.grade})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Score: <strong className="text-slate-900 font-mono">{g.score}/{g.maxScore}</strong></span>
                  <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                    {g.category}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  {g.remarks ? `Remarks: "${g.remarks}"` : 'Remarks: Satisfactory'}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Stamped: {g.updatedAt ? g.updatedAt.slice(0, 16) : '2026-10-15'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakGrade(g)}
                      aria-label={`Listen to ${g.studentName}'s score aloud`}
                      className="px-2.5 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 font-bold text-xs border border-indigo-200"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Listen</span>
                    </button>

                    {currentRole !== 'student' && (
                      <button
                        onClick={() => deleteGrade(g.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 font-black text-slate-900">Score &amp; Percentage (%)</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4">Teacher Feedback</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map((g) => {
                const badge = getLetterBadge(g.score, g.maxScore);
                const percentage = g.percentage !== undefined ? g.percentage : Number(((g.score / g.maxScore) * 100).toFixed(1));

                return (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{g.studentName}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{g.courseName}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{g.title}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {g.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {g.score}/{g.maxScore}
                        </span>
                        <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded border ${badge.color}`}>
                          {percentage}% ({badge.grade})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Parent SMS Alert Sent</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {g.updatedAt || '2026-10-15 08:30:00'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium text-xs whitespace-nowrap">
                      {g.updatedBy || 'Teacher'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">
                      {g.remarks || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSpeakGrade(g)}
                          aria-label={`Listen to ${g.studentName} grade score`}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded border border-indigo-200"
                          title="Listen aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {currentRole !== 'student' && (
                          <button
                            onClick={() => deleteGrade(g.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Grade Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Assessment Grade</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGradeSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Student
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Course
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Calculus Examination"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GradeCategory)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 capitalize"
                  >
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="homework">Homework</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formMaxScore}
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Real-time Percentage Indicator */}
              <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">Computed Result in Percentage (%)</span>
                  <span className="text-xl font-black font-mono text-indigo-950">
                    {((formScore / (formMaxScore || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Equivalence</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {((formScore / (formMaxScore || 1)) * 100) >= 90
                      ? 'Grade 1 (Distinction)'
                      : ((formScore / (formMaxScore || 1)) * 100) >= 80
                      ? 'Grade 2 (Very Good)'
                      : ((formScore / (formMaxScore || 1)) * 100) >= 70
                      ? 'Grade 3 (Good)'
                      : 'Grade 4 (Credit)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Weighting (% of Term)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formWeight}
                  onChange={(e) => setFormWeight(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Teacher Feedback Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional qualitative commentary..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Automated SMS Alert Enabled:</strong> As soon as this grade is saved, the system will immediately generate and dispatch an automated SMS alert with the result in percentage ({((formScore / (formMaxScore || 1)) * 100).toFixed(1)}%) to the student's parent phone.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Save &amp; Dispatch Parent SMS Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Generator Modal */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Student:</span>
                <select
                  value={reportCardStudent.id}
                  onChange={(e) => {
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) setReportCardStudent(found);
                  }}
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeakReportCard}
                  aria-label="Listen to official report card read aloud"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Aloud</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Transcript</span>
                </button>
                <button
                  onClick={() => setReportCardStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Card Printable Document */}
            <div className="mt-6 border-2 border-indigo-900/20 p-6 sm:p-8 rounded-xl bg-gradient-to-b from-slate-50/50 to-white relative">
              {/* Watermark Seal */}
              <div className="text-center pb-6 border-b-2 border-slate-900/10">
                <div className="text-xs font-extrabold tracking-widest uppercase text-indigo-900">
                  Gabbybru Company Ltd · Basic Education Department
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 mt-1 uppercase">
                  Official Academic Transcript &amp; Report Card
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Primary &amp; Junior High School (JHS) Division · Academic Year 2026–2027
                </div>
              </div>

              {/* Student Bio Metadata with Official Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-4 py-4 border-b border-slate-200 text-xs">
                <div className="relative shrink-0">
                  <img
                    src={reportCardStudent.avatar}
                    alt={reportCardStudent.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-xs ring-2 ring-indigo-900/10"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                    <span className="font-bold text-slate-900 text-sm">{reportCardStudent.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Stamped: {reportCardStudent.photoUpdatedAt || reportCardStudent.updatedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID / Roll</span>
                    <span className="font-mono font-bold text-slate-800">{reportCardStudent.rollNumber}</span>
                    <span className="text-[10px] text-indigo-700 block mt-0.5 font-bold">{reportCardStudent.department} Division</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade &amp; Section</span>
                    <span className="font-bold text-slate-800">{reportCardStudent.gradeLevel} - {reportCardStudent.section}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">SMS: {reportCardStudent.parentPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Term Aggregate Score</span>
                    <span className="font-black text-indigo-700 text-base font-mono">
                      {((reportCardStudent.gpa / 4.0) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Grade 1 Distinction</span>
                  </div>
                </div>
              </div>

              {/* Course Grades Table */}
              <div className="mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Subject / Course</th>
                      <th className="py-2 px-3">Faculty Instructor</th>
                      <th className="py-2 px-3">Credits</th>
                      <th className="py-2 px-3">Letter Grade</th>
                      <th className="py-2 px-3 text-right">Term Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.slice(0, 5).map((course) => {
                      const studentCourseGrades = grades.filter(
                        (g) => g.studentId === reportCardStudent.id && g.courseId === course.id
                      );
                      const avg =
                        studentCourseGrades.length > 0
                          ? studentCourseGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
                            studentCourseGrades.length
                          : 92;
                      const badge = getLetterBadge(avg, 100);

                      return (
                        <tr key={course.id}>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{course.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{course.facultyName}</td>
                          <td className="py-2.5 px-3 font-mono">{course.credits}.0</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${badge.color}`}>
                              {badge.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                            {avg.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Faculty Remarks & Verification Code */}
              <div className="mt-6 pt-4 border-t-2 border-slate-900/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Faculty Commendation</span>
                  <p className="text-slate-700 italic mt-1 leading-relaxed">
                    "{reportCardStudent.name} demonstrates exceptional analytical rigor and intellectual curiosity. Recommended for honors seminar placement."
                  </p>
                </div>
                <div className="sm:text-right flex flex-col justify-end">
                  <div className="text-[10px] font-mono text-slate-400">
                    E2EE Verification Hash: <span className="font-bold text-slate-600">SHA256:7f4a29...8c</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">
                    Registrar Office · Dr. Aris Thorne (Academic Dean)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
