import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Printer,
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Building2,
  Receipt,
  RotateCcw,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  FileText
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_INVENTORY, INITIAL_BRANCHES } from '../../services/mockData';

export interface FormConfigTarget {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentLabel: string;
}

export interface GridItemRow {
  id: string;
  srNo: number;
  itemCode: string;
  itemName: string;
  uom: string;
  qtyDemand: number;
  issueQty: number;
  balStock: number;
  remarks: string;
  price: number;
  isGstTaxable: boolean; // Yes = 18%, Exempt = 0%
  taxAmount: number;
  lineTotal: number;
}

interface StandardDocumentGridFormProps {
  isOpen: boolean;
  onClose: () => void;
  formTarget?: FormConfigTarget | null;
}

// Preset verified customer/vendor database with Pakistani business balances
const PRESET_PARTIES = [
  {
    id: 'CUST-001',
    name: 'Walk-in Counter Customer',
    type: 'CUSTOMER',
    city: 'Lahore',
    ntn: 'UNREGISTERED',
    strn: 'N/A',
    previousBalance: 0,
    creditLimit: 0,
    phone: '0300-0000000'
  },
  {
    id: 'CUST-002',
    name: 'Kohinoor Textile Traders (Pvt) Ltd',
    type: 'CUSTOMER',
    city: 'Faisalabad',
    ntn: '4102938-1',
    strn: '17009823101',
    previousBalance: 385400,
    creditLimit: 2500000,
    phone: '0300-8456123'
  },
  {
    id: 'CUST-003',
    name: 'Lahore Mega Wholesalers & Distributors',
    type: 'CUSTOMER',
    city: 'Badami Bagh, Lahore',
    ntn: '3991204-5',
    strn: '17003411221',
    previousBalance: 1240000,
    creditLimit: 5000000,
    phone: '0321-4455667'
  },
  {
    id: 'CUST-004',
    name: 'Karachi Central Distribution Hub',
    type: 'CUSTOMER',
    city: 'SITE Industrial Area, Karachi',
    ntn: '5129301-2',
    strn: '17004499110',
    previousBalance: 612500,
    creditLimit: 3000000,
    phone: '0333-2198765'
  },
  {
    id: 'CUST-005',
    name: 'Rawalpindi Wholesale Mart',
    type: 'CUSTOMER',
    city: 'Raja Bazar, Rawalpindi',
    ntn: '2894101-7',
    strn: '17008822334',
    previousBalance: 215800,
    creditLimit: 1500000,
    phone: '0312-5566778'
  },
  {
    id: 'VEND-001',
    name: 'Engro Polymer & Chemicals Ltd',
    type: 'VENDOR',
    city: 'Karachi',
    ntn: '0711928-3',
    strn: '12003841109',
    previousBalance: 890000,
    creditLimit: 10000000,
    phone: '021-35678900'
  },
  {
    id: 'VEND-002',
    name: 'Packaging World Private Ltd',
    type: 'VENDOR',
    city: 'Sundar Industrial Estate, Lahore',
    ntn: '1982736-4',
    strn: '17004567890',
    previousBalance: 140000,
    creditLimit: 2000000,
    phone: '042-35990011'
  }
];

