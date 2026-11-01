import React, { useState } from 'react';
import { Factory, Plus, CheckCircle2, Clock, Layers } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_BOMS, INITIAL_WORK_ORDERS } from '../../services/mockData';
import { BillOfMaterials, WorkOrder } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const ProductionModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [boms, setBoms] = useState<BillOfMaterials[]>(INITIAL_BOMS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [activeTab, setActiveTab] = useState<'workOrders' | 'bom'>('workOrders');

  const productionSpeech = `Production and Manufacturing department for ${currentCompany.name}. Active Work Orders in progress: ${workOrders.length}. Bill of Materials cost calculations and WIP material consumption tracked in real time.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Factory className="w-6 h-6 text-rose-400" />
            Production & Manufacturing (BOM)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bill of Materials (BOM), Production Routing, Work Orders, Raw Material Issue, WIP Tracking, and Scrap Management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={productionSpeech} label="Production Audio" />
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('workOrders')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'workOrders' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Work Orders
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'bom' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Master BOMs
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'workOrders' && (
        <DataTable
          title="Active Factory Work Orders"
          data={workOrders}
          columns={[
            { key: 'orderNo', header: 'Work Order No', accessor: (w) => <span className="font-mono font-bold text-rose-400">{w.orderNo}</span>, sortable: true },
            { key: 'productName', header: 'Finished Product', accessor: (w) => <span className="font-bold text-slate-100">{w.productName}</span>, sortable: true },
            { key: 'plannedQty', header: 'Planned Qty', accessor: (w) => <span className="font-mono">{w.plannedQty}</span>, isNumeric: true },
            { key: 'completedQty', header: 'Completed Qty', accessor: (w) => <span className="font-mono text-emerald-400 font-bold">{w.completedQty}</span>, isNumeric: true },
            { key: 'dueDate', header: 'Due Date', accessor: (w) => w.dueDate },
            { key: 'status', header: 'Status', accessor: (w) => (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {w.status}
              </span>
            )}
          ]}
        />
      )}

      {activeTab === 'bom' && (
        <DataTable
          title="Bill of Materials (BOM) Recipes"
          data={boms}
          columns={[
            { key: 'bomCode', header: 'BOM Code', accessor: (b) => <span className="font-mono font-bold text-cyan-400">{b.bomCode}</span>, sortable: true },
            { key: 'productName', header: 'Output Product', accessor: (b) => <span className="font-bold text-slate-100">{b.productName}</span>, sortable: true },
            { key: 'outputQty', header: 'Batch Output Qty', accessor: (b) => <span className="font-mono">{b.outputQty}</span>, isNumeric: true },
            { key: 'totalCost', header: 'Total Batch Cost (PKR)', accessor: (b) => <span className="font-mono font-bold text-emerald-400">Rs. {b.totalCost.toLocaleString()}</span>, isNumeric: true, sortable: true }
          ]}
        />
      )}
    </div>
  );
};
