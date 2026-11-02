import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Trash2,
  Printer,
  Eye,
  Paperclip,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  Building2,
  Calendar,
  User,
  Layers,
  FileText,
  AlertCircle,
  FileCheck2,
  SendHorizontal
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

export interface FormLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  taxPercent: number;
  netAmount: number;
}

export interface DepartmentFormData {
  id: string;
  formCode: string;
  formName: string;
  documentNo: string;
  transactionDate: string;
  department: string;
  section: string;
  employeeUser: string;
  customerSupplier: string;
  items: FormLineItem[];
  remarks: string;
  attachmentName?: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface DepartmentPopupFormProps {
  isOpen: boolean;
  onClose: () => void;
  formCode: string;
  formName: string;
  departmentName: string;
}

export const DepartmentPopupForm: React.FC<DepartmentPopupFormProps> = ({
  isOpen,
  onClose,
  formCode,
  formName,
  departmentName
}) => {
  const { currentCompany, currentUser } = useAuthTenant();

  // Document Fields
  const [documentNo, setDocumentNo] = useState(() => `DOC-${Date.now().toString().slice(-6)}`);
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState(departmentName || 'Accounts & Finance');
  const [section, setSection] = useState('Central Operations');
  const [employeeUser, setEmployeeUser] = useState(currentUser.name || 'Tariq Mehmood');
  const [customerSupplier, setCustomerSupplier] = useState('Crest Commercial Partner / Client');
  const [remarks, setRemarks] = useState('Standard transactional posting under ERP compliance guidelines.');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [preparedBy, setPreparedBy] = useState(currentUser.name || 'Tariq Mehmood');
  const [checkedBy, setCheckedBy] = useState('Accounts Supervisor');
  const [approvedBy, setApprovedBy] = useState('Finance Controller');
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('DRAFT');

  // Line items
  const [items, setItems] = useState<FormLineItem[]>([
    {
      id: 'item_1',
      description: 'Standard Goods & Operational Services Package',
      quantity: 1,
      rate: 45000,
      discount: 0,
      taxPercent: 18,
      netAmount: 53100
    }
  ]);

  // Search & history
  const [savedRecords, setSavedRecords] = useState<DepartmentFormData[]>(() => {
    try {
      const stored = localStorage.getItem(`mts_forms_${currentCompany.id}_${formCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    setDepartment(departmentName);
    setDocumentNo(`DOC-${Date.now().toString().slice(-6)}`);
  }, [formCode, departmentName]);

  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  const calculateLineNet = (item: FormLineItem) => {
    const gross = item.quantity * item.rate;
    const afterDiscount = gross - item.discount;
    const tax = (afterDiscount * item.taxPercent) / 100;
    return Math.max(0, afterDiscount + tax);
  };

  const handleUpdateLine = (id: string, field: keyof FormLineItem, val: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          updated.netAmount = calculateLineNet(updated);
          return updated;
        }
        return it;
      })
    );
  };

  const handleAddLine = () => {
    const newLine: FormLineItem = {
      id: `item_${Date.now()}`,
      description: 'Item / Service Line Description',
      quantity: 1,
      rate: 1000,
      discount: 0,
      taxPercent: 18,
      netAmount: 1180
    };
    setItems([...items, newLine]);
  };

  const handleDeleteLine = (id: string) => {
    if (items.length <= 1) {
      showNotice('At least one item or service line is required.', 'error');
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  const totalGross = items.reduce((acc, it) => acc + it.quantity * it.rate, 0);
  const totalDiscount = items.reduce((acc, it) => acc + it.discount, 0);
  const totalTax = items.reduce(
    (acc, it) => acc + ((it.quantity * it.rate - it.discount) * it.taxPercent) / 100,
    0
  );
  const totalNet = items.reduce((acc, it) => acc + it.netAmount, 0);

  const handleSave = () => {
    const record: DepartmentFormData = {
      id: documentNo,
      formCode,
      formName,
      documentNo,
      transactionDate,
      department,
      section,
      employeeUser,
      customerSupplier,
      items,
      remarks,
      attachmentName: attachmentName || undefined,
      preparedBy,
      checkedBy,
      approvedBy,
      status,
      createdAt: new Date().toISOString()
    };

    const existingIdx = savedRecords.findIndex((r) => r.documentNo === documentNo);
    let updated: DepartmentFormData[];
    if (existingIdx !== -1) {
      updated = [...savedRecords];
      updated[existingIdx] = record;
      showNotice(`Document ${documentNo} updated successfully!`);
    } else {
      updated = [record, ...savedRecords];
      showNotice(`Document ${documentNo} saved successfully!`);
    }

    setSavedRecords(updated);
    try {
      localStorage.setItem(`mts_forms_${currentCompany.id}_${formCode}`, JSON.stringify(updated));
    } catch {}
  };

  const handleNew = () => {
    setDocumentNo(`DOC-${Date.now().toString().slice(-6)}`);
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setStatus('DRAFT');
    setRemarks('Standard transactional posting under ERP compliance guidelines.');
    setItems([
      {
        id: `item_${Date.now()}`,
        description: 'New Transaction Item Description',
        quantity: 1,
        rate: 5000,
        discount: 0,
        taxPercent: 18,
        netAmount: 5900
      }
    ]);
    showNotice('New form initialized.');
  };

  const handleDelete = () => {
    const updated = savedRecords.filter((r) => r.documentNo !== documentNo);
    setSavedRecords(updated);
    try {
      localStorage.setItem(`mts_forms_${currentCompany.id}_${formCode}`, JSON.stringify(updated));
    } catch {}
    showNotice(`Document ${documentNo} removed.`);
    handleNew();
  };

  const handleLoadRecord = (rec: DepartmentFormData) => {
    setDocumentNo(rec.documentNo);
    setTransactionDate(rec.transactionDate);
    setDepartment(rec.department);
    setSection(rec.section);
    setEmployeeUser(rec.employeeUser);
    setCustomerSupplier(rec.customerSupplier);
    setItems(rec.items);
    setRemarks(rec.remarks);
    setPreparedBy(rec.preparedBy);
    setCheckedBy(rec.checkedBy);
    setApprovedBy(rec.approvedBy);
    setStatus(rec.status);
    setShowSearchModal(false);
    showNotice(`Loaded record ${rec.documentNo}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 max-w-5xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {formCode}
                </span>
                <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                  {formName}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Department: <strong className="text-slate-200">{departmentName}</strong> • Company: {currentCompany.name} (NTN: {currentCompany.ntn})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : status === 'SUBMITTED'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : status === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              Status: {status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Top Form Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-850/60 border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Document Number *
              </label>
              <input
                type="text"
                value={documentNo}
                onChange={(e) => setDocumentNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Section / Branch
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Employee / User
              </label>
              <input
                type="text"
                value={employeeUser}
                onChange={(e) => setEmployeeUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Customer / Supplier / Party Details
              </label>
              <input
                type="text"
                value={customerSupplier}
                onChange={(e) => setCustomerSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-bold"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Item / Service Lines Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Item &amp; Service Line Items</span>
              </h3>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5 min-w-[220px]">Item / Description</th>
                    <th className="p-2.5 w-24">Qty</th>
                    <th className="p-2.5 w-28">Rate (PKR)</th>
                    <th className="p-2.5 w-24">Discount</th>
                    <th className="p-2.5 w-20">Tax %</th>
                    <th className="p-2.5 w-32 text-right">Net Amount</th>
                    <th className="p-2.5 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs text-slate-200">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-900/50">
                      <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleUpdateLine(it.id, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-sans text-slate-100"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleUpdateLine(it.id, 'quantity', Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={it.rate}
                          onChange={(e) => handleUpdateLine(it.id, 'rate', Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={it.discount}
                          onChange={(e) => handleUpdateLine(it.id, 'discount', Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.taxPercent}
                          onChange={(e) => handleUpdateLine(it.id, 'taxPercent', Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">
                        Rs. {it.netAmount.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(it.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400">
                Total Line Items: <strong className="text-slate-200">{items.length}</strong>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold pt-2 sm:pt-0">
                <div>Gross: <span className="text-slate-200">Rs. {totalGross.toLocaleString()}</span></div>
                <div>Tax: <span className="text-cyan-400">Rs. {totalTax.toLocaleString()}</span></div>
                <div>Discount: <span className="text-amber-400">-Rs. {totalDiscount.toLocaleString()}</span></div>
                <div className="text-sm text-emerald-400 font-black px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  Net: Rs. {totalNet.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks, Approvals & Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Remarks / Narrative
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prepared By</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Checked By</label>
                <input
                  type="text"
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Approved By</label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>
              <div className="col-span-3 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Attached Document: {attachmentName ? <span className="text-cyan-400 font-mono">{attachmentName}</span> : 'None'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachmentName(`Voucher_Doc_${documentNo}.pdf`)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attach Signed Evidence</span>
                  </button>
                  {attachmentName && (
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="text-rose-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Form Action Buttons (Add, Save, Update, Delete, Search, Clear, Print, Submit Approval, Close) */}
        <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleNew}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Initialize New Form"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New / Add</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
              title="Save Record"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save / Update</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Search Saved Records"
            >
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>Search ({savedRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Delete Document"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={handleNew}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Clear form inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStatus('SUBMITTED');
                showNotice(`Document ${documentNo} submitted for approval.`);
              }}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStatus('APPROVED');
                showNotice(`Document ${documentNo} approved successfully!`);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Search Saved {formName} Documents</span>
                </h4>
                <button onClick={() => setShowSearchModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Search by Document #, Party or Remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />

              <div className="max-h-60 overflow-y-auto space-y-2">
                {savedRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No documents recorded yet. Click Save above.</p>
                ) : (
                  savedRecords
                    .filter(
                      (r) =>
                        r.documentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.customerSupplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.remarks.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((r) => (
                      <div
                        key={r.documentNo}
                        onClick={() => handleLoadRecord(r)}
                        className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div>
                          <div className="font-mono font-bold text-xs text-cyan-300">{r.documentNo}</div>
                          <div className="text-[11px] text-slate-300">{r.customerSupplier}</div>
                          <div className="text-[10px] text-slate-400">{r.transactionDate} • {r.items.length} items</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold">
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
