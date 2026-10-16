import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeeInvoice, FeeCategory, SubscriptionPlan } from '../../types';
import { VisaCheckoutModal } from './VisaCheckoutModal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Receipt,
  Download,
  ShieldCheck,
  Zap,
  Repeat,
  Printer,
  Sparkles,
} from 'lucide-react';

export const BillingDashboard: React.FC = () => {
  const {
    invoices,
    students,
    subscriptions,
    createCustomInvoice,
    currentRole,
    searchQuery,
  } = useSchool();

  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<FeeInvoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  // New Invoice Form
  const [formStudentId, setFormStudentId] = useState(students[0]?.id || '');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<FeeCategory>('tuition');
  const [formAmount, setFormAmount] = useState<number>(1250);
  const [formDueDate, setFormDueDate] = useState('2026-11-01');
  const [formTerm, setFormTerm] = useState('Fall 2026');

  // Subscriptions Active Plan State
  const [activePlanId, setActivePlanId] = useState('sub-monthly');
  const [isAutopayEnabled, setIsAutopayEnabled] = useState(true);

  // Financial KPIs
  const kpis = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'paid') collected += inv.amount;
      else if (inv.status === 'pending') pending += inv.amount;
      else if (inv.status === 'overdue') overdue += inv.amount;
    });

    const totalBilled = collected + pending + overdue;
    const collectionRate = totalBilled > 0 ? ((collected / totalBilled) * 100).toFixed(1) : '100';

    return { collected, pending, overdue, totalBilled, collectionRate };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || inv.category === categoryFilter;
      const matchSearch = searchQuery
        ? inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchStatus && matchCategory && matchSearch;
    });
  }, [invoices, statusFilter, categoryFilter, searchQuery]);

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === formStudentId);
    if (!student || !formDescription || formAmount <= 0) return;

    createCustomInvoice({
      studentId: student.id,
      studentName: student.name,
      gradeLevel: student.gradeLevel,
      description: formDescription,
      category: formCategory,
      amount: Number(formAmount),
      dueDate: formDueDate,
      term: formTerm,
    });

    setIsNewInvoiceModalOpen(false);
    setFormDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Visa Fee Billing & Subscriptions</h1>
              <p className="text-xs text-slate-500">
                Official school tuition payments with Visa 3-D Secure, automated recurring term plans, and encrypted tokenization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentRole === 'admin' && (
              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Fee Invoice</span>
              </button>
            )}
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5">
              <span className="font-black italic text-blue-800">VISA</span>
              <span>Merchant Verified</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Payment Status
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'pending', 'paid', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Fee Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 capitalize"
            >
              <option value="all">All Fee Categories</option>
              <option value="tuition">Academic Tuition</option>
              <option value="lab">Science & STEM Lab</option>
              <option value="athletics">Athletics & Sports Pass</option>
              <option value="meals">Cafeteria Meal Plan</option>
              <option value="transport">Bus & Transportation</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 w-full flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Bursar Visa Gateway:</span>
              <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live 3DS Authorized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Collected via Visa</span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
            ${kpis.collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">{kpis.collectionRate}% of total receivables</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/60 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Invoices</span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-1">
            ${kpis.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Awaiting parent authorization</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/60 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Past Due / Overdue</span>
          <div className="text-2xl font-black text-rose-800 font-mono mt-1">
            ${kpis.overdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5">Automated SMS notices active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Term Billings</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ${kpis.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fiscal Term 2026/27</div>
        </div>
      </div>

      {/* Recurring Subscription Plans Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Recurring Tuition Subscription Plans</h2>
            </div>
            <p className="text-xs text-slate-500">
              Parents can enroll in automated recurring fee deduction with tokenized Visa autopay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Visa Recurring Autopay:</span>
            <button
              onClick={() => setIsAutopayEnabled(!isAutopayEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAutopayEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAutopayEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-blue-900">
              {isAutopayEnabled ? 'Active' : 'Off'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {subscriptions.map((plan) => {
            const isSelected = activePlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-5 border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {plan.billingCycle} Billing
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-1">{plan.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 font-mono">${plan.amount}</span>
                  <span className="text-xs text-slate-500">
                    {plan.billingCycle === 'monthly' ? '/ mo (10x)' : plan.billingCycle === 'termly' ? '/ term (3x)' : '/ year'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{plan.description}</p>

                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setActivePlanId(plan.id)}
                  className={`w-full mt-5 py-2 px-3 text-xs font-bold rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSelected ? '✓ Current Enrolled Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* School Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">School Fee Invoices & Payment Ledger</h2>
          <span className="text-xs text-slate-500 font-mono">{filteredInvoices.length} invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Description / Fee Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{inv.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.studentName}</div>
                      <div className="text-[11px] text-slate-400">{inv.gradeLevel}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{inv.description}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                        {inv.category} · {inv.term}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{inv.dueDate}</td>
                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Paid via Visa {inv.paymentDetails?.last4 ? `(••${inv.paymentDetails.last4})` : ''}
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Overdue Notice
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Payment
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveInvoiceForPayment(inv)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs shadow-blue-700/20 transition-all"
                        >
                          <span className="font-black italic text-xs">VISA</span>
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visa Payment Modal */}
      {activeInvoiceForPayment && (
        <VisaCheckoutModal
          invoice={activeInvoiceForPayment}
          onClose={() => setActiveInvoiceForPayment(null)}
          onSuccess={() => {}}
        />
      )}

      {/* Official Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Official Visa Bursar Voucher</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 my-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-black italic text-blue-900 text-base">VISA</span>
                <span className="font-mono text-slate-500 font-semibold">{selectedReceipt.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Item</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.description}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Reference</span>
                  <span className="font-mono text-slate-800">{selectedReceipt.paymentDetails?.transactionId || 'TXN-VISA-998241'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorization Code</span>
                  <span className="font-mono text-slate-800">{selectedReceipt.paymentDetails?.authCode || 'AUTH-882194'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Card Used</span>
                  <span className="font-mono text-slate-800">Visa ending in {selectedReceipt.paymentDetails?.last4 || '4242'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                  <span className="font-mono text-slate-800">{selectedReceipt.paymentDetails?.paidAt || '2026-10-01 10:15'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Amount Paid</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ${selectedReceipt.amount.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Custom Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Issue Institutional Fee Invoice</h3>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 mt-4">
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
                  Invoice Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring 2027 Advanced Science Lab Materials"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FeeCategory)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 capitalize"
                  >
                    <option value="tuition">Tuition</option>
                    <option value="lab">Science Lab</option>
                    <option value="athletics">Athletics</option>
                    <option value="meals">Meals</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Academic Term
                  </label>
                  <input
                    type="text"
                    required
                    value={formTerm}
                    onChange={(e) => setFormTerm(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200/60 rounded-lg text-[11px] text-blue-900">
                ⚡ Automated Trigger: Upon issuing, an electronic invoice and Visa payment link will automatically be dispatched to the parent email & SMS.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Issue & Dispatch Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
