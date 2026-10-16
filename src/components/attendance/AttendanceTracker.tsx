import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Send,
  Calendar,
  Filter,
  Check,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const {
    students,
    courses,
    attendance,
    recordAttendance,
    bulkMarkAttendance,
    searchQuery,
    currentRole,
  } = useSchool();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [noteModalStudentId, setNoteModalStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Students enrolled in this course
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => {
      const isEnrolled = s.enrolledCourseIds.includes(currentCourse?.id);
      const matchesSearch = searchQuery
        ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return isEnrolled && matchesSearch;
    });
  }, [students, currentCourse, searchQuery]);

  // Map of studentId -> AttendanceRecord for current selection
  const currentAttendanceMap = useMemo(() => {
    const map = new Map<string, (typeof attendance)[0]>();
    attendance.forEach((rec) => {
      if (
        rec.courseId === selectedCourseId &&
        rec.date === selectedDate &&
        rec.period === selectedPeriod
      ) {
        map.set(rec.studentId, rec);
      }
    });
    return map;
  }, [attendance, selectedCourseId, selectedDate, selectedPeriod]);

  // Statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let tardy = 0;
    let excused = 0;
    let unrecorded = 0;

    enrolledStudents.forEach((stu) => {
      const rec = currentAttendanceMap.get(stu.id);
      if (!rec) {
        unrecorded++;
      } else if (rec.status === 'present') {
        present++;
      } else if (rec.status === 'absent') {
        absent++;
      } else if (rec.status === 'tardy') {
        tardy++;
      } else if (rec.status === 'excused') {
        excused++;
      }
    });

    const total = enrolledStudents.length;
    const rate = total > 0 ? (((present + excused * 0.8) / total) * 100).toFixed(1) : '100';

    return { total, present, absent, tardy, excused, unrecorded, rate };
  }, [enrolledStudents, currentAttendanceMap]);

  // Filtered student list by status
  const displayedStudents = useMemo(() => {
    if (statusFilter === 'all') return enrolledStudents;
    return enrolledStudents.filter((stu) => {
      const rec = currentAttendanceMap.get(stu.id);
      const currentStatus = rec ? rec.status : 'unrecorded';
      return currentStatus === statusFilter;
    });
  }, [enrolledStudents, currentAttendanceMap, statusFilter]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    recordAttendance(studentId, selectedCourseId, status, selectedDate, selectedPeriod);
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Course', 'Date', 'Period', 'Status', 'Parent Notified'];
    const rows = enrolledStudents.map((s) => {
      const rec = currentAttendanceMap.get(s.id);
      return [
        s.rollNumber,
        `"${s.name}"`,
        `"${currentCourse?.name}"`,
        selectedDate,
        `Period ${selectedPeriod}`,
        rec ? rec.status.toUpperCase() : 'NOT MARKED',
        rec?.notificationSent ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${currentCourse?.code}_${selectedDate}_P${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Attendance System</h1>
                <p className="text-xs text-slate-500">
                  Real-time roll call tracking with automated parent SMS/Push alerting on unexcused absences.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => bulkMarkAttendance(selectedCourseId, selectedDate, selectedPeriod, 'present')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Course, Date, Period, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Course / Class
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <optgroup label="── Primary School Subjects ──">
                {courses
                  .filter((c) => c.department === 'Primary')
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.gradeLevel})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="── Junior High School (JHS) Subjects ──">
                {courses
                  .filter((c) => c.department === 'JHS')
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.gradeLevel})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Class Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                <option key={period} value={period}>
                  Period {period} ({String(7 + period).padStart(2, '0')}:30 - {String(8 + period).padStart(2, '0')}:20)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Status Filter
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'present', 'absent', 'tardy'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors ${
                    statusFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.rate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Session Target: 95%</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active roster</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Present</span>
          <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{stats.present}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">In classroom</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200/60 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Absent</span>
          <div className="text-xl font-extrabold text-rose-800 mt-0.5">{stats.absent}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Auto-notified</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Tardy / Late</span>
          <div className="text-xl font-extrabold text-amber-800 mt-0.5">{stats.tardy}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Late arrival</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200/60 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Excused</span>
          <div className="text-xl font-extrabold text-blue-800 mt-0.5">{stats.excused}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Medical / Slip</div>
        </div>
      </div>

      {/* Roster & Interactive Roll-Call Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Class Roster: {currentCourse?.name}
            </h2>
            <p className="text-xs text-slate-500">
              Instructor: {currentCourse?.facultyName} · Room: {currentCourse?.room} · Date: {selectedDate} (P{selectedPeriod})
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{displayedStudents.length}</span> students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll ID</th>
                <th className="py-3 px-4">Historical Rate</th>
                <th className="py-3 px-4">Parent Contact</th>
                <th className="py-3 px-4">Mark Attendance Status</th>
                <th className="py-3 px-4 text-right">Automated Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedStudents.map((student) => {
                const record = currentAttendanceMap.get(student.id);
                const currentStatus = record ? record.status : 'present';
                const isChronic = student.attendanceRate < 90;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500">{student.gradeLevel} - Section {student.section}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {student.rollNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isChronic ? 'text-rose-600' : 'text-slate-900'}`}>
                          {student.attendanceRate}%
                        </span>
                        {isChronic && (
                          <span
                            title="Attendance is under 90% target threshold"
                            className="inline-flex items-center text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                          >
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            Watchlist
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{student.parentName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{student.parentPhone}</div>
                    </td>

                    <td className="py-3 px-4">
                      {/* Segmented Control for Attendance Status */}
                      <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg gap-1 border border-slate-200/60">
                        <button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'tardy')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentStatus === 'tardy'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          Tardy
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'excused')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {record?.notificationSent ? (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SMS Sent {record.notifiedAt}</span>
                        </div>
                      ) : currentStatus === 'absent' ? (
                        <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                          Queued for SMS dispatch
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Regular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
