import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { School } from '../../types';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SchoolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolManagerModal: React.FC<SchoolManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    schools,
    activeSchoolId,
    setActiveSchoolId,
    addSchool,
    currentRole,
  } = useSchool();

  const [isAddMode, setIsAddMode] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Accra');
  const [headmasterName, setHeadmasterName] = useState('Mr. Patrick Mensah');
  const [phone, setPhone] = useState('+1 (555) 888-9900');
  const [email, setEmail] = useState('');
  const [studentCount, setStudentCount] = useState(250);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schoolCode = code.trim().toUpperCase() || `GB-${name.slice(0, 3).toUpperCase()}`;

    addSchool({
      name: name.trim(),
      code: schoolCode,
      location: location.trim() || 'Main Campus Road',
      city: city.trim(),
      headmasterId: `fac-${Date.now()}`,
      headmasterName: headmasterName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${schoolCode.toLowerCase()}@gabbybru.edu`,
      establishedYear: 2026,
      totalStudents: Number(studentCount),
    });

    setIsAddMode(false);
    setName('');
    setCode('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 animate-in fade-in zoom-in-95 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gabbybru Company Ltd · Multi-School Management
              </h3>
              <p className="text-xs text-slate-500">
                Switch active school campus or register a new Primary &amp; JHS institution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Network Campuses ({schools.length})
          </span>
          {currentRole === 'admin' && !isAddMode && (
            <button
              onClick={() => setIsAddMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New School</span>
            </button>
          )}
        </div>

        {/* Add School Form */}
        {isAddMode ? (
          <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Register New School Campus</h4>
              <button
                type="button"
                onClick={() => setIsAddMode(false)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  School Name (Type in)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gabbybru Model Basic School - Cantonments"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  School Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. GB-MOD-ACC"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full font-mono uppercase bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Campus Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Ring Road East, Cantonments"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Designated Headmaster Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Patrick Mensah"
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Contact Phone (for Registrar)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full font-mono bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddMode(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
              >
                Save &amp; Activate School
              </button>
            </div>
          </form>
        ) : null}

        {/* Existing Schools List */}
        <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
          {schools.map((school) => {
            const isActive = school.id === activeSchoolId;
            return (
              <div
                key={school.id}
                className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {school.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{school.name}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{school.location}, {school.city}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Headmaster: <strong className="text-slate-700">{school.headmasterName}</strong></span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{school.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{school.email}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {isActive ? (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <Check className="w-4 h-4" />
                      <span>Active Campus</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSchoolId(school.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      Switch to this School
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
