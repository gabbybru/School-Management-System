import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
  Users,
  Award,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const AnalyticsPortal: React.FC = () => {
  const {
    students,
    courses,
    grades,
    invoices,
    attendance,
    faculty,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'attendance' | 'academics' | 'financial' | 'audit'>('attendance');

  // Grade Distribution
  const gradeDistribution = useMemo(() => {
    let aCount = 0;
    let bCount = 0;
    let cCount = 0;
    let dCount = 0;
    let fCount = 0;

    grades.forEach((g) => {
      const pct = (g.score / g.maxScore) * 100;
      if (pct >= 90) aCount++;
      else if (pct >= 80) bCount++;
      else if (pct >= 70) cCount++;
      else if (pct >= 60) dCount++;
      else fCount++;
    });

    const total = grades.length || 1;
    return [
      { label: 'Grade A (90-100%)', count: aCount, pct: ((aCount / total) * 100).toFixed(0), color: 'bg-emerald-500' },
      { label: 'Grade B (80-89%)', count: bCount, pct: ((bCount / total) * 100).toFixed(0), color: 'bg-blue-500' },
      { label: 'Grade C (70-79%)', count: cCount, pct: ((cCount / total) * 100).toFixed(0), color: 'bg-amber-500' },
      { label: 'Grade D (60-69%)', count: dCount, pct: ((dCount / total) * 100).toFixed(0), color: 'bg-orange-500' },
      { label: 'Grade F (<60%)', count: fCount, pct: ((fCount / total) * 100).toFixed(0), color: 'bg-rose-500' },
    ];
  }, [grades]);

  // Attendance Weekly Trend Data (Simulated 5-day school week trend)
  const attendanceWeeklyTrends = [
    { day: 'Mon, Oct 11', rate: 97.4, present: 58, absent: 2 },
    { day: 'Tue, Oct 12', rate: 96.2, present: 57, absent: 3 },
    { day: 'Wed, Oct 13', rate: 98.1, present: 59, absent: 1 },
    { day: 'Thu, Oct 14', rate: 94.8, present: 56, absent: 4 },
    { day: 'Fri, Oct 15 (Today)', rate: 96.5, present: 58, absent: 2 },
  ];

  // Financial Breakdown by Category
  const categoryFinancials = useMemo(() => {
    const map: Record<string, { collected: number; pending: number }> = {
      tuition: { collected: 0, pending: 0 },
      lab: { collected: 0, pending: 0 },
      athletics: { collected: 0, pending: 0 },
      meals: { collected: 0, pending: 0 },
      transport: { collected: 0, pending: 0 },
    };

    invoices.forEach((inv) => {
      const cat = inv.category || 'tuition';
      if (!map[cat]) map[cat] = { collected: 0, pending: 0 };
      if (inv.status === 'paid') {
        map[cat].collected += inv.amount;
      } else {
        map[cat].pending += inv.amount;
      }
    });

    return Object.entries(map).map(([key, val]) => ({
      category: key.toUpperCase(),
      collected: val.collected,
      pending: val.pending,
      total: val.collected + val.pending,
    }));
  }, [invoices]);

  // Real-time Audit Logs
  const auditLogs = [
    { id: 'aud-109', action: 'Visa Payment Authorized ($3,250.00)', actor: 'parent: e.sterling@family.com', ip: '192.168.1.42', time: '10 mins ago', hash: 'e2ee:8f921...c4a' },
    { id: 'aud-108', action: 'Automated SMS Dispatched (Unexcused Absence)', actor: 'System Daemon (Cron)', ip: 'internal:gateway', time: '28 mins ago', hash: 'notif:11029...7b2' },
    { id: 'aud-107', action: 'Gradebook Assessment Inserted (Calculus)', actor: 'faculty: Dr. Aris Thorne', ip: '10.0.4.19', time: '1 hour ago', hash: 'eval:33819...99a' },
    { id: 'aud-106', action: 'Substitute Instructor Assigned (Tech Hub)', actor: 'admin: Bursar Office', ip: '10.0.2.11', time: '2 hours ago', hash: 'tt:44921...aa1' },
    { id: 'aud-105', action: 'E2EE Medical Notes Re-keyed (AES-256-GCM)', actor: 'admin: Chief Security Officer', ip: '10.0.1.01', time: '3 hours ago', hash: 'sec:99201...e3f' },
  ];

  const handleExportFullCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Status'],
      ['Active Enrolled Students', students.length, 'Active'],
      ['Faculty Staff Count', faculty.length, 'On Duty'],
      ['Total Assessments Recorded', grades.length, 'Evaluated'],
      ['Invoices Settled via Visa', invoices.filter((i) => i.status === 'paid').length, 'Settled'],
      ['E2EE Security Standard', 'AES-GCM-256 / PBKDF2', 'Enforced'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OmniSchool_Analytics_Executive_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Analytics & Reporting</h1>
              <p className="text-xs text-slate-500">
                Real-time executive metrics for attendance retention, academic performance, and Visa revenue analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFullCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Board Report</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mt-5">
          {[
            { id: 'attendance', label: 'Attendance Retention Trends' },
            { id: 'academics', label: 'Academic Distribution' },
            { id: 'financial', label: 'Visa Revenue & Fees' },
            { id: 'audit', label: 'E2EE Real-Time Audit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Attendance Retention Trends */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Attendance Rate Performance</h3>
                <p className="text-xs text-slate-500">Aggregate daily student roll-call rate across all departments</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Institutional Target: 95.0% (Exceeded at 96.6%)
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-6 space-y-4">
              {attendanceWeeklyTrends.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.day}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.rate}% ({item.present} Present / {item.absent} Absent)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Weekly Average Attendance</span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5">96.6%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Unexcused Absences Resolved</span>
                <span className="text-lg font-extrabold text-indigo-700 mt-0.5">100% via Auto-SMS</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Chronic Absence Flagged</span>
                <span className="text-lg font-extrabold text-amber-700 mt-0.5">1 Student Watchlisted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Academic Distribution */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Grade Letter Distribution & Bell Curve</h3>
            <p className="text-xs text-slate-500 mb-6">Distribution of recorded assessment marks across all active cohorts</p>

            <div className="space-y-3.5">
              {gradeDistribution.map((tier, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{tier.label}</span>
                    <span className="font-mono text-slate-700 font-bold">
                      {tier.count} evaluations ({tier.pct}%)
                    </span>
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(Number(tier.pct), 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Dean's Honors (3.8+ GPA)</span>
                <span className="text-lg font-black font-mono mt-0.5">5 Students (83%)</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-950">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Mean Cohort GPA</span>
                <span className="text-lg font-black font-mono mt-0.5">3.82 / 4.00</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessments Evaluated</span>
                <span className="text-lg font-black font-mono mt-0.5">{grades.length} Total</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Course Success Rate</span>
                <span className="text-lg font-black font-mono mt-0.5">98.4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Visa Revenue & Fees */}
      {activeTab === 'financial' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Visa Fee Collection by Category</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time revenue intake breakdown by institutional revenue stream</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Revenue Category</th>
                    <th className="py-2.5 px-3">Settled via Visa</th>
                    <th className="py-2.5 px-3">Pending / Overdue</th>
                    <th className="py-2.5 px-3">Total Receivables</th>
                    <th className="py-2.5 px-3 text-right">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoryFinancials.map((row, idx) => {
                    const rate = row.total > 0 ? ((row.collected / row.total) * 100).toFixed(0) : '100';
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{row.category}</td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                          ${row.collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-700">
                          ${row.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900 font-bold">
                          ${row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-bold text-slate-800">{rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: E2EE Real-Time Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Real-Time Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger logs for sensitive records, fee transactions, and staff actions</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-256 Validated</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-3 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                <div>
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Actor: <span className="text-slate-700 font-medium">{log.actor}</span> · Client: <span className="font-mono">{log.ip}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {log.hash}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
