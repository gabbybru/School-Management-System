import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Course, FacultyMember, SchoolDepartment } from '../../types';
import {
  BookOpen,
  Plus,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Building,
  GraduationCap,
} from 'lucide-react';

export const SubjectManagement: React.FC = () => {
  const {
    courses,
    faculty,
    addCourse,
    updateCourse,
    deleteCourse,
    addFaculty,
    currentRole,
    searchQuery,
  } = useSchool();

  const [activeDeptTab, setActiveDeptTab] = useState<'all' | SchoolDepartment>('all');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State for Adding / Editing Course
  const [formName, setName] = useState('');
  const [formCode, setCode] = useState('');
  const [formDept, setDept] = useState<SchoolDepartment>('Primary');
  const [formGradeLevel, setGradeLevel] = useState('Primary 5');
  const [formPrimaryTeacherId, setPrimaryTeacherId] = useState('');
  const [typedNewTeacherName, setTypedNewTeacherName] = useState('');
  const [isTypingNewTeacher, setIsTypingNewTeacher] = useState(false);
  const [formCoTeachers, setCoTeachers] = useState<string[]>([]);
  const [coTeacherInput, setCoTeacherInput] = useState('');
  const [formRoom, setRoom] = useState('Room 101');
  const [formCredits, setCredits] = useState(4);
  const [formColor, setColor] = useState('#3B82F6');

  // Form State for Adding Faculty
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('+1 (555) 000-0000');
  const [teacherDept, setTeacherDept] = useState<SchoolDepartment>('Primary');
  const [teacherDesignation, setTeacherDesignation] = useState('Class Teacher & Subject Specialist');

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchDept = activeDeptTab === 'all' || c.department === activeDeptTab;
      const matchSearch = searchQuery
        ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchDept && matchSearch;
    });
  }, [courses, activeDeptTab, searchQuery]);

  // Statistics
  const primaryCoursesCount = courses.filter((c) => c.department === 'Primary').length;
  const jhsCoursesCount = courses.filter((c) => c.department === 'JHS').length;
  const shsCoursesCount = courses.filter((c) => c.department === 'SHS').length;
  const primaryTeachersCount = faculty.filter((f) => f.department === 'Primary').length;
  const jhsTeachersCount = faculty.filter((f) => f.department === 'JHS').length;
  const shsTeachersCount = faculty.filter((f) => f.department === 'SHS').length;

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setName('');
    setCode('');
    setDept('Primary');
    setGradeLevel('Primary 5');
    setPrimaryTeacherId(faculty[0]?.id || '');
    setTypedNewTeacherName('');
    setIsTypingNewTeacher(false);
    setCoTeachers([]);
    setRoom('Primary Block Rm 5A');
    setCredits(4);
    setColor('#3B82F6');
    setIsAddCourseModalOpen(true);
  };

  const handleOpenEditModal = (c: Course) => {
    setEditingCourse(c);
    setName(c.name);
    setCode(c.code);
    setDept(c.department);
    setGradeLevel(c.gradeLevel);
    setPrimaryTeacherId(c.facultyId);
    setTypedNewTeacherName('');
    setIsTypingNewTeacher(false);
    setCoTeachers(c.coTeachers || []);
    setRoom(c.room);
    setCredits(c.credits);
    setColor(c.color || '#3B82F6');
    setIsAddCourseModalOpen(true);
  };

  const handleAddCoTeacher = () => {
    if (coTeacherInput.trim() && !formCoTeachers.includes(coTeacherInput.trim())) {
      setCoTeachers([...formCoTeachers, coTeacherInput.trim()]);
      setCoTeacherInput('');
    }
  };

  const handleRemoveCoTeacher = (tName: string) => {
    setCoTeachers(formCoTeachers.filter((t) => t !== tName));
  };

  const handleSaveCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let finalFacultyId = formPrimaryTeacherId;
    let finalFacultyName = '';

    // If user typed in a new teacher directly
    if (isTypingNewTeacher && typedNewTeacherName.trim()) {
      const createdFaculty = addFaculty({
        name: typedNewTeacherName.trim(),
        email: `${typedNewTeacherName.toLowerCase().replace(/\s+/g, '.')}@gabbybru.edu`,
        phone: '+1 (555) 123-4567',
        department: formDept,
        designation: `${formDept} Subject Teacher`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        courseIds: [],
        workloadHours: 18,
        officeHours: 'Mon - Fri 08:30 - 15:00',
        status: 'active',
      });
      finalFacultyId = createdFaculty.id;
      finalFacultyName = createdFaculty.name;
    } else {
      const selectedFac = faculty.find((f) => f.id === formPrimaryTeacherId);
      finalFacultyName = selectedFac ? selectedFac.name : 'Unassigned';
    }

    const deptPrefix = formDept === 'Primary' ? 'PRI' : formDept === 'JHS' ? 'JHS' : 'SHS';
    const generatedCode = formCode.trim() || `${deptPrefix}-${formName.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        name: formName.trim(),
        code: generatedCode,
        department: formDept,
        gradeLevel: formGradeLevel,
        facultyId: finalFacultyId,
        facultyName: finalFacultyName,
        coTeachers: formCoTeachers,
        room: formRoom,
        credits: Number(formCredits),
        color: formColor,
      });
    } else {
      addCourse({
        name: formName.trim(),
        code: generatedCode,
        department: formDept,
        gradeLevel: formGradeLevel,
        facultyId: finalFacultyId,
        facultyName: finalFacultyName,
        coTeachers: formCoTeachers,
        room: formRoom,
        credits: Number(formCredits),
        color: formColor,
      });
    }

    setIsAddCourseModalOpen(false);
  };

  const handleSaveTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    addFaculty({
      name: teacherName.trim(),
      email: teacherEmail.trim() || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@gabbybru.edu`,
      phone: teacherPhone.trim(),
      department: teacherDept,
      designation: teacherDesignation.trim(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      courseIds: [],
      workloadHours: 20,
      officeHours: 'Mon - Fri 08:00 - 15:30',
      status: 'active',
    });

    setIsAddTeacherModalOpen(false);
    setTeacherName('');
    setTeacherEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Subject & Faculty Management
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  Primary, JHS &amp; SHS Curriculum
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Administrator control to create subjects, assign primary teachers, and configure co-teachers for Primary, Junior High School (JHS), and Senior High School (SHS).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Type In New Subject</span>
            </button>

            <button
              onClick={() => setIsAddTeacherModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Teacher</span>
            </button>
          </div>
        </div>

        {/* Department Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveDeptTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeDeptTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Subjects ({courses.length})
            </button>

            <button
              onClick={() => setActiveDeptTab('Primary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'Primary'
                  ? 'bg-white text-indigo-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Primary</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {primaryCoursesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveDeptTab('JHS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'JHS'
                  ? 'bg-white text-indigo-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>JHS</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {jhsCoursesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveDeptTab('SHS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDeptTab === 'SHS'
                  ? 'bg-white text-purple-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Senior High (SHS)</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {shsCoursesCount}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Staff: <span className="font-bold text-slate-800">{primaryTeachersCount} Primary</span> · <span className="font-bold text-slate-800">{jhsTeachersCount} JHS</span> · <span className="font-bold text-slate-800">{shsTeachersCount} SHS</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Subjects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{primaryCoursesCount} Subjects</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{primaryTeachersCount} Primary Faculty</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">JHS Subjects</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{jhsCoursesCount} Subjects</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{jhsTeachersCount} JHS Faculty</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200/60 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">SHS Subjects</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{shsCoursesCount} Subjects</div>
          <div className="text-[10px] text-purple-600 mt-0.5">{shsTeachersCount} Senior Tutors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Teaching Staff</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{faculty.length} Teachers</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{courses.length} Total Subjects Active</div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        c.department === 'Primary'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : c.department === 'JHS'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {c.department}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{c.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{c.name}</h3>
                </div>

                {currentRole === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Subject & Teachers"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCourse(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Class & Room details */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800">{c.gradeLevel}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {c.room}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{c.credits} Periods/wk</span>
              </div>

              {/* Lead Teacher & Co-Teachers */}
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Teacher</span>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{c.facultyName}</span>
                  </div>
                </div>

                {c.coTeachers && c.coTeachers.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Co-Teachers Teaching It
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.coTeachers.map((ct, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {ct}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Active in Timetable
              </span>
              <button
                onClick={() => handleOpenEditModal(c)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Reassign Teacher →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Type in Subject & Teachers */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingCourse ? 'Edit Subject & Teacher Assignment' : 'Type In New Subject & Teachers'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourseSubmit} className="space-y-4 mt-4 text-xs">
              {/* Department Level Segmented Control */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Faculty Level / Department
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setDept('Primary');
                      if (!formGradeLevel.startsWith('Primary')) setGradeLevel('Primary 5');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-md transition-all ${
                      formDept === 'Primary'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Primary (P1-P6)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDept('JHS');
                      if (!formGradeLevel.startsWith('JHS')) setGradeLevel('JHS 2');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-md transition-all ${
                      formDept === 'JHS'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Junior High (JHS 1-3)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDept('SHS');
                      if (!formGradeLevel.startsWith('SHS')) setGradeLevel('SHS 2');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-md transition-all ${
                      formDept === 'SHS'
                        ? 'bg-white text-purple-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Senior High (SHS 1-3)
                  </button>
                </div>
              </div>

              {/* Subject Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Subject / Course Name (Type in)
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formDept === 'Primary'
                      ? 'e.g. Primary Integrated Science & Nature'
                      : formDept === 'JHS'
                      ? 'e.g. JHS Basic Design & Technology (BDT)'
                      : 'e.g. SHS Elective Mathematics & Calculus'
                  }
                  value={formName}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PRI-SCI-5 / JHS-BDT-2 / SHS-ELEC-MTH"
                    value={formCode}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Class / Grade Level
                  </label>
                  <select
                    value={formGradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    {formDept === 'Primary' ? (
                      <>
                        <option value="Primary 1">Primary 1</option>
                        <option value="Primary 2">Primary 2</option>
                        <option value="Primary 3">Primary 3</option>
                        <option value="Primary 4">Primary 4</option>
                        <option value="Primary 5">Primary 5</option>
                        <option value="Primary 6">Primary 6</option>
                      </>
                    ) : formDept === 'JHS' ? (
                      <>
                        <option value="JHS 1">JHS 1 (Basic 7)</option>
                        <option value="JHS 2">JHS 2 (Basic 8)</option>
                        <option value="JHS 3">JHS 3 (Basic 9)</option>
                      </>
                    ) : (
                      <>
                        <option value="SHS 1">SHS 1 (Year 10 / Form 1)</option>
                        <option value="SHS 2">SHS 2 (Year 11 / Form 2)</option>
                        <option value="SHS 3">SHS 3 (Year 12 / WASSCE Candidate)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Lead Teacher (Select or Type New) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Lead Teacher Teaching This Subject
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTypingNewTeacher(!isTypingNewTeacher)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {isTypingNewTeacher ? '← Select Existing Teacher' : '+ Type In New Teacher Directly'}
                  </button>
                </div>

                {isTypingNewTeacher ? (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Type teacher full name (e.g. Mr. Emmanuel K. Mensah)..."
                      value={typedNewTeacherName}
                      onChange={(e) => setTypedNewTeacherName(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Will be automatically registered to {formDept} teaching faculty at Gabbybru Company Ltd.
                    </span>
                  </div>
                ) : (
                  <select
                    value={formPrimaryTeacherId}
                    onChange={(e) => setPrimaryTeacherId(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {faculty
                      .filter((f) => f.department === formDept)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} — ({fac.department} - {fac.designation})
                        </option>
                      ))}
                    {faculty
                      .filter((f) => f.department !== formDept)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} — (Cross-Department: {fac.department})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Co-Teachers / Assistant Teachers */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Additional Co-Teachers (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type co-teacher name..."
                    value={coTeacherInput}
                    onChange={(e) => setCoTeacherInput(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddCoTeacher}
                    className="px-3 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {formCoTeachers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formCoTeachers.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoTeacher(t)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Primary Rm 5A / Science Lab"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Periods / Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formCredits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  {editingCourse ? 'Save Changes' : 'Create & Assign Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Register Teacher */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Register New Teacher</h3>
              </div>
              <button
                onClick={() => setIsAddTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacherSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Teacher Name (Type in)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Kwame Boateng"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Faculty Department
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherDept('Primary');
                      setTeacherDesignation('Primary Class Teacher & Specialist');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                      teacherDept === 'Primary'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Primary Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherDept('JHS');
                      setTeacherDesignation('JHS Subject Specialist');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                      teacherDept === 'JHS'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    JHS Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherDept('SHS');
                      setTeacherDesignation('Senior High School (SHS) Tutor');
                    }}
                    className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                      teacherDept === 'SHS'
                        ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    SHS Faculty
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={teacherDesignation}
                  onChange={(e) => setTeacherDesignation(e.target.value)}
                  placeholder="e.g. Class 5 Teacher / Science Specialist"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="name@gabbybru.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  Save & Register Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
