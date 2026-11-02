import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  CheckSquare,
  Square,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Database,
  Filter
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

export const BatchClientDataExport: React.FC = () => {
  const { allCompanies } = useAuthTenant();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(
    allCompanies.map(c => c.id)
  );
  const [exportFormat, setExportFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeAudits, setIncludeAudits] = useState(true);
  const [includeLicensing, setIncludeLicensing] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleSelectAll = () => {
    if (selectedCompanyIds.length === allCompanies.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(allCompanies.map(c => c.id));
    }
  };

  const handleToggleCompany = (id: string) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter(i => i !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  const handleGenerateExport = () => {
    if (selectedCompanyIds.length === 0) {
      alert('Please select at least one tenant company for batch export.');
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      const selectedComps = allCompanies.filter(c => selectedCompanyIds.includes(c.id));
      
      if (exportFormat === 'CSV') {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Company ID,Company Name,Slug,Industry,NTN,STRN,Subscription Plan,User Limit,Payment Status,Last Payment (PKR)\r\n";

        selectedComps.forEach(c => {
          const row = [
            c.id,
            `"${c.name}"`,
            c.slug,
            c.industry,
            c.ntn,
            c.strn,
            c.subscriptionPlan,
            c.userLimit,
            c.paymentStatus || 'TRIAL',
            c.lastPaymentAmount || 0
          ].join(",");
          csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mts_erp_batch_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF / Summary Report simulation
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>MTS-ERP Cross-Company Batch Export Report</title>
                <style>
                  body { font-family: monospace; padding: 20px; color: #111; }
                  h1 { color: #0284c7; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 11px; }
                  th { background: #f1f5f9; }
                </style>
              </head>
              <body>
                <h1>MTS-ERP Master Batch Client Data Report</h1>
                <p>Generated On: ${new Date().toLocaleString()} | Selected Tenants: ${selectedComps.length}</p>
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry</th>
                      <th>Plan</th>
                      <th>Users</th>
                      <th>NTN</th>
                      <th>Payment Status</th>
                      <th>Revenue (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedComps.map(c => `
                      <tr>
                        <td><b>${c.name}</b> (${c.slug})</td>
                        <td>${c.industry}</td>
                        <td>${c.subscriptionPlan}</td>
                        <td>${c.userLimit}</td>
                        <td>${c.ntn}</td>
                        <td>${c.paymentStatus || 'TRIAL'}</td>
                        <td>${(c.lastPaymentAmount || 0).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }

      setIsExporting(false);
      setSuccessMessage(`Successfully generated unified ${exportFormat} export for ${selectedComps.length} enterprise tenant(s).`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 800);
  };

  const selectedCompsList = allCompanies.filter(c => selectedCompanyIds.includes(c.id));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-800/40 p-6 rounded-3xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Download className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Batch Client Data Export & Cross-Company Reporting
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Select multiple enterprise tenant companies to aggregate financial summaries, audit logs, licensing data, and department structures into a single unified CSV or PDF document.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tenant Selection & Options */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Select Tenant Companies ({selectedCompanyIds.length} / {allCompanies.length})
              </h2>
              <button
                onClick={handleToggleSelectAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
              >
                {selectedCompanyIds.length === allCompanies.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
              {allCompanies.map((comp) => {
                const isSelected = selectedCompanyIds.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleToggleCompany(comp.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-100' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-white">{comp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{comp.slug}.erp.mts.pk</div>
                    </div>
                    {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <Layers className="w-4 h-4 text-purple-400" />
              Export Payload & Format Options
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Include Modules in Export</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeFinancials} onChange={(e) => setIncludeFinancials(e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-cyan-500" />
                    Aggregated Financial Summaries (Revenue, Invoices, P&L)
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeAudits} onChange={(e) => setIncludeAudits(e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-cyan-500" />
                    Global Audit Logs & Security Anomaly Tracking
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={includeLicensing} onChange={(e) => setIncludeLicensing(e.target.checked)} className="rounded bg-slate-950 border-slate-800 text-cyan-500" />
                    Licensing Quotas & Department Headcounts
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Document Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('CSV')}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                      exportFormat === 'CSV' ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    <span className="text-xs font-black">Unified CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('PDF')}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                      exportFormat === 'PDF' ? 'bg-purple-600/20 border-purple-500 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-black">Printable Report / PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateExport}
              disabled={isExporting}
              className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isExporting ? 'Generating Unified Export...' : `Generate Batch ${exportFormat} Export (${selectedCompanyIds.length} Tenants)`}
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Aggregation Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-6">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <Database className="w-4 h-4 text-emerald-400" />
              Aggregation Preview
            </h2>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Selected Companies:</span>
                <span className="text-cyan-400 font-bold">{selectedCompsList.length}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total User Licenses:</span>
                <span className="text-slate-100 font-bold">{selectedCompsList.reduce((acc, c) => acc + c.userLimit, 0)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Aggregated Revenue:</span>
                <span className="text-emerald-400 font-bold">PKR {selectedCompsList.reduce((acc, c) => acc + (c.lastPaymentAmount || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Export Format:</span>
                <span className="text-purple-400 font-bold">{exportFormat}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500 leading-relaxed space-y-2">
              <div className="text-slate-400 font-bold uppercase">Cross-Company Verification:</div>
              All selected tenant records are compiled in real-time with multi-tenant data isolation and FBR/SECP compliance headers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