export const StandardDocumentGridForm: React.FC<StandardDocumentGridFormProps> = ({
  isOpen,
  onClose,
  formTarget
}) => {
  const { currentCompany } = useAuthTenant();

  // Header State
  const [docType, setDocType] = useState('TAX_INVOICE');
  const [docNumber, setDocNumber] = useState(`DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [branchId, setBranchId] = useState('br_lahore_01');
  const [paymentTerms, setPaymentTerms] = useState<'CASH' | 'CREDIT'>('CASH');

  // Party (Customer / Vendor) Selection & Previous Balance
  const [selectedPartyId, setSelectedPartyId] = useState('CUST-002');
  const [customPartyName, setCustomPartyName] = useState('');
  const [customPartyNtn, setCustomPartyNtn] = useState('');
  const [customPartyPhone, setCustomPartyPhone] = useState('');
  const [previousBalance, setPreviousBalance] = useState(385400);

  // Logo Settings
  const [showLogo, setShowLogo] = useState(true);
  const [customLogoUrl, setCustomLogoUrl] = useState(
    currentCompany.logoUrl ||
      'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=160&auto=format&fit=crop&q=80'
  );
  const [isEditingLogo, setIsEditingLogo] = useState(false);

  // Financial Footer Parameters
  const [discountAmount, setDiscountAmount] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE' | 'ONLINE_IBFT' | 'PAY_ORDER'>('CASH');
  const [chequeOrRefNo, setChequeOrRefNo] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState(
    'Standard warranty & return policy applicable. Goods subject to 18% Sales Tax under FBR Sales Tax Act 1990.'
  );

  // View state: Editing vs Print Preview
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Create 10 initial rows as requested by user
  const createDefaultRows = (): GridItemRow[] => {
    const rows: GridItemRow[] = [];
    const seedCatalog = INITIAL_INVENTORY.slice(0, 3);

    for (let i = 0; i < 10; i++) {
      const seed = seedCatalog[i];
      if (seed) {
        const qtyDemand = i === 0 ? 50 : i === 1 ? 25 : 40;
        const issueQty = qtyDemand;
        const price = seed.unitPrice;
        const isTaxable = true;
        const tax = isTaxable ? issueQty * price * 0.18 : 0;
        rows.push({
          id: `row_${i + 1}`,
          srNo: i + 1,
          itemCode: seed.code,
          itemName: seed.name,
          uom: seed.uom,
          qtyDemand,
          issueQty,
          balStock: seed.currentStock,
          remarks: 'Standard Grade A Stock',
          price,
          isGstTaxable: isTaxable,
          taxAmount: Math.round(tax),
          lineTotal: Math.round(issueQty * price + tax)
        });
      } else {
        rows.push({
          id: `row_${i + 1}`,
          srNo: i + 1,
          itemCode: '',
          itemName: '',
          uom: 'Pcs',
          qtyDemand: 0,
          issueQty: 0,
          balStock: 0,
          remarks: '',
          price: 0,
          isGstTaxable: true,
          taxAmount: 0,
          lineTotal: 0
        });
      }
    }
    return rows;
  };

  const [rows, setRows] = useState<GridItemRow[]>(createDefaultRows);

  // Synchronize document title with formTarget when opened
  useEffect(() => {
    if (formTarget) {
      const titleLower = formTarget.title.toLowerCase();
      if (titleLower.includes('purchase order') || titleLower.includes('po_issue')) {
        setDocType('PURCHASE_ORDER');
        setPaymentTerms('CREDIT');
        setSelectedPartyId('VEND-001');
        setPreviousBalance(890000);
      } else if (titleLower.includes('grn') || titleLower.includes('goods receipt')) {
        setDocType('GOODS_RECEIPT_NOTE');
        setPaymentTerms('CREDIT');
        setSelectedPartyId('VEND-002');
        setPreviousBalance(140000);
      } else if (titleLower.includes('voucher') || titleLower.includes('payment')) {
        setDocType('PAYMENT_VOUCHER');
        setPaymentTerms('CASH');
      } else if (titleLower.includes('quotation')) {
        setDocType('SALES_QUOTATION');
        setPaymentTerms('CREDIT');
      } else if (titleLower.includes('pos') || titleLower.includes('tax invoice')) {
        setDocType('TAX_INVOICE');
        setPaymentTerms('CASH');
      }
      setDocNumber(`${formTarget.code.replace(/_/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [formTarget]);

  // Handle party selector change
  const handlePartyChange = (partyId: string) => {
    setSelectedPartyId(partyId);
    if (partyId === 'CUSTOM') {
      setPreviousBalance(0);
    } else {
      const found = PRESET_PARTIES.find((p) => p.id === partyId);
      if (found) {
        setPreviousBalance(found.previousBalance);
      }
    }
  };

  // Row operations
  const handleRowChange = (
    index: number,
    field: keyof GridItemRow,
    value: any
  ) => {
    setRows((prevRows) => {
      const updated = [...prevRows];
      const target = { ...updated[index], [field]: value };

      // If item code was chosen from catalog, auto-fill details
      if (field === 'itemCode' && typeof value === 'string') {
        const item = INITIAL_INVENTORY.find((inv) => inv.code === value);
        if (item) {
          target.itemName = item.name;
          target.uom = item.uom;
          target.balStock = item.currentStock;
          target.price = item.unitPrice;
          target.remarks = `Batch: ${item.batchNumber}`;
          if (target.qtyDemand === 0) target.qtyDemand = 1;
          if (target.issueQty === 0) target.issueQty = 1;
        }
      }

      // Recalculate taxes and line total
      const qty = Number(target.issueQty) || 0;
      const unitPrice = Number(target.price) || 0;
      const baseAmount = qty * unitPrice;
      const tax = target.isGstTaxable ? baseAmount * 0.18 : 0;

      target.taxAmount = Math.round(tax);
      target.lineTotal = Math.round(baseAmount + tax);

      updated[index] = target;
      return updated;
    });
  };

  // Add Row
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        srNo: prev.length + 1,
        itemCode: '',
        itemName: '',
        uom: 'Pcs',
        qtyDemand: 0,
        issueQty: 0,
        balStock: 0,
        remarks: '',
        price: 0,
        isGstTaxable: true,
        taxAmount: 0,
        lineTotal: 0
      }
    ]);
  };

  // Remove Row
  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) {
      alert('A document must have at least one line item row.');
      return;
    }
    const filtered = rows.filter((_, idx) => idx !== index);
    // Re-index srNo
    const reindexed = filtered.map((r, i) => ({ ...r, srNo: i + 1 }));
    setRows(reindexed);
  };

  // Clear row content
  const handleClearRow = (index: number) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemCode: '',
        itemName: '',
        uom: 'Pcs',
        qtyDemand: 0,
        issueQty: 0,
        balStock: 0,
        remarks: '',
        price: 0,
        isGstTaxable: true,
        taxAmount: 0,
        lineTotal: 0
      };
      return updated;
    });
  };

  // Reset entire form
  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset the entire document and grid rows?')) {
      setRows(createDefaultRows());
      setDiscountAmount(0);
      setOtherExpenses(0);
      setAmountPaid(0);
      setSaveSuccessMessage(null);
    }
  };

  // Totals calculations
  const subtotal = rows.reduce(
    (sum, r) => sum + (Number(r.issueQty) || 0) * (Number(r.price) || 0),
    0
  );
  const totalGstTax = rows.reduce((sum, r) => sum + (Number(r.taxAmount) || 0), 0);
  const netCurrentBill = Math.max(0, subtotal + totalGstTax - discountAmount + otherExpenses);
  const grandTotal = netCurrentBill + previousBalance;
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  // Save / Post Document
  const handleSaveDocument = () => {
    const activeItems = rows.filter((r) => r.itemCode || r.itemName || r.issueQty > 0);
    if (activeItems.length === 0) {
      alert('Please enter at least one valid item row before saving.');
      return;
    }

    const payload = {
      docNumber,
      docType,
      docDate,
      dueDate,
      paymentTerms,
      selectedPartyId,
      subtotal,
      totalGstTax,
      discountAmount,
      otherExpenses,
      netCurrentBill,
      previousBalance,
      grandTotal,
      amountPaid,
      balanceDue,
      rows: activeItems,
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for audit persistence
    const key = `DOC_ARCHIVE_${currentCompany.tenantId || 'tenant'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(payload);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));

    setSaveSuccessMessage(`Document ${docNumber} successfully posted & stored to ledger.`);
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MTS ERP ENTERPRISE - ${formTarget?.title || 'TRANSACTIONAL DOCUMENT'}\n`;
    csvContent += `Document No,${docNumber},Date,${docDate},Terms,${paymentTerms}\n`;
    csvContent += `Company Name,${currentCompany.name},NTN,${currentCompany.ntn},STRN,${currentCompany.strn}\n`;
    const party = PRESET_PARTIES.find((p) => p.id === selectedPartyId);
    csvContent += `Party Name,${party ? party.name : customPartyName || 'Custom Party'},Party NTN,${party ? party.ntn : customPartyNtn}\n`;
    csvContent += `Previous Balance Attached,${previousBalance}\n\n`;

    csvContent += `Sr #,Item Code,Item Name,UOM,Qty Demand,Issue Qty,Bal Stock,Remarks,Price (PKR),GST (18%),Tax Amount (PKR),Line Total (PKR)\n`;
    rows.forEach((r) => {
      if (r.itemCode || r.itemName || r.issueQty > 0) {
        csvContent += `"${r.srNo}","${r.itemCode}","${r.itemName}","${r.uom}",${r.qtyDemand},${r.issueQty},${r.balStock},"${r.remarks}",${r.price},"${r.isGstTaxable ? 'YES (18%)' : 'EXEMPT'}",${r.taxAmount},${r.lineTotal}\n`;
      }
    });

    csvContent += `\nFinancial Summary\n`;
    csvContent += `Subtotal (PKR),${subtotal}\n`;
    csvContent += `FBR GST 18% (PKR),${totalGstTax}\n`;
    csvContent += `Discount (PKR),${discountAmount}\n`;
    csvContent += `Other Expense / Freight (PKR),${otherExpenses}\n`;
    csvContent += `Net Current Bill (PKR),${netCurrentBill}\n`;
    csvContent += `Previous Balance Attached (PKR),${previousBalance}\n`;
    csvContent += `Grand Total Amount (PKR),${grandTotal}\n`;
    csvContent += `Amount Paid / Received (PKR),${amountPaid}\n`;
    csvContent += `Balance Due (PKR),${balanceDue}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentCompany.slug}_${docNumber}_${docDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logo upload helper
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
          setIsEditingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const currentPartyObj = PRESET_PARTIES.find((p) => p.id === selectedPartyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-white text-slate-800 rounded-2xl max-w-7xl w-full shadow-2xl border border-slate-300 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {formTarget?.code || 'DOC_ENTRY_FORM'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {formTarget?.departmentLabel || 'Department Form'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {formTarget?.title || 'Bill, Voucher & Invoice Document Entry'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Edit vs Print Preview */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  !isPreviewMode ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Grid Editor
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                  isPreviewMode ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Print / PDF View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {saveSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-3 text-emerald-800 text-xs font-semibold shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* ======================================================== */}
          {/* VIEW 1: PRINT & PDF A4 PREVIEW WITH LOGO & SIGNATURES    */}
          {/* ======================================================== */}
          {isPreviewMode ? (
            <div className="space-y-6">
              {/* Print Action Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Show Company Logo in Header</span>
                  </label>

                  <button
                    onClick={() => setIsEditingLogo(!isEditingLogo)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Change / Upload Logo</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export Excel / CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF Document</span>
                  </button>
                </div>
              </div>

              {/* Logo Upload Modal / Bar if toggled */}
              {isEditingLogo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Configure Company Logo for PDF & Print</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Logo Image URL
                      </label>
                      <input
                        type="text"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Or Upload Local Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PRINT SHEET: Formal Pakistani ERP Printable Layout */}
              <div
                id="printable-document-sheet"
                className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 text-slate-800 font-sans"
              >
                {/* Printable Header: Logo + Company Info */}
                <div className="flex flex-col sm:flex-row items-start justify-between pb-4 border-b-2 border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    {showLogo && (
                      <div className="h-16 w-28 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={customLogoUrl}
                          alt="Company Logo"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            // Fallback to text initials if broken link
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                        {currentCompany.name}
                      </h1>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {currentCompany.address || 'Industrial Estate, Lahore, Pakistan'}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-mono mt-1">
                        <span><strong>NTN:</strong> {currentCompany.ntn || '4109823-7'}</span>
                        <span><strong>STRN:</strong> {currentCompany.strn || '17009988221'}</span>
                        <span><strong>UAN:</strong> +92-42-111-000-888</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-start">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-black text-sm uppercase tracking-wider rounded">
                      {paymentTerms === 'CASH' ? 'CASH BILL / INVOICE' : 'CREDIT TAX INVOICE'}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-2">
                      DOC #: <span className="text-blue-700 font-black">{docNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Date: <span className="font-semibold">{docDate}</span> | Due: <span className="font-semibold">{dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Party & Terms Metadata Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                      BILLED TO / PARTY DETAILS:
                    </span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      {selectedPartyId === 'CUSTOM'
                        ? customPartyName || 'Valued Customer'
                        : currentPartyObj?.name}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      City: {currentPartyObj?.city || 'Lahore'} | Phone: {currentPartyObj?.phone || customPartyPhone || 'N/A'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600">
                      NTN: {currentPartyObj?.ntn || customPartyNtn || 'Unregistered'} | STRN: {currentPartyObj?.strn || 'N/A'}
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <div>
                      <span className="text-slate-500">Payment Terms: </span>
                      <span className="font-bold text-slate-900">
                        {paymentTerms === 'CASH' ? 'Immediate Cash Counter Settlement' : 'Credit Account (15 Days)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Attached Previous Ledger Balance: </span>
                      <span className="font-mono font-bold text-amber-700">
                        PKR {previousBalance.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Branch Dispatch: </span>
                      <span className="font-semibold text-slate-800">
                        {INITIAL_BRANCHES.find((b) => b.id === branchId)?.name || 'Lahore Main Plant'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table Grid in Preview */}
                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-2 border-r border-slate-300 text-center w-10">Sr #</th>
                        <th className="p-2 border-r border-slate-300 w-28">Item Code</th>
                        <th className="p-2 border-r border-slate-300">Item Name & Description</th>
                        <th className="p-2 border-r border-slate-300 text-center w-16">UOM</th>
                        <th className="p-2 border-r border-slate-300 text-right w-16">Demand</th>
                        <th className="p-2 border-r border-slate-300 text-right w-16">Issue</th>
                        <th className="p-2 border-r border-slate-300 text-right w-16">Bal Stock</th>
                        <th className="p-2 border-r border-slate-300">Remarks</th>
                        <th className="p-2 border-r border-slate-300 text-right w-20">Price (PKR)</th>
                        <th className="p-2 border-r border-slate-300 text-center w-14">GST 18%</th>
                        <th className="p-2 border-r border-slate-300 text-right w-20">Tax (PKR)</th>
                        <th className="p-2 text-right w-24">Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-500">
                            {row.srNo}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-700">
                            {row.itemCode || '-'}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-medium">
                            {row.itemName || '-'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center text-slate-600">
                            {row.uom}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {row.qtyDemand}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                            {row.issueQty}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-500">
                            {row.balStock}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-500 text-[11px]">
                            {row.remarks || '-'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {row.price > 0 ? row.price.toLocaleString() : '-'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.isGstTaxable
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {row.isGstTaxable ? '18%' : 'Exempt'}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">
                            {row.taxAmount > 0 ? row.taxAmount.toLocaleString() : '-'}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">
                            {row.lineTotal > 0 ? row.lineTotal.toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Printout Financial Summary Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <span className="font-bold text-slate-600 uppercase text-[10px] block">
                        Official Notes & Payment Details:
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {generalRemarks}
                      </p>
                      <div className="pt-2 text-[11px] text-slate-700">
                        <strong>Settlement Method:</strong> {paymentMethod}{' '}
                        {chequeOrRefNo ? `(Ref: ${chequeOrRefNo})` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Calculations Breakdown */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Item Subtotal (Excl. Tax):</span>
                      <span className="font-semibold">PKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>FBR GST Sales Tax (18%):</span>
                      <span className="font-semibold">+ PKR {totalGstTax.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Commercial Discount:</span>
                        <span>- PKR {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {otherExpenses > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Other Expenses / Freight:</span>
                        <span>+ PKR {otherExpenses.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-300 pt-1 font-bold text-slate-900">
                      <span>Net Current Bill Amount:</span>
                      <span>PKR {netCurrentBill.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 pt-0.5">
                      <span>Previous Balance Attached:</span>
                      <span className="font-bold">+ PKR {previousBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-slate-800 pt-1 text-sm font-black text-slate-900 bg-amber-50 p-1.5 rounded">
                      <span className="uppercase">Grand Total Amount:</span>
                      <span>PKR {grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 pt-0.5">
                      <span>Amount Received / Paid:</span>
                      <span className="font-bold">- PKR {amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-1 font-black text-red-600">
                      <span>Balance Due:</span>
                      <span>PKR {balanceDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Standard 4-Tier Pakistani ERP Signature Blocks */}
                <div className="pt-10 grid grid-cols-4 gap-4 text-center text-[10px] text-slate-500 font-mono">
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Prepared By</div>
                    <div>Accountant / Entry Officer</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Checked By</div>
                    <div>Internal Auditor / Store Incharge</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Approved By</div>
                    <div>Director / Head of Finance</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8"></div>
                    <div className="mt-1 font-bold text-slate-800 uppercase">Customer / Receiver</div>
                    <div>Authorized Signature & Stamp</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* VIEW 2: INTERACTIVE GRID EDITOR (10 ROWS + CONTROLS)     */
            /* ======================================================== */
            <div className="space-y-6">
              
              {/* Document Master Control Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {/* Column 1: Document Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="TAX_INVOICE">Commercial Tax Invoice (STRN 18%)</option>
                      <option value="CASH_BILL">Cash Counter Sale Bill</option>
                      <option value="PURCHASE_ORDER">Procurement Purchase Order (PO)</option>
                      <option value="GOODS_RECEIPT_NOTE">Goods Receipt Note (GRN)</option>
                      <option value="DELIVERY_CHALLAN">Delivery Challan / Stock Issue</option>
                      <option value="PAYMENT_VOUCHER">Payment / Expense Voucher</option>
                      <option value="JOURNAL_VOUCHER">Journal Adjustment Voucher (JV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Document Number
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Column 2: Dates & Terms (CASH vs CREDIT BILL) */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        Doc Date
                      </label>
                      <input
                        type="date"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Cash or Credit Bill Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Billing Terms
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-200 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPaymentTerms('CASH')}
                        className={`py-1 text-center font-bold text-xs rounded-md transition-all ${
                          paymentTerms === 'CASH'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        CASH BILL
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentTerms('CREDIT')}
                        className={`py-1 text-center font-bold text-xs rounded-md transition-all ${
                          paymentTerms === 'CREDIT'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        CREDIT BILL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Customer / Vendor Selection with Previous Balance */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Customer / Vendor Account
                    </label>
                    <select
                      value={selectedPartyId}
                      onChange={(e) => handlePartyChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    >
                      {PRESET_PARTIES.map((party) => (
                        <option key={party.id} value={party.id}>
                          {party.name} ({party.city})
                        </option>
                      ))}
                      <option value="CUSTOM">+ Add Custom Party / Walk-in</option>
                    </select>
                  </div>

                  {selectedPartyId === 'CUSTOM' ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Party Full Name"
                        value={customPartyName}
                        onChange={(e) => setCustomPartyName(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="FBR NTN"
                          value={customPartyNtn}
                          onChange={(e) => setCustomPartyNtn(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phone No"
                          value={customPartyPhone}
                          onChange={(e) => setCustomPartyPhone(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-900">Attached Prev Balance:</span>
                        <span className="font-mono font-black text-amber-900">
                          PKR {previousBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        NTN: {currentPartyObj?.ntn} | Limit: PKR {currentPartyObj?.creditLimit.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 4: Branch, Logo Option & Actions */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Branch / Warehouse
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-cyan-500"
                    >
                      {INITIAL_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Print Company Logo on PDF</span>
                    </label>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Header will embed official enterprise crest & STRN.
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Action Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                    Document Line Items Grid
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
                    {rows.length} Rows Configured
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Row</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Grid</span>
                  </button>
                </div>
              </div>

              {/* Multi-Row Tabular Item Grid (Table Headings exactly matching user request) */}
              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-inner bg-white">
                <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px] tracking-wider select-none">
                    <tr>
                      <th className="p-2 border-r border-slate-300 text-center w-12">Sr #</th>
                      <th className="p-2 border-r border-slate-300 w-36">Item Code</th>
                      <th className="p-2 border-r border-slate-300 min-w-[200px]">Item Name</th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">UOM</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Qty Demand</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Issue Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">Bal Stock</th>
                      <th className="p-2 border-r border-slate-300 min-w-[140px]">Remarks</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Price (PKR)</th>
                      <th className="p-2 border-r border-slate-300 text-center w-28">GST (18%)</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Tax Amt</th>
                      <th className="p-2 border-r border-slate-300 text-right w-28">Line Total</th>
                      <th className="p-2 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-cyan-50/30 transition-colors">
                        {/* Sr # */}
                        <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-500 bg-slate-50">
                          {row.srNo}
                        </td>

                        {/* Item Code (Supports quick pick from catalog or free text) */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="text"
                            list="item-code-catalog"
                            value={row.itemCode}
                            onChange={(e) => handleRowChange(index, 'itemCode', e.target.value)}
                            placeholder="e.g. RM-FLOUR"
                            className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs font-semibold focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* Item Name */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="text"
                            value={row.itemName}
                            onChange={(e) => handleRowChange(index, 'itemName', e.target.value)}
                            placeholder="Enter item description..."
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* UOM */}
                        <td className="p-1.5 border-r border-slate-200">
                          <select
                            value={row.uom}
                            onChange={(e) => handleRowChange(index, 'uom', e.target.value)}
                            className="w-full px-1.5 py-1 rounded border border-slate-300 text-xs bg-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="Pcs">Pcs</option>
                            <option value="Bags">Bags</option>
                            <option value="Cartons">Cartons</option>
                            <option value="Kgs">Kgs</option>
                            <option value="Tins">Tins</option>
                            <option value="Liters">Liters</option>
                            <option value="Boxes">Boxes</option>
                            <option value="Meters">Meters</option>
                          </select>
                        </td>

                        {/* Qty Demand */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="number"
                            min="0"
                            value={row.qtyDemand || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'qtyDemand', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1.5 py-1 text-right rounded border border-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* Issue Qty */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="number"
                            min="0"
                            value={row.issueQty || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'issueQty', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1.5 py-1 text-right font-bold rounded border border-slate-300 font-mono text-xs text-slate-900 bg-amber-50/30 focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* Bal Stock */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="number"
                            value={row.balStock || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'balStock', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1.5 py-1 text-right rounded border border-slate-300 font-mono text-xs text-slate-500 bg-slate-50 focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* Remarks */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="text"
                            value={row.remarks}
                            onChange={(e) => handleRowChange(index, 'remarks', e.target.value)}
                            placeholder="Batch, grade, notes"
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* Price (PKR) */}
                        <td className="p-1.5 border-r border-slate-200">
                          <input
                            type="number"
                            min="0"
                            value={row.price || ''}
                            onChange={(e) =>
                              handleRowChange(index, 'price', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1.5 py-1 text-right rounded border border-slate-300 font-mono text-xs font-semibold focus:outline-none focus:border-cyan-500"
                          />
                        </td>

                        {/* GST (18%) selector: Yes vs Exempt */}
                        <td className="p-1.5 border-r border-slate-200 text-center">
                          <select
                            value={row.isGstTaxable ? 'YES' : 'EXEMPT'}
                            onChange={(e) =>
                              handleRowChange(index, 'isGstTaxable', e.target.value === 'YES')
                            }
                            className={`w-full px-1.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                              row.isGstTaxable
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            }`}
                          >
                            <option value="YES">Yes (18%)</option>
                            <option value="EXEMPT">Exempt (0%)</option>
                          </select>
                        </td>

                        {/* Calculated Tax Amount */}
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono text-slate-600 bg-slate-50/50">
                          {row.taxAmount > 0 ? `Rs. ${row.taxAmount.toLocaleString()}` : '0'}
                        </td>

                        {/* Calculated Line Total */}
                        <td className="p-1.5 border-r border-slate-200 text-right font-mono font-bold text-slate-900 bg-slate-50/70">
                          {row.lineTotal > 0 ? `Rs. ${row.lineTotal.toLocaleString()}` : '0'}
                        </td>

                        {/* Action buttons */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Datalist for fast item code picking */}
                <datalist id="item-code-catalog">
                  {INITIAL_INVENTORY.map((inv) => (
                    <option key={inv.id} value={inv.code}>
                      {inv.name} - (Stock: {inv.currentStock} {inv.uom})
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Bottom Financial Footer & Adjustment Block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Left Side: Terms, Payment Mode & Remarks */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        Settlement Payment Mode
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                      >
                        <option value="CASH">Cash Counter Till</option>
                        <option value="ONLINE_IBFT">Online Banking / IBFT</option>
                        <option value="CHEQUE">Crossed Cheque</option>
                        <option value="PAY_ORDER">Bank Pay Order</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        Cheque / Transaction Ref #
                      </label>
                      <input
                        type="text"
                        value={chequeOrRefNo}
                        onChange={(e) => setChequeOrRefNo(e.target.value)}
                        placeholder="e.g. CHQ-99210 or FT26102"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                      Document General Remarks & FBR Tax Notes
                    </label>
                    <textarea
                      rows={2}
                      value={generalRemarks}
                      onChange={(e) => setGeneralRemarks(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700"
                    />
                  </div>

                  {/* Previous Balance Indicator Alert */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Previous Ledger Balance attached from account record is automatically added into Grand Total.
                      </span>
                    </div>
                    <div className="text-right font-mono font-black text-amber-900 text-sm shrink-0">
                      PKR {previousBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right Side: Exact Financial Calculation Setup Requested by User */}
                <div className="lg:col-span-5 bg-white border border-slate-300 rounded-xl p-4 shadow-sm space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal (Base Items):</span>
                    <span className="font-semibold text-slate-900">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-blue-700 font-semibold">
                    <span>Standard 18% GST Total:</span>
                    <span>+ PKR {totalGstTax.toLocaleString()}</span>
                  </div>

                  {/* Discount Input */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Discount (PKR):</span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount || ''}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-28 px-2 py-0.5 text-right rounded border border-slate-300 font-mono text-xs text-emerald-700 font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Other Expenses Input */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Other Expenses / Freight:</span>
                    <input
                      type="number"
                      min="0"
                      value={otherExpenses || ''}
                      onChange={(e) => setOtherExpenses(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-28 px-2 py-0.5 text-right rounded border border-slate-300 font-mono text-xs text-slate-800 font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Net Current Bill */}
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                    <span>Net Current Bill Amount:</span>
                    <span className="text-slate-900">PKR {netCurrentBill.toLocaleString()}</span>
                  </div>

                  {/* Previous Balance Row */}
                  <div className="flex justify-between items-center text-amber-800 font-bold bg-amber-50/70 p-1 rounded">
                    <span>+ Previous Balance Attached:</span>
                    <span>PKR {previousBalance.toLocaleString()}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center border-t-2 border-slate-900 pt-2 text-sm font-black text-slate-900 bg-slate-900 text-white p-2 rounded-lg">
                    <span className="uppercase tracking-wider">Grand Total Amount:</span>
                    <span className="text-cyan-300 text-base">PKR {grandTotal.toLocaleString()}</span>
                  </div>

                  {/* Amount Paid Input */}
                  <div className="flex justify-between items-center text-slate-700 pt-1">
                    <span className="font-semibold">Amount Paid / Received:</span>
                    <input
                      type="number"
                      min="0"
                      value={amountPaid || ''}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 px-2 py-1 text-right font-bold rounded border border-slate-400 font-mono text-xs text-emerald-700 bg-emerald-50 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Balance Due */}
                  <div className="flex justify-between items-center border-t border-slate-300 pt-1 font-black text-red-600 text-xs">
                    <span>Balance Due / Receivable:</span>
                    <span>PKR {balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            <span>FBR STRN 18% Compliant • Multi-Row Tabular Grid</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3.5 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>{isPreviewMode ? 'Return to Grid' : 'Print / PDF Sheet'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDocument}
              className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Post Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
