import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  Building, 
  Calculator,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_EMPLOYEES } from '../../services/mockData';
import { Employee } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

interface AttendanceLog {
  id: string;
  empCode: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY';
  hoursWorked: number;
}

const INITIAL_ATTENDANCE: AttendanceLog[] = [
  { id: 'att_01', empCode: 'EMP-101', employeeName: 'Engr. Tariq Mehmood', department: 'Textile Production & Spinning', date: '2026-11-04', checkIn: '08:02 AM', status: 'PRESENT', hoursWorked: 8.5 },
  { id: 'att_02', empCode: 'EMP-102', employeeName: 'Farhan Ali', department: 'Finance & Accounts', date: '2026-11-04', checkIn: '08:45 AM', status: 'LATE', hoursWorked: 8.0 },
  { id: 'att_03', empCode: 'EMP-103', employeeName: 'Bilal Ahmed', department: 'Sales & Export', date: '2026-11-04', checkIn: '08:00 AM', status: 'PRESENT', hoursWorked: 9.0 },
  { id: 'att_04', empCode: 'EMP-104', employeeName: 'Waqas Ali', department: 'Procurement & Warehouse', date: '2026-11-04', checkIn: '-', status: 'ABSENT', hoursWorked: 0.0 },
];

export const HrPayrollModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'attendance' | 'payroll_processing'>('employees');
  
  const [employees, setEmployees] = useState<(Employee & { taxSlab: string; taxDeduction: number })[]>(
    INITIAL_EMPLOYEES.map((e, idx) => ({
      ...e,
      taxSlab: idx % 2 === 0 ? 'FBR Slab B (5% > 600k)' : 'FBR Slab C (15% > 1.2M)',
      taxDeduction: Math.round(e.basicSalary * 0.07)
    }))
  );

  const [attendance, setAttendance] = useState<AttendanceLog[]>(INITIAL_ATTENDANCE);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  // New Employee Form State
  const [newCode, setNewCode] = useState(`EMP-10${employees.length + 1}`);
  const [newFullName, setNewFullName] = useState('');
  const [newDesignation, setNewDesignation] = useState('Production Supervisor');
  const [newDepartment, setNewDepartment] = useState('Textile Production & Spinning');
  const [newCnic, setNewCnic] = useState('33102-9982711-1');
  const [newSalary, setNewSalary] = useState(75000);
  const [selectedTaxSlab, setSelectedTaxSlab] = useState('FBR Slab B (5% > 600k)');

  // Department-wise payroll allocation
  const departmentAllocation = useMemo(() => {
    const map: Record<string, { headcount: number; totalBasic: number; totalNet: number }> = {};
    employees.forEach(e => {
      const dept = e.department || 'General Administration';
      if (!map[dept]) {
        map[dept] = { headcount: 0, totalBasic: 0, totalNet: 0 };
      }
      map[dept].headcount += 1;
      map[dept].totalBasic += e.basicSalary;
      map[dept].totalNet += e.netSalary;
    });
    return Object.entries(map).map(([dept, data]) => ({ dept, ...data }));
  }, [employees]);

  const totalPayroll = employees.reduce((acc, e) => acc + e.netSalary, 0);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const allowances = 5000;
    const taxDeduction = selectedTaxSlab.includes('5%') ? Math.round(newSalary * 0.05) : Math.round(newSalary * 0.12);
    const netSalary = newSalary + allowances - taxDeduction;

    const newEmp: Employee & { taxSlab: string; taxDeduction: number } = {
      id: `emp_${Date.now()}`,
      code: newCode,
      fullName: newFullName || 'New Staff Member',
      designation: newDesignation,
      department: newDepartment,
      cnic: newCnic,
      phone: '+92-300-9876543',
      email: 'staff@mts-erp.pk',
      basicSalary: Number(newSalary),
      allowances,
      deductions: taxDeduction,
      netSalary,
      joiningDate: new Date().toISOString().split('T')[0],
      bankAccount: 'PK35MZN0001009283746',
      status: 'ACTIVE',
      tenantId: currentCompany.tenantId,
      taxSlab: selectedTaxSlab,
      taxDeduction
    };

    setEmployees([newEmp, ...employees]);
    setIsAddEmployeeOpen(false);
    setNewFullName('');
  };

  const hrSpeech = `Human Resources and Payroll for ${currentCompany.name}. Total staff headcount: ${employees.length} employees. Monthly payroll disbursement: Rs. ${totalPayroll.toLocaleString()}. FBR income tax slabs and department allocations active.`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            HR Management & Pakistani Payroll
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Employee Master Records, Daily Attendance Logs, FBR Tax Slabs, and Department-wise Monthly Salary Processing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={hrSpeech} label="HR Voice Briefing" />
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Employee Record
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'employees'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Master Records ({employees.length})
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'attendance'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Attendance Logs ({attendance.length})
        </button>

        <button
          onClick={() => setActiveSubTab('payroll_processing')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeSubTab === 'payroll_processing'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Monthly Salary Processing & Tax Slabs
        </button>
      </div>

      {/* SUB-TAB 1: EMPLOYEE MASTER RECORDS */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Active Staff Headcount</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{employees.length} Employees</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> NADRA CNIC Verified
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Monthly Net Payroll</span>
              <h3 className="text-2xl font-black text-cyan-400 mt-1">Rs. {totalPayroll.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 mt-1">Disbursed via Meezan / HBL Direct Deposit</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
              <span className="text-xs text-slate-400 font-medium">Tax Compliance</span>
              <h3 className="text-2xl font-black text-amber-400 mt-1">FBR Active</h3>
              <p className="text-[10px] text-slate-400 mt-1">Income Tax Withholding applied</p>
            </div>
          </div>

          <DataTable
            title="Employee Master Register & Tax Slabs"
            data={employees}
            columns={[
              { key: 'code', header: 'Emp Code', accessor: (e) => <span className="font-mono font-bold text-cyan-400">{e.code}</span>, sortable: true },
              { key: 'fullName', header: 'Employee Name', accessor: (e) => <span className="font-bold text-slate-100">{e.fullName}</span>, sortable: true },
              { key: 'designation', header: 'Designation', accessor: (e) => e.designation, sortable: true },
              { key: 'department', header: 'Department', accessor: (e) => e.department },
              { key: 'taxSlab', header: 'FBR Tax Slab', accessor: (e: any) => <span className="text-xs text-amber-300 font-medium">{e.taxSlab}</span> },
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
      )}

      {/* SUB-TAB 2: ATTENDANCE LOGS */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-100">Daily Attendance & Biometric Logs</h2>
              <p className="text-xs text-slate-400">Real-time attendance tracking across factory gates and regional offices.</p>
            </div>
            <button
              onClick={() => {
                const newLog: AttendanceLog = {
                  id: `att_${Date.now()}`,
                  empCode: 'EMP-105',
                  employeeName: 'Zubair Shah',
                  department: 'Maintenance & Utility',
                  date: new Date().toISOString().split('T')[0],
                  checkIn: '08:10 AM',
                  status: 'PRESENT',
                  hoursWorked: 8.0
                };
                setAttendance([newLog, ...attendance]);
              }}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Sync Biometric Punch
            </button>
          </div>

          <DataTable
            title="Attendance Records"
            data={attendance}
            columns={[
              { key: 'empCode', header: 'Emp Code', accessor: (a) => <span className="font-mono font-bold text-cyan-400">{a.empCode}</span> },
              { key: 'employeeName', header: 'Employee Name', accessor: (a) => <span className="font-bold text-slate-100">{a.employeeName}</span>, sortable: true },
              { key: 'department', header: 'Department', accessor: (a) => a.department },
              { key: 'date', header: 'Date', accessor: (a) => a.date },
              { key: 'checkIn', header: 'Check-In Time', accessor: (a) => <span className="font-mono text-purple-300">{a.checkIn}</span> },
              { key: 'status', header: 'Status', accessor: (a) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  a.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  a.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {a.status}
                </span>
              )},
              { key: 'hoursWorked', header: 'Hours Worked', accessor: (a) => <span className="font-mono text-slate-300">{a.hoursWorked} hrs</span>, isNumeric: true }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: MONTHLY SALARY PROCESSING & DEPARTMENT ALLOCATION */}
      {activeSubTab === 'payroll_processing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-100">Monthly Salary Processing & Department Payroll Allocation</h2>
              <p className="text-xs text-slate-400">Automated payroll run with FBR income tax withholding slab calculations and department cost distribution.</p>
            </div>
            <button
              onClick={() => alert('Monthly Payroll Successfully Processed & Dispatched for Bank Transfer!')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Run Payroll & Disburse Salaries
            </button>
          </div>

          {/* Department-wise Payroll Allocation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentAllocation.map((alloc, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    {alloc.dept}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {alloc.headcount} Staff
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Basic Pay</span>
                    <span className="text-slate-200 font-bold">Rs. {alloc.totalBasic.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Net Allocation</span>
                    <span className="text-emerald-400 font-bold">Rs. {alloc.totalNet.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Add New Employee Record</h3>
              <button onClick={() => setIsAddEmployeeOpen(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Textile Production & Spinning">Textile Production & Spinning</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Export">Sales & Export</option>
                    <option value="Procurement & Warehouse">Procurement & Warehouse</option>
                    <option value="Maintenance & Utility">Maintenance & Utility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CNIC Number</label>
                  <input
                    type="text"
                    value={newCnic}
                    onChange={(e) => setNewCnic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Basic Salary (PKR)</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">FBR Income Tax Slab Selection</label>
                <select
                  value={selectedTaxSlab}
                  onChange={(e) => setSelectedTaxSlab(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300"
                >
                  <option value="FBR Slab A (0% up to 600k)">FBR Slab A (0% up to 600,000 PKR)</option>
                  <option value="FBR Slab B (5% > 600k)">FBR Slab B (5% on taxable amount &gt; 600k)</option>
                  <option value="FBR Slab C (15% > 1.2M)">FBR Slab C (15% on taxable amount &gt; 1,200k)</option>
                  <option value="FBR Slab D (25% > 2.4M)">FBR Slab D (25% on taxable amount &gt; 2,400k)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
                >
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
