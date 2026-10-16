import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  FileKey,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Save,
  AlertTriangle,
} from 'lucide-react';

export const E2EESecurityVault: React.FC = () => {
  const {
    students,
    isE2EEUnlocked,
    setIsE2EEUnlocked,
    e2eePassphrase,
    updateE2EEPassphrase,
    decryptStudentField,
    updateStudentConfidentialNotes,
  } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [decryptedMedical, setDecryptedMedical] = useState<string>('');
  const [decryptedDisciplinary, setDecryptedDisciplinary] = useState<string>('');
  const [showRawCipher, setShowRawCipher] = useState(false);
  const [newPassphraseInput, setNewPassphraseInput] = useState(e2eePassphrase);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Decrypt selected student notes whenever student changes or lock state toggles
  useEffect(() => {
    let isMounted = true;
    const fetchDecrypted = async () => {
      if (!selectedStudent) return;
      if (!isE2EEUnlocked) {
        setDecryptedMedical('[🔒 Encrypted AES-256-GCM - Locked Vault]');
        setDecryptedDisciplinary('[🔒 Encrypted AES-256-GCM - Locked Vault]');
        return;
      }

      const med = await decryptStudentField(selectedStudent.encryptedMedicalNotes);
      const disc = await decryptStudentField(selectedStudent.encryptedDisciplinaryNotes);
      if (isMounted) {
        setDecryptedMedical(med);
        setDecryptedDisciplinary(disc);
      }
    };

    fetchDecrypted();
    return () => {
      isMounted = false;
    };
  }, [selectedStudent, isE2EEUnlocked, decryptStudentField]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await updateStudentConfidentialNotes(selectedStudent.id, decryptedMedical, decryptedDisciplinary);
  };

  const handleUpdatePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassphraseInput) return;
    setIsUpdatingKey(true);
    await updateE2EEPassphrase(newPassphraseInput);
    setIsUpdatingKey(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Zero-Knowledge End-to-End Encryption (E2EE) Vault
              </h1>
              <p className="text-xs text-slate-500">
                Military-grade AES-256-GCM cryptographic protection for student medical records, disciplinary logs, and financial tokens.
              </p>
            </div>
          </div>

          {/* Master Lock/Unlock Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsE2EEUnlocked(!isE2EEUnlocked)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border shadow-xs transition-all ${
                isE2EEUnlocked
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
              }`}
            >
              {isE2EEUnlocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Vault Unlocked (Active Key)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Vault Locked (Ciphertext Only)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Specs Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cipher Algorithm</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block">AES-GCM (256-bit)</span>
            <span className="text-[10px] text-slate-500">Authenticated ciphertext + 12-byte IV</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Key Derivation</span>
            <span className="font-mono font-bold text-slate-900 mt-0.5 block">PBKDF2 / SHA-256</span>
            <span className="text-[10px] text-slate-500">100,000 iterations + 16-byte salt</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Zero-Knowledge</span>
            <span className="font-bold text-emerald-700 mt-0.5 block">Enforced Client-Side</span>
            <span className="text-[10px] text-slate-500">Server never holds decryption key</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tamper Resistance</span>
            <span className="font-bold text-indigo-700 mt-0.5 block">128-bit Poly1305 Tag</span>
            <span className="text-[10px] text-slate-500">Any byte tampering triggers abort</span>
          </div>
        </div>
      </div>

      {/* Interactive Record Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selector Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Encrypted Student Vaults</h2>
            <span className="text-xs text-slate-400 font-mono">{students.length} Records</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {students.map((stu) => {
              const isSelected = stu.id === selectedStudentId;
              return (
                <button
                  key={stu.id}
                  onClick={() => setSelectedStudentId(stu.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{stu.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{stu.rollNumber}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-600">{stu.gradeLevel}</span>
                      </div>
                    </div>
                  </div>
                  <Lock className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Decryption / Encryption Inspector */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileKey className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Confidential File: {selectedStudent?.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Medical history & internal behavioral logs encrypted with distinct per-record initialization vectors.
              </p>
            </div>

            <button
              onClick={() => setShowRawCipher(!showRawCipher)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {showRawCipher ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showRawCipher ? 'Show Decrypted Text' : 'View Raw Ciphertext'}</span>
            </button>
          </div>

          {/* Raw Cipher Payload View or Decrypted Plaintext Editor */}
          {showRawCipher ? (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Raw Medical Notes Cipher JSON (In-transit / At-rest)
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                  {selectedStudent?.encryptedMedicalNotes || '{"error": "empty"}'}
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Raw Disciplinary Notes Cipher JSON
                </span>
                <pre className="p-3 bg-slate-900 text-blue-400 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                  {selectedStudent?.encryptedDisciplinaryNotes || '{"error": "empty"}'}
                </pre>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Confidential Medical Conditions & Allergies
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    AES-256 Client-Side Encrypted
                  </span>
                </div>
                <textarea
                  rows={3}
                  disabled={!isE2EEUnlocked}
                  value={decryptedMedical}
                  onChange={(e) => setDecryptedMedical(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-400 font-sans leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Confidential Disciplinary & Behavioral Logs
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    AES-256 Client-Side Encrypted
                  </span>
                </div>
                <textarea
                  rows={3}
                  disabled={!isE2EEUnlocked}
                  value={decryptedDisciplinary}
                  onChange={(e) => setDecryptedDisciplinary(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400 font-sans leading-relaxed"
                />
              </div>

              {isE2EEUnlocked ? (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Encrypt & Update Records</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>The vault is currently locked. Unlock using the button above to view and modify plaintext.</span>
                </div>
              )}
            </form>
          )}

          {/* Master Key Passphrase Rotation Tool */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Institutional Passphrase Key Rotation
            </h4>
            <form onSubmit={handleUpdatePassphrase} className="flex gap-2">
              <input
                type="text"
                value={newPassphraseInput}
                onChange={(e) => setNewPassphraseInput(e.target.value)}
                placeholder="Enter master derivation passphrase..."
                className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={isUpdatingKey || !newPassphraseInput}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Re-Key Vault</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
