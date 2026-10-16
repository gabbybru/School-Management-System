import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NotificationType, NotificationChannel, UserRole } from '../../types';
import {
  Radio,
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Filter,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    sendManualNotification,
    clearAllNotifications,
    students,
    faculty,
    searchQuery,
  } = useSchool();

  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Simulation Form
  const [formRecipientType, setFormRecipientType] = useState<UserRole>('parent');
  const [formRecipientName, setFormRecipientName] = useState(students[0]?.parentName || 'Parent Guardian');
  const [formContact, setFormContact] = useState(students[0]?.parentPhone || '+1 (555) 912-3401');
  const [formType, setFormType] = useState<NotificationType>('attendance');
  const [formChannel, setFormChannel] = useState<NotificationChannel>('sms');
  const [formTitle, setFormTitle] = useState('Immediate Attendance Roll-Call Notice');
  const [formMessage, setFormMessage] = useState('Alexander Sterling was marked Absent from Class Period 1.');

  // Automated Trigger Rules Configuration
  const [ruleAbsenceSMS, setRuleAbsenceSMS] = useState(true);
  const [ruleLowGradeEmail, setRuleLowGradeEmail] = useState(true);
  const [ruleFeeDueAlert, setRuleFeeDueAlert] = useState(true);
  const [ruleSubstitutePush, setRuleSubstitutePush] = useState(true);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchChannel = channelFilter === 'all' || notif.channel === channelFilter;
      const matchType = typeFilter === 'all' || notif.type === typeFilter;
      const matchSearch = searchQuery
        ? notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchChannel && matchType && matchSearch;
    });
  }, [notifications, channelFilter, typeFilter, searchQuery]);

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendManualNotification({
      recipientName: formRecipientName,
      recipientRole: formRecipientType,
      recipientContact: formContact,
      type: formType,
      title: formTitle,
      message: formMessage,
      channel: formChannel,
      priority: formType === 'attendance' ? 'high' : 'normal',
    });

    setIsSimulateModalOpen(false);
  };

  const getChannelIcon = (ch: NotificationChannel) => {
    switch (ch) {
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-blue-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case 'push':
        return <Bell className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Automated Notification Engine</h1>
              <p className="text-xs text-slate-500">
                Rule-triggered automated SMS, push notifications, and email alerts for student attendance events, grade warnings, and Visa receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Simulate Custom Alert</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Dispatch Channel
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'sms', 'email', 'push'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md uppercase transition-colors ${
                    channelFilter === ch ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Alert Trigger Category
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 capitalize"
            >
              <option value="all">All Notification Types</option>
              <option value="attendance">Student Absence / Tardy Alerts</option>
              <option value="academic">Low Grade / Academic Warnings</option>
              <option value="fee_due">Tuition & Fee Overdue Notices</option>
              <option value="payment_receipt">Visa Payment Receipts</option>
              <option value="announcement">Faculty & Administrative Broadcasts</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 w-full flex items-center justify-between text-xs text-emerald-900">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Delivery Success Rate:
              </span>
              <span className="font-mono font-bold text-emerald-800">99.8% Delivered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Rule Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Active Automated Trigger Rules</h2>
        <p className="text-xs text-slate-500 mb-4">
          Automated event dispatchers continuously evaluate roll-call sheets, grade submissions, and billing cycles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900 block">Absence Roll-Call Alert</span>
              <span className="text-[11px] text-slate-500">Automated SMS to parents within 10 min of absence</span>
            </div>
            <input
              type="checkbox"
              checked={ruleAbsenceSMS}
              onChange={(e) => setRuleAbsenceSMS(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-1"
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900 block">At-Risk Grade Alert</span>
              <span className="text-[11px] text-slate-500">Automated email when assessment score &lt; 70%</span>
            </div>
            <input
              type="checkbox"
              checked={ruleLowGradeEmail}
              onChange={(e) => setRuleLowGradeEmail(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-1"
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900 block">Visa Payment Receipt</span>
              <span className="text-[11px] text-slate-500">Instant PDF receipt + SMS reference number</span>
            </div>
            <input
              type="checkbox"
              checked={ruleFeeDueAlert}
              onChange={(e) => setRuleFeeDueAlert(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-1"
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-900 block">Faculty Substitute Cover</span>
              <span className="text-[11px] text-slate-500">Push notification when reassigned to a class</span>
            </div>
            <input
              type="checkbox"
              checked={ruleSubstitutePush}
              onChange={(e) => setRuleSubstitutePush(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Notification Activity Stream Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Notification Logs & Dispatch Audit</h2>
          <span className="text-xs text-slate-500 font-mono">{filteredNotifications.length} logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Type / Event</th>
                <th className="py-3 px-4">Subject & Message</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 uppercase font-mono text-[10px] font-bold">
                      {getChannelIcon(notif.channel)}
                      <span>{notif.channel}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{notif.recipientName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{notif.recipientContact}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {notif.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-md">
                    <div className="font-bold text-slate-900">{notif.title}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {notif.timestamp}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulate Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Simulate Custom Alert Dispatch</h3>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Recipient Role
                  </label>
                  <select
                    value={formRecipientType}
                    onChange={(e) => setFormRecipientType(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 capitalize"
                  >
                    <option value="parent">Parent</option>
                    <option value="admin">Administrator</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Channel
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as NotificationChannel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 uppercase"
                  >
                    <option value="sms">SMS Text</option>
                    <option value="email">Email Notice</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formRecipientName}
                    onChange={(e) => setFormRecipientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Contact Phone / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Subject / Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Send Simulated Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
