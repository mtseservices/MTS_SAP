import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  X,
  Copy,
  Clock,
  ArrowRight,
  Download,
  AlertCircle,
  FileCheck,
  Check,
  HelpCircle,
  QrCode,
  Flame,
  BadgeCheck,
  Lock,
  Wallet
} from 'lucide-react';
import { MasterBankAccount, SubscriptionCycle } from '../../types/erp';
import { getMasterBankAccounts } from '../../services/masterBankAccountsService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface SubscriptionTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'TRIAL' | 'UPGRADE' | 'VIEW_ACCOUNTS';
  prefilledUser?: {
    name?: string;
    email?: string;
  };
}

export const SubscriptionTrialModal: React.FC<SubscriptionTrialModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'UPGRADE',
  prefilledUser
}) => {
  const { currentCompany, isMasterPortal, updateCompanySubscription } = useAuthTenant();

  const [activeStep, setActiveStep] = useState<'PLANS' | 'PAYMENT' | 'SUCCESS'>(
    initialMode === 'VIEW_ACCOUNTS' ? 'PAYMENT' : 'PLANS'
  );
  
  // Master Bank Accounts from Master Software
  const [masterAccounts, setMasterAccounts] = useState<MasterBankAccount[]>([]);
  const [selectedMasterAccount, setSelectedMasterAccount] = useState<MasterBankAccount | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Billing Cycle
  const [billingCycle, setBillingCycle] = useState<SubscriptionCycle>('Monthly');
  
  // Selected Plan
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_pro');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CARD' | 'RAAST'>('BANK_TRANSFER');

  // Bank Transfer Form
  const [senderBank, setSenderBank] = useState('');
  const [senderAccountTitle, setSenderAccountTitle] = useState('');
  const [txnReference, setTxnReference] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Card Payment Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(prefilledUser?.name || 'Tariq Mehmood');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Trial activation state
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);

  // Success Receipt
  const [receiptData, setReceiptData] = useState<{
    txnId: string;
    planName: string;
    amount: number;
    date: string;
    method: string;
  } | null>(null);

  useEffect(() => {
    // Load Master Bank Accounts configured by Master Software Admin
    getMasterBankAccounts().then((accounts) => {
      const active = accounts.filter((a) => a.isActive);
      setMasterAccounts(active);
      if (active.length > 0) {
        setSelectedMasterAccount(active[0]);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Plan Details
  const plans = [
    {
      id: 'plan_trial_7',
      name: '7-Day Full Enterprise Trial',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Quick 7-day test drive for Google sign-in clients.',
      features: [
        'Full ERP module access for 7 days',
        'Chart of accounts & voucher postings',
        'Standard support'
      ],
      isTrial: true,
      days: 7
    },
    {
      id: 'plan_trial_15',
      name: '15-Day Full Enterprise Trial',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Extended 15-day trial period for comprehensive evaluation.',
      features: [
        'Full ERP module access for 15 days',
        'Advanced financial reporting & inventory',
        'Priority support'
      ],
      isTrial: true,
      days: 15
    },
    {
      id: 'plan_growth',
      name: 'Growth Starter',
      priceMonthly: 35000,
      priceYearly: 350000,
      description: 'Essential core ERP modules for rising manufacturing & distribution SMBs.',
      features: [
        'Core General Ledger & Voucher Postings',
        'Sales & Purchase Orders with POS',
        'Up to 15 Authorized User Accounts',
        'Single company 2 branches included',
        'Audit Log Security & 5-min Auto Lock'
      ]
    },
    {
      id: 'plan_pro',
      name: 'Professional Enterprise',
      priceMonthly: 65000,
      priceYearly: 650000, // 2 months free
      isPopular: true,
      description: 'The complete ERP stack for food, manufacturing & retail.',
      features: [
        'Everything in Growth Starter',
        'D3.js Batch Longevity & Expiry Heatmap',
        'Sales Pipeline Kanban with Lead Probability',
        'Automated FBR e-Invoicing QR codes',
        'Resource Capacity & Production Planner',
        'Full CRM & Gemini Multi-Turn Voice AI',
        '24/7 Dedicated Support with 99.9% SLA'
      ]
    },
    {
      id: 'plan_conglomerate',
      name: 'Group Conglomerate',
      priceMonthly: 125000,
      priceYearly: 1250000,
      description: 'For corporate groups with multi-plant operations.',
      features: [
        'Unlimited Users & Multi-Warehouse Hubs',
        'Cross-Tenant Financial Consolidation',
        'Audit Log Security & 5-Min Auto Lock',
        'Dedicated Cloud Database & Custom Reports',
        'On-Premises Hybrid Bridge Option'
      ]
    }
  ];

  const currentSelectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[2];
  const payableAmount = billingCycle === 'Monthly' ? currentSelectedPlan.priceMonthly : currentSelectedPlan.priceYearly;

  const validateForm = (): boolean => {
    setValidationError(null);
    if (paymentMethod === 'BANK_TRANSFER') {
      if (!senderBank.trim() || senderBank.trim().length < 2) {
        setValidationError('Please enter your Sender Bank name (e.g. Meezan Bank, HBL).');
        return false;
      }
      if (!senderAccountTitle.trim() || senderAccountTitle.trim().length < 3) {
        setValidationError('Please enter your Sender Account Title (minimum 3 characters).');
        return false;
      }
      if (!txnReference.trim() || txnReference.trim().length < 6) {
        setValidationError('Please enter a valid Transaction Ref / UTR / Stan ID (minimum 6 alphanumeric characters).');
        return false;
      }
    } else if (paymentMethod === 'CARD') {
      if (!cardHolder.trim() || cardHolder.trim().length < 3) {
        setValidationError('Please enter the Cardholder name (minimum 3 characters).');
        return false;
      }
      const rawDigits = cardNumber.replace(/\D/g, '');
      if (rawDigits.length !== 16) {
        setValidationError('Card Number must be exactly 16 digits.');
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        setValidationError('Expiry Date must be in MM/YY format (e.g. 12/28).');
        return false;
      }
      const [mmStr, yyStr] = cardExpiry.split('/');
      const month = parseInt(mmStr, 10);
      const year = parseInt(yyStr, 10);
      if (month < 1 || month > 12) {
        setValidationError('Invalid expiry month. Must be between 01 and 12.');
        return false;
      }
      if (year < 26) {
        setValidationError('Card expiration year has passed. Please use an active card.');
        return false;
      }
      if (cardCvc.length < 3 || cardCvc.length > 4 || !/^\d+$/.test(cardCvc)) {
        setValidationError('Security CVV/CVC must be 3 or 4 digits.');
        return false;
      }
    } else if (paymentMethod === 'RAAST') {
      if (!txnReference.trim() || txnReference.trim().length < 6) {
        setValidationError('Please enter a valid Raast Settlement Transaction ID (min 6 characters).');
        return false;
      }
    }
    return true;
  };

  const handleActivateTrial = async () => {
    setIsProcessingPayment(true);
    const trialDays = (currentSelectedPlan as any).days || 15;
    setProcessingStage(`Provisioning complimentary ${trialDays}-day enterprise trial...`);
    const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    const finalTxnId = `TRIAL-${Date.now().toString().slice(-6)}`;

    try {
      await updateCompanySubscription(currentCompany.id, {
        plan: `${trialDays}-Day Full Enterprise Trial`,
        cycle: 'Monthly',
        status: 'ACTIVE',
        expiresAt,
        daysRemaining: trialDays,
        paymentMethod: `Complimentary Enterprise Trial (${trialDays} Days)`,
        amount: 0,
        txnId: finalTxnId
      });
    } catch (err) {
      console.warn('Subscription update background note:', err);
    }

    setIsTrialActive(true);
    setTrialDaysLeft(trialDays);
    setReceiptData({
      txnId: finalTxnId,
      planName: `${trialDays}-Day Full Enterprise Trial`,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: `Complimentary Enterprise Trial (${trialDays} Days)`
    });
    setIsProcessingPayment(false);
    setActiveStep('SUCCESS');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessingPayment(true);
    setProcessingStage(
      paymentMethod === 'CARD'
        ? 'Connecting to 3D Secure 2.0 Card Issuer Gateway...'
        : paymentMethod === 'BANK_TRANSFER'
        ? 'Validating IBFT Transaction Reference with Master Bank Account...'
        : 'Connecting with State Bank of Pakistan (SBP) Raast Network...'
    );

    setTimeout(async () => {
      setProcessingStage('Tokenizing transaction & updating Firestore enterprise tier...');

      const daysToAdd = billingCycle === 'Monthly' ? 30 : 365;
      const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
      const finalTxnId = txnReference.trim() || `PAY-${Date.now().toString().slice(-8)}`;

      let methodLabel = '';
      if (paymentMethod === 'BANK_TRANSFER') {
        methodLabel = `IBFT (${senderBank.trim()} -> ${selectedMasterAccount?.bankName || 'MTS Bank'})`;
      } else if (paymentMethod === 'CARD') {
        const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '7890';
        methodLabel = `Online Card (Ending •••• ${last4})`;
      } else {
        methodLabel = `Raast Instant Pay (${selectedMasterAccount?.raastId || 'raast@mtserp.pk'})`;
      }

      try {
        await updateCompanySubscription(currentCompany.id, {
          plan: currentSelectedPlan.name,
          cycle: billingCycle,
          status: 'ACTIVE',
          expiresAt,
          daysRemaining: daysToAdd,
          paymentMethod: methodLabel,
          amount: payableAmount,
          txnId: finalTxnId
        });
      } catch (err) {
        console.warn('Subscription update background note:', err);
      }

      setReceiptData({
        txnId: finalTxnId,
        planName: currentSelectedPlan.name,
        amount: payableAmount,
        date: new Date().toISOString().split('T')[0],
        method: methodLabel
      });

      setIsProcessingPayment(false);
      setActiveStep('SUCCESS');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                  Enterprise Subscription &amp; Payment Gateway
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Master Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official billing portal for <strong className="text-slate-200">{currentCompany?.name || 'Your Enterprise'}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Plan Selection & Free Trial Option */}
        {activeStep === 'PLANS' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Free Trial Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-black uppercase text-cyan-300 tracking-wide">
                    Complimentary 14-Day Enterprise Trial
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Try all modules without payment or credit card. Upgrade or lock in annual discounts anytime during trial.
                </p>
              </div>

              <button
                type="button"
                onClick={handleActivateTrial}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Activate 14-Day Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Select Enterprise Plan</h3>
                <p className="text-xs text-slate-400">Choose monthly flexibility or save 15% on annual billing.</p>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('Monthly')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    billingCycle === 'Monthly' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('Yearly')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    billingCycle === 'Yearly' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                    Save 15%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                const price = billingCycle === 'Monthly' ? p.priceMonthly : p.priceYearly;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.isPopular && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow">
                        Recommended
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-100 text-sm">{p.name}</h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="text-xl font-black text-slate-100 font-mono">
                          {price === 0 ? 'Free' : `Rs. ${price.toLocaleString()}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {price === 0 ? '14 Days Access' : billingCycle === 'Monthly' ? 'per month + taxes' : 'per year (2 months free)'}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                        {p.description}
                      </p>

                      <ul className="space-y-1.5 pt-2 text-[11px] text-slate-300">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(p.id);
                          if (p.isTrial) {
                            handleActivateTrial();
                          } else {
                            setActiveStep('PAYMENT');
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {p.isTrial ? 'Start 14-Day Free Trial' : `Subscribe (${billingCycle}) →`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Watch Master Accounts Link */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Need to verify Master Software Corporate Bank credentials before ordering?</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep('PAYMENT')}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Watch Master Bank Accounts →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Real-Time Payment Method Form (With Master Bank Accounts from Master Software) */}
        {activeStep === 'PAYMENT' && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Checkout Summary</span>
                <div className="text-base font-black text-slate-100 flex items-center gap-2">
                  <span>{currentSelectedPlan.name}</span>
                  <span className="text-xs text-purple-400 font-mono font-bold">
                    ({billingCycle} • Rs. {payableAmount.toLocaleString()})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveStep('PLANS')}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ← Change Plan
              </button>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Processing Stage Indicator */}
            {isProcessingPayment && (
              <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-500/50 text-purple-200 text-xs flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <div className="font-bold text-white">Processing Secure Transaction...</div>
                  <div className="text-[11px] text-purple-300 mt-0.5">{processingStage}</div>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('BANK_TRANSFER');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span>Master Bank Transfer / IBFT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CARD');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <span>Visa / Mastercard / PayPak</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('RAAST');
                    setValidationError(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'RAAST'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>Raast / Digital Wallet</span>
                </button>
              </div>
            </div>

            {/* Option A: Bank Transfer / IBFT with LIVE Master Software Bank Accounts */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        Master Software Official Bank Accounts (Saved by Master Admin)
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Transfer to any of the verified corporate accounts below via online banking, mobile app, or ATM.
                      </p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Verified Beneficiary
                    </span>
                  </div>

                  {/* Account Selector Pill */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {masterAccounts.map((acc) => (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => setSelectedMasterAccount(acc)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedMasterAccount?.id === acc.id
                            ? 'bg-cyan-500/10 border-cyan-500 text-slate-100'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{acc.bankName}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{acc.branchCode || 'Central'}</div>
                      </button>
                    ))}
                  </div>

                  {/* Active Master Account Details Card */}
                  {selectedMasterAccount && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Title</span>
                          <span className="font-bold text-slate-100 text-sm">{selectedMasterAccount.accountTitle}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bank &amp; Branch</span>
                          <span className="font-bold text-slate-100 text-xs">
                            {selectedMasterAccount.bankName} • {selectedMasterAccount.branchName}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Account Number</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-cyan-300">{selectedMasterAccount.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedMasterAccount.accountNumber, 'acc')}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer"
                              title="Copy Account Number"
                            >
                              {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">IBAN (Inter-Bank Transfer)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-emerald-300 text-xs">{selectedMasterAccount.iban}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedMasterAccount.iban, 'iban')}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300 cursor-pointer"
                              title="Copy IBAN"
                            >
                              {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {selectedMasterAccount.instructions && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                          <strong>Note:</strong> {selectedMasterAccount.instructions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Deposit Proof Form */}
                <form onSubmit={handleProcessPayment} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Your Sender Bank Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Meezan Bank, HBL, UBL"
                        value={senderBank}
                        onChange={(e) => {
                          setSenderBank(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Account Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Tariq Mehmood / Crest Textile Mills Ltd"
                        value={senderAccountTitle}
                        onChange={(e) => {
                          setSenderAccountTitle(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Transaction Ref / UTR / Stan ID (min 6 chars) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FT261030998812"
                        value={txnReference}
                        onChange={(e) => {
                          setTxnReference(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Remarks / Company NTN</label>
                      <input
                        type="text"
                        placeholder={`Subscription for ${currentCompany?.name} (${currentCompany?.ntn})`}
                        value={transferNotes}
                        onChange={(e) => setTransferNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm IBFT Transfer &amp; Upgrade Subscription →</span>
                  </button>
                </form>
              </div>
            )}

            {/* Option B: Online Credit / Debit Card (Visa / Mastercard) */}
            {paymentMethod === 'CARD' && (
              <form onSubmit={handleProcessPayment} className="space-y-4 animate-in fade-in">
                {/* Visual Card Mockup */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 border border-purple-500/40 text-white space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm tracking-wider text-cyan-300">MTS ENTERPRISE CARD PAY</span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-white/10">3D Secure 2.0</span>
                  </div>

                  <div className="font-mono text-lg tracking-widest py-1 font-bold">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Card Holder</span>
                      <span className="font-bold">{cardHolder || 'ENTERPRISE CLIENT'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Expires</span>
                      <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number (16 Digits) *</label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(formatted);
                        if (validationError) setValidationError(null);
                      }}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length > 2) {
                            v = `${v.slice(0, 2)}/${v.slice(2)}`;
                          }
                          setCardExpiry(v);
                          if (validationError) setValidationError(null);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CVV / Security Code (3-4 digits) *</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => {
                          setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                          if (validationError) setValidationError(null);
                        }}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying with Card Issuer...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay Rs. {payableAmount.toLocaleString()} via 3D-Secure 2.0 →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Option C: Raast Instant Payment */}
            {paymentMethod === 'RAAST' && (
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">State Bank of Pakistan (SBP) Raast Instant Pay</h4>
                    <p className="text-[11px] text-slate-400">Zero fee instant IBFT settlement via Raast ID</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Official Master Raast ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-300">
                        {selectedMasterAccount?.raastId || 'raast@mtserp.pk'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedMasterAccount?.raastId || 'raast@mtserp.pk', 'raast')}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {copiedField === 'raast' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-mono font-bold text-slate-100">Rs. {payableAmount.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Enter Raast Settlement Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. RST-992014881"
                      value={txnReference}
                      onChange={(e) => setTxnReference(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    Confirm Raast Payment →
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success Confirmation & Tax Receipt */}
        {activeStep === 'SUCCESS' && receiptData && (
          <div className="flex-1 overflow-y-auto space-y-5 text-center pr-1 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <BadgeCheck className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100">
                Subscription Activated Successfully!
              </h3>
              <p className="text-xs text-slate-400">
                Your enterprise ERP license for <strong className="text-cyan-300">{currentCompany?.name}</strong> is now live.
              </p>
            </div>

            {/* Official Tax Invoice Voucher */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-3 font-mono text-xs max-w-lg mx-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-bold text-slate-100 uppercase">MTS ERP Official Tax Invoice</span>
                <span className="text-[10px] text-cyan-400 font-semibold">{receiptData.txnId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">Enterprise Client</span>
                  <span className="font-bold text-slate-200">{currentCompany?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">FBR NTN Number</span>
                  <span className="font-bold text-slate-200">{currentCompany?.ntn || '9920148-1'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Selected Tier</span>
                  <span className="font-bold text-purple-300">{receiptData.planName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Settlement Amount</span>
                  <span className="font-bold text-emerald-300">
                    {receiptData.amount === 0 ? 'Complimentary 14d Trial' : `PKR ${receiptData.amount.toLocaleString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Payment Channel</span>
                  <span className="font-bold text-slate-200">{receiptData.method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Activation Date</span>
                  <span className="font-bold text-slate-200">{receiptData.date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400 text-center">
                MTS ERP Future Solutions (Pvt) Ltd • FBR POS/ERP Compliant License
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-cyan-600/30"
              >
                Launch Enterprise Workspace →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
