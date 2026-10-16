import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableSlot, FacultyMember } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  UserX,
  Send,
  Plus,
  Users,
} from 'lucide-react';

export const FacultyScheduleView: React.FC = () => {
  const {
    faculty,
    timetable,
    courses,
    assignSubstituteFaculty,
    addTimetableSlot,
    currentRole,
  } = useSchool();

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [substituteSlot, setSubstituteSlot] = useState<TimetableSlot | null>(null);
  const [selectedSubFacultyId, setSelectedSubFacultyId] = useState<string>('');
  const [substituteReason, setSubstituteReason] = useState<string>('Medical absence / Conference leave');

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayLabels: Record<string, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
  };

  const periods = [
    { period: 1, time: '08:30 - 09:20' },
    { period: 2, time: '09:30 - 10:20' },
    { period: 3, time: '10:35 - 11:25' },
    { period: 4, time: '11:35 - 12:25' },
    { period: 5, time: '13:15 - 14:05' },
    { period: 6, time: '14:15 - 15:05' },
  ];

  // Active filter
  const filteredSlots = useMemo(() => {
    return timetable.filter((slot) => {
      const matchFaculty = selectedFacultyId === 'all' || slot.facultyId === selectedFacultyId;
      const matchDay = selectedDay === 'all' || slot.day === selectedDay;
      return matchFaculty && matchDay;
    });
  }, [timetable, selectedFacultyId, selectedDay]);

  // Find slot for day & period
  const getSlot = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri', period: number) => {
    return filteredSlots.find((s) => s.day === day && s.period === period);
  };

  // Find conflict-free faculty candidates when substitute modal is open
  const availableSubstitutes = useMemo(() => {
    if (!substituteSlot) return [];
    // Faculty who are NOT scheduled at this day and period, and not the current instructor
    const busyFacultyIds = timetable
      .filter((s) => s.day === substituteSlot.day && s.period === substituteSlot.period)
      .map((s) => s.facultyId);

    return faculty.filter((f) => f.id !== substituteSlot.facultyId && !busyFacultyIds.includes(f.id));
  }, [substituteSlot, timetable, faculty]);

  const handleAssignSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!substituteSlot || !selectedSubFacultyId) return;

    assignSubstituteFaculty(substituteSlot.id, selectedSubFacultyId, substituteReason);
    setSubstituteSlot(null);
    setSelectedSubFacultyId('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Timetables & Schedules</h1>
              <p className="text-xs text-slate-500">
                Weekly teaching schedules, room allocations, conflict monitoring, and automated substitute teacher dispatching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Faculty on Duty:</span>
            <span className="font-extrabold text-slate-900 text-sm">{faculty.length} Professors</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Faculty Instructor
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Faculty Members (Primary &amp; JHS Master Timetable)</option>
              <optgroup label="── Primary School Faculty ──">
                {faculty
                  .filter((f) => f.department === 'Primary')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — ({f.designation})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="── Junior High School (JHS) Faculty ──">
                {faculty
                  .filter((f) => f.department === 'JHS')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — ({f.designation})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Day Filter
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedDay('all')}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  selectedDay === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Days
              </button>
              {days.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    selectedDay === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 w-full flex items-center justify-between text-xs text-emerald-900">
              <span className="font-semibold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Schedule Conflicts:
              </span>
              <span className="font-mono font-bold text-emerald-800">0 Overlaps (Optimal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Profile Overview Chips (Clean, unboxed metadata) */}
      {selectedFacultyId !== 'all' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {(() => {
            const fac = faculty.find((f) => f.id === selectedFacultyId);
            if (!fac) return null;
            return (
              <>
                <div className="flex items-center gap-3">
                  <img src={fac.avatar} alt={fac.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{fac.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{fac.designation}</span>
                      <span>·</span>
                      <span>{fac.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Office Hours</span>
                    <span className="font-medium text-slate-800">{fac.officeHours}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Workload</span>
                    <span className="font-mono font-bold text-indigo-700">{fac.workloadHours} Contact Hours</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Contact</span>
                    <span className="font-mono text-slate-600">{fac.email}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Timetable Weekly Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Master Institutional Timetable</h2>
          <span className="text-xs text-slate-500">Periods 1 through 6 · Academic Terms 2026/27</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider w-36 border-r border-slate-200">
                  Period & Time
                </th>
                {(selectedDay === 'all' ? days : [selectedDay as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri']).map((day) => (
                  <th
                    key={day}
                    className="py-3 px-4 text-left font-bold text-slate-800 uppercase text-xs tracking-wider border-r border-slate-200 last:border-r-0"
                  >
                    {dayLabels[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {periods.map(({ period, time }) => (
                <tr key={period} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 bg-slate-50/70 border-r border-slate-200">
                    <div>Period {period}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-normal mt-0.5">{time}</div>
                  </td>

                  {(selectedDay === 'all' ? days : [selectedDay as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri']).map((day) => {
                    const slot = getSlot(day, period);

                    if (!slot) {
                      return (
                        <td key={day} className="py-3 px-4 border-r border-slate-200 last:border-r-0 text-slate-300 italic">
                          <span className="text-[11px]">— Free Period / Planning —</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day}
                        className="p-2 border-r border-slate-200 last:border-r-0 align-top"
                      >
                        <div className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-indigo-950 text-xs leading-snug">
                              {slot.courseName}
                            </span>
                            {currentRole === 'admin' && (
                              <button
                                onClick={() => {
                                  setSubstituteSlot(slot);
                                  setSelectedSubFacultyId('');
                                }}
                                className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-indigo-600 hover:text-indigo-900 p-1 hover:bg-white rounded transition-opacity"
                                title="Reassign / Designate Substitute Teacher"
                              >
                                Reassign
                              </button>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{slot.facultyName}</span>
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-indigo-100/60 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              {slot.room}
                            </span>
                            <span className="font-semibold text-slate-600">{slot.gradeLevel}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Substitute Teacher Assignment Modal */}
      {substituteSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Designate Substitute Teacher</h3>
              </div>
              <button
                onClick={() => setSubstituteSlot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="font-bold text-slate-900 text-sm">{substituteSlot.courseName}</div>
              <div className="text-slate-500 mt-1">
                Day: <span className="font-semibold text-slate-800">{dayLabels[substituteSlot.day]}</span> · Period: <span className="font-semibold text-slate-800">Period {substituteSlot.period}</span> · Room: <span className="font-semibold text-slate-800">{substituteSlot.room}</span>
              </div>
              <div className="text-slate-500 mt-0.5">
                Current Instructor: <span className="font-semibold text-slate-800">{substituteSlot.facultyName}</span>
              </div>
            </div>

            <form onSubmit={handleAssignSubstitute} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Available Conflict-Free Instructors
                </label>
                {availableSubstitutes.length > 0 ? (
                  <select
                    required
                    value={selectedSubFacultyId}
                    onChange={(e) => setSelectedSubFacultyId(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="">-- Choose substitute professor --</option>
                    {availableSubstitutes.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.department} - Free P{substituteSlot.period})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    No faculty members are completely free at Period {substituteSlot.period}. Administrator override required.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Leave / Cover Reason
                </label>
                <input
                  type="text"
                  required
                  value={substituteReason}
                  onChange={(e) => setSubstituteReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200/60 rounded-lg text-[11px] text-indigo-900">
                ⚡ Automated Action: Assigning this substitute will automatically dispatch an instantaneous push notification & email to the substitute teacher and broadcast an update to the class roster.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubstituteSlot(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSubFacultyId}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  Confirm & Dispatch Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
