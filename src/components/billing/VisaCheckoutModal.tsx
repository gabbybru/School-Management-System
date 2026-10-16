import React, { useState } from 'react';
import { FeeInvoice } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Printer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface VisaCheckoutModalProps {
  invoice: FeeInvoice;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VisaCheckoutModal: React.FC<VisaCheckoutModalProps> = ({ invoice, onClose, onSuccess }) => {
  const { payInvoiceWithVisa } = useSchool();

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('ELEANOR STERLING');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('883');
  const [saveCardForAutopay, setSaveCardForAutopay] = useState(true);

  const [step, setStep] = useState<'input' | 'processing' | '3ds_challenge' | 'receipt'>('input');
  const [otpCode, setOtpCode] = useState('749210');
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptData, setReceiptData] = useState<{ transactionId: string; authCode: string } | null>(null);

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setExpiry(raw);
    }
  };

  const isLuhnValid = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let n = parseInt(clean.substring(i, i + 1), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (!cleanCard.startsWith('4')) {
      setErrorMsg('Please enter a valid Visa card (starts with 4).');
      return;
    }

    if (cleanCard.length !== 16) {
      setErrorMsg('Card number must be 16 digits.');
      return;
    }

    if (!isLuhnValid(cleanCard)) {
      setErrorMsg('Invalid card checksum (Luhn check failed).');
      return;
    }

    // Advance to 3-D Secure / Verified by Visa challenge
    setStep('3ds_challenge');
  };

  const handleVerify3DS = async () => {
    setStep('processing');
    try {
      const res = await payInvoiceWithVisa(invoice.id, {
        cardNumber,
        cardHolder,
        expiry,
        cvv,
      });
      setReceiptData(res);
      setStep('receipt');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment authorization failed');
      setStep('input');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Visa Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-white rounded-md flex items-center justify-center shadow-xs">
              <span className="font-black italic tracking-tighter text-blue-900 text-base">VISA</span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Visa Secure School Fee Gateway</h3>
              <p className="text-[11px] text-blue-200">AES-256-GCM Tokenized · Verified by Visa (3-D Secure 2.2)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Step: Input Card Details */}
        {step === 'input' && (
          <div className="p-6 space-y-6">
            {/* Invoice Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student & Fee Category</span>
                <span className="font-bold text-slate-900 text-sm">{invoice.studentName}</span>
                <span className="text-xs text-slate-500 block">{invoice.description}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Due</span>
                <span className="text-xl font-black text-slate-950 font-mono">
                  ${invoice.amount.toFixed(2)}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold block">USD Official Tuition</span>
              </div>
            </div>

            {/* Visual Realistic Visa Card */}
            <div className="relative mx-auto w-full max-w-sm h-48 rounded-2xl p-5 text-white shadow-xl bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-800 flex flex-col justify-between overflow-hidden ring-1 ring-white/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-7 rounded bg-amber-300/90 border border-amber-200/50 flex items-center justify-center shadow-xs">
                    <div className="w-5 h-4 border border-amber-600/60 rounded-xs" />
                  </div>
                  <span className="text-[10px] tracking-wider uppercase opacity-80 font-mono">Gabbybru Pay</span>
                </div>
                <div className="font-black italic tracking-tighter text-white text-xl">VISA</div>
              </div>

              <div className="relative z-10">
                <div className="font-mono text-lg tracking-widest font-semibold drop-shadow-md">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>

              <div className="flex items-end justify-between relative z-10 text-xs font-mono">
                <div>
                  <div className="text-[9px] uppercase tracking-wider opacity-70">Cardholder</div>
                  <div className="font-bold uppercase tracking-wide truncate max-w-[180px]">
                    {cardHolder || 'FULL NAME'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider opacity-70">Expires</div>
                  <div className="font-bold">{expiry || 'MM/YY'}</div>
                </div>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Visa Input Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Visa Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <div className="absolute right-3 top-2.5 text-[11px] font-black italic text-blue-800">
                    VISA
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. ELEANOR STERLING"
                  className="w-full text-xs font-medium uppercase bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autopay"
                  checked={saveCardForAutopay}
                  onChange={(e) => setSaveCardForAutopay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="autopay" className="text-xs text-slate-600">
                  Save card encrypted for automated recurring term subscriptions (Autopay)
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize ${invoice.amount.toFixed(2)} with Visa</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step: Verified by Visa 3-D Secure Challenge */}
        {step === '3ds_challenge' && (
          <div className="p-6 space-y-5">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Verified by Visa · 3-D Secure 2.2</h4>
              <p className="text-xs text-slate-500 mt-1">
                Additional security verification required by your card issuing bank for educational merchant transaction.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="font-semibold text-slate-800">Gabbybru Company Ltd Bursar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Amount:</span>
                <span className="font-bold text-slate-900 font-mono">${invoice.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card ending:</span>
                <span className="font-mono font-semibold text-slate-800">•••• {cardNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authentication Method:</span>
                <span className="text-blue-700 font-medium">Bank SMS One-Time Passcode</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Enter 6-Digit One-Time Security Passcode (Demo OTP)
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full text-center text-lg font-mono tracking-widest font-bold bg-white border border-slate-300 rounded-lg py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="block text-center text-[10px] text-slate-400 mt-1">
                Simulated code sent to parent phone · Pre-filled for demo verification
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ← Back
              </button>
              <button
                onClick={handleVerify3DS}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20"
              >
                <span>Verify & Complete Transaction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing Indicator */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Contacting Visa Global Network...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Securing TLS 1.3 handshake, tokenizing sensitive credentials with AES-256-GCM, and generating digital receipt.
            </p>
          </div>
        )}

        {/* Step: Official Electronic Receipt */}
        {step === 'receipt' && receiptData && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 ring-4 ring-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Visa Payment Authorized!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Official institutional receipt generated and dispatched to parent email.
              </p>
            </div>

            {/* Official Electronic Receipt Box */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="font-black italic text-blue-900 text-base">VISA</div>
                  <div className="text-[10px] text-slate-400">Electronic Bursar Voucher</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">{receiptData.transactionId}</div>
                  <div className="text-[10px] text-slate-400">Auth: {receiptData.authCode}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                  <span className="font-semibold text-slate-900">{invoice.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Item</span>
                  <span className="font-semibold text-slate-900">{invoice.description}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
                  <span className="font-mono text-slate-900">Visa ending in {cardNumber.slice(-4)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                  <span className="font-mono text-slate-900">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase">Total Settled</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  ${invoice.amount.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
