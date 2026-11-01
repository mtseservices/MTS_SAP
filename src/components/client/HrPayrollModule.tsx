import React, { useState } from 'react';
import { Users, Plus, FileText, CheckCircle2, DollarSign } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_EMPLOYEES } from '../../services/mockData';
import { Employee } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const HrPayrollModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const totalPayroll = employees.reduce((acc, e) => acc + e.netSalary, 0);

  const hrSpeech = `Human Resources and Payroll for ${currentCompany.name}. Total staff headcount: ${employees.length} employees. Total monthly net payroll disbursement: ${totalPayroll.toLocaleString()} Rupees. Income tax withholdings applied per FBR tax slabs.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            HR Management & Pakistani Payroll
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Employee Profiles, CNIC Verification, Attendance, Leave Management, Income Tax Slabs (FBR), and Payslip Slip Printing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={hrSpeech} label="HR Voice Briefing" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">Active Staff Headcount</span>
          <span className="text-2xl font-black text-slate-100">{employees.length} Staff</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">Monthly Net Payroll (PKR)</span>
          <span className="text-2xl font-black text-emerald-400">Rs. {totalPayroll.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-slate-400 block text-[11px] uppercase">FBR Tax Withholding</span>
          <span className="text-2xl font-black text-cyan-400">Compliant</span>
        </div>
      </div>

      <DataTable
        title="Employee Master Register & Salary Slabs"
        data={employees}
        columns={[
          { key: 'code', header: 'Emp Code', accessor: (e) => <span className="font-mono font-bold text-cyan-400">{e.code}</span>, sortable: true },
          { key: 'fullName', header: 'Employee Name', accessor: (e) => <span className="font-bold text-slate-100">{e.fullName}</span>, sortable: true },
          { key: 'designation', header: 'Designation', accessor: (e) => e.designation, sortable: true },
          { key: 'department', header: 'Department', accessor: (e) => e.department },
          { key: 'cnic', header: 'CNIC No', accessor: (e) => <span className="font-mono text-slate-300">{e.cnic}</span> },
          { key: 'basicSalary', header: 'Basic Salary (PKR)', accessor: (e) => <span className="font-mono text-slate-300">Rs. {e.basicSalary.toLocaleString()}</span>, isNumeric: true },
          { key: 'netSalary', header: 'Net Salary (PKR)', accessor: (e) => <span className="font-mono font-bold text-emerald-400">Rs. {e.netSalary.toLocaleString()}</span>, isNumeric: true, sortable: true },
          { key: 'status', header: 'Status', accessor: (e) => (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {e.status}
            </span>
          )}
        ]}
      />
    </div>
  );
};
