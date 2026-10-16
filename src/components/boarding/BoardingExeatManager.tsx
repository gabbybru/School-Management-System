import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { BoardingStudent, ExeatPass, ExeatReason, ExeatStatus } from '../../types';
import {
  Compass,
  Home,
  Clock,
  Phone,
  ShieldCheck,
  Send,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  Volume2,
  Calendar,
  Search,
  Filter,
  Check,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

export const BoardingExeatManager: React.FC = () => {
  const {
    activeSchool,
    boardingStudents,
    addBoardingStudent,
    exeatPasses,
    issueExeatPass,
    updateExeatStatus,
    currentRole,
    students,
    faculty,
  } = useSchool();

  const { speak, triggerHaptic } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'passes' | 'boarders' | 'issue'>('passes');
  const [statusFilter, setStatusFilter] = useState<'all' | ExeatStatus>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Exeat Form State
  const [selectedBoarderId, setSelectedBoarderId] = useState<string>(boardingStudents[0]?.id || '');
  const [reason, setReason] = useState<ExeatReason>('weekend_home');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16).replace('T', ' ')
  );
  const [expectedReturnTime, setExpectedReturnTime] = useState(
    new Date(Date.now() + 172800000).toISOString().slice(0, 16).replace('T', ' ')
  );
  const [parentContact, setParentContact] = useState('');
  const [notes, setNotes] = useState('');

  // New Boarding Student Form State
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || '');
  const [dormitoryHouse, setDormitoryHouse] = useState('Aggrey Hall (House 1)');
  const [roomNumber, setRoomNumber] = useState('Room B-105');
  const [bedNumber, setBedNumber] = useState('Bed #3');
  const [houseMasterName, setHouseMasterName] = useState('Mr. Kwesi Boateng');
  const [guardianPhone, setGuardianPhone] = useState('+1 (555) 345-9871');

  // Sync parent phone when selected boarder changes
  const selectedBoarder = useMemo(() => {
    return boardingStudents.find((b) => b.id === selectedBoarderId) || boardingStudents[0];
  }, [boardingStudents, selectedBoarderId]);

  const handleBoarderSelect = (bId: string) => {
    setSelectedBoarderId(bId);
    const b = boardingStudents.find((student) => student.id === bId);
    if (b) {
      setParentContact(b.guardianPhone);
    }
  };

  const handleIssueExeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoarder || !destination.trim()) return;

    triggerHaptic('success');
    issueExeatPass({
      boardingStudentId: selectedBoarder.id,
      studentName: selectedBoarder.studentName,
      rollNumber: selectedBoarder.rollNumber,
      dormitoryHouse: selectedBoarder.dormitoryHouse,
      reason,
      destinationAddress: destination.trim(),
      parentContact: parentContact || selectedBoarder.guardianPhone,
      departureTime,
      expectedReturnTime,
      status: 'approved',
      approvedBy: activeSchool.headmasterName || 'Headmaster Office',
      approvedByRole: currentRole === 'headmaster' ? 'headmaster' : currentRole === 'assistant_head' ? 'assistant_head' : 'faculty',
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: notes.trim(),
    });

    speak(`Exeat pass approved for ${selectedBoarder.studentName}. Parent SMS alert sent to ${parentContact || selectedBoarder.guardianPhone}.`, true);
    setActiveTab('passes');
    setDestination('');
    setNotes('');
  };

  const handleAddBoardingStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === newStudentId);
    if (!st) return;

    triggerHaptic('success');
    addBoardingStudent({
      studentId: st.id,
      studentName: st.name,
      rollNumber: st.rollNumber,
      department: st.department,
      gradeLevel: st.gradeLevel,
      dormitoryHouse,
      roomNumber,
      bedNumber,
      houseMasterName,
      guardianPhone: guardianPhone || st.parentPhone,
      status: 'in_residence',
      avatar: st.avatar,
    });

    speak(`Boarding student ${st.name} successfully registered in ${dormitoryHouse}.`, true);
    setActiveTab('boarders');
  };

  // Audio Readout of Exeat Slip for Blind or Low Vision Users
  const handleReadExeatAloud = (pass: ExeatPass) => {
    triggerHaptic('click');
    const narrative = `Official Exeat Pass for ${pass.studentName}, student roll number ${pass.rollNumber}, resident of ${pass.dormitoryHouse}. Reason for leave: ${pass.reason.replace('_', ' ')}. Destination: ${pass.destinationAddress}. Departure scheduled: ${pass.departureTime}. Expected return time: ${pass.expectedReturnTime}. Status: ${pass.status}. Approved by: ${pass.approvedBy}. Official Gate Pass Token: ${pass.gatePassToken}. Parent SMS was dispatched to ${pass.parentContact}.`;
    speak(narrative, true);
  };

  const filteredPasses = useMemo(() => {
    return exeatPasses.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchQuery =
        p.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.rollNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.gatePassToken.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.destinationAddress.toLowerCase().includes(searchFilter.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [exeatPasses, statusFilter, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Boarding School &amp; Exeat Pass Command
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                  SHS, JHS &amp; Primary Hostels
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Teachers, Housemasters &amp; Headmasters: manage boarding students, issue official exeat slips to go home, dispatch instant parent SMS alerts, and audit departures with verified timestamps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('click');
                setActiveTab('issue');
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Exeat Pass</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mt-5 overflow-x-auto">
          {[
            { id: 'passes', label: `Active Exeat Slips (${exeatPasses.length})` },
            { id: 'boarders', label: `Boarding Students (${boardingStudents.length})` },
            { id: 'issue', label: 'Issue Exeat & Send Parent SMS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('click');
                setActiveTab(tab.id as any);
              }}
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

      {/* TAB 1: EXEAT PASSES REGISTRY */}
      {activeTab === 'passes' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search student, pass token, or house..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(['all', 'active', 'approved', 'returned'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                    statusFilter === st
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Card Layout for Mobile / Table for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPasses.map((pass) => (
              <div
                key={pass.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{pass.studentName}</h3>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {pass.rollNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {pass.dormitoryHouse}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      pass.status === 'active'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : pass.status === 'returned'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {pass.status.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reason:</span>
                    <span className="font-semibold capitalize">{pass.reason.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-right truncate max-w-[200px]">
                      {pass.destinationAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Departure:</span>
                    <span className="font-mono">{pass.departureTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expected Return:</span>
                    <span className="font-mono text-amber-700 font-bold">{pass.expectedReturnTime}</span>
                  </div>
                  {pass.actualReturnTime && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>Returned On:</span>
                      <span className="font-mono">{pass.actualReturnTime}</span>
                    </div>
                  )}
                </div>

                {/* Gate Token & Parent SMS Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      Token: {pass.gatePassToken}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Parent SMS Dispatched
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audio Readout for Blind Users */}
                    <button
                      onClick={() => handleReadExeatAloud(pass)}
                      aria-label={`Listen to exeat slip details for ${pass.studentName}`}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-md border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      title="Read exeat slip aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {pass.status !== 'returned' && (
                      <button
                        onClick={() => {
                          triggerHaptic('success');
                          updateExeatStatus(pass.id, 'returned');
                          speak(`${pass.studentName} confirmed returned to dormitory.`, true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold"
                      >
                        Confirm Return
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  Approved by {pass.approvedBy} ({pass.approvedByRole}) · {pass.approvedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BOARDING STUDENTS ROSTER */}
      {activeTab === 'boarders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {boardingStudents.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.avatar}
                    alt={`Photograph of ${b.studentName}`}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{b.studentName}</h3>
                    <span className="text-[10px] font-mono text-slate-500 block">{b.rollNumber}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        b.status === 'in_residence'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">House &amp; Dorm</span>
                    <span className="font-semibold text-slate-800">{b.dormitoryHouse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{b.roomNumber}</span>
                    <span className="font-bold">{b.bedNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Guardian Emergency Phone</span>
                    <span className="font-mono text-slate-800">{b.guardianPhone}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Verified: {b.updatedAt.slice(0, 10)}</span>
                  <button
                    onClick={() => {
                      setSelectedBoarderId(b.id);
                      setParentContact(b.guardianPhone);
                      setActiveTab('issue');
                    }}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    Issue Exeat &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Boarder Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Enroll Student into Boarding / Hostel Residence
            </h3>
            <p className="text-xs text-slate-500">
              Teachers and Housemasters can enroll students into dormitories with designated rooms, beds, and guardian emergency contact details.
            </p>

            <form onSubmit={handleAddBoardingStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Student
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => {
                    setNewStudentId(e.target.value);
                    const s = students.find((item) => item.id === e.target.value);
                    if (s) setGuardianPhone(s.parentPhone);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department} · {s.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dormitory / Hostel House
                </label>
                <select
                  value={dormitoryHouse}
                  onChange={(e) => setDormitoryHouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="Aggrey Hall (House 1)">Aggrey Hall (House 1)</option>
                  <option value="Yaa Asantewaa Hall (House 2)">Yaa Asantewaa Hall (House 2)</option>
                  <option value="Guggisberg House (Junior Wing)">Guggisberg House (Junior Wing)</option>
                  <option value="Nkrumah Hostel (Senior Wing)">Nkrumah Hostel (Senior Wing)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Room &amp; Bed Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Room B-102"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    required
                  />
                  <input
                    type="text"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="Bed #4"
                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Guardian Phone (SMS Alerts)
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Housemaster in Charge
                </label>
                <input
                  type="text"
                  value={houseMasterName}
                  onChange={(e) => setHouseMasterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Register Boarder &amp; Assign Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUE EXEAT & DISPATCH PARENT SMS */}
      {activeTab === 'issue' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Issue Official Exeat Pass to Go Home
            </h2>
            <p className="text-xs text-slate-500">
              Authorizes boarding student departure. An automated SMS notification with verified gate token is sent to the parent's phone.
            </p>
          </div>

          <form onSubmit={handleIssueExeat} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Boarding Student
              </label>
              <select
                value={selectedBoarderId}
                onChange={(e) => handleBoarderSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800"
              >
                {boardingStudents.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.studentName} ({b.rollNumber}) · {b.dormitoryHouse} · [{b.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Exeat
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
                >
                  <option value="weekend_home">Weekend Home Visit</option>
                  <option value="medical">Medical / Hospital Appointment</option>
                  <option value="family_emergency">Family Emergency</option>
                  <option value="academic_competition">Academic Competition / Olympiad</option>
                  <option value="official">Official School Representation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Phone (Instant SMS Recipient)
                </label>
                <input
                  type="tel"
                  value={parentContact || selectedBoarder?.guardianPhone || ''}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Address / City
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. 24 Roman Ridge Road, Accra / Family Residence"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Departure Date &amp; Time
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Return Date &amp; Time
                </label>
                <input
                  type="text"
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Housemaster / Teacher Remarks &amp; Clearance Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any medical note, escort details, or permission conditions..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
              />
            </div>

            {/* Live SMS Preview */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-[11px] text-amber-900">
                <span className="font-bold block">Live Parent SMS Dispatch:</span>
                Parent {parentContact || selectedBoarder?.guardianPhone} will receive an instant text notification with exeat departure time and security gate token.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('passes')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Issue Exeat &amp; Dispatch SMS</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
