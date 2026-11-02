import React, { useState, useEffect } from 'react';
import {
  Factory,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Unlock,
  AlertTriangle,
  GitCommit,
  ArrowRight,
  Play,
  CheckSquare,
  Sparkles,
  Calendar,
  Bell,
  Volume2,
  Users,
  Cpu,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_BOMS, INITIAL_WORK_ORDERS, INITIAL_PRODUCTION_TASKS } from '../../services/mockData';
import { BillOfMaterials, WorkOrder, ProductionTask } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { notificationStore } from '../../services/notificationStore';

export interface HumanResource {
  id: string;
  name: string;
  role: string;
  maxHoursPerWeek: number;
  allocatedHours: number;
  department: string;
}

export interface MachineResource {
  id: string;
  name: string;
  type: string;
  maxHoursPerWeek: number;
  allocatedHours: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'IDLE';
}

export const ProductionModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [boms, setBoms] = useState<BillOfMaterials[]>(INITIAL_BOMS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [tasks, setTasks] = useState<ProductionTask[]>(INITIAL_PRODUCTION_TASKS);
  const [activeTab, setActiveTab] = useState<'workOrders' | 'gantt' | 'bom' | 'recurring' | 'capacity'>('capacity');

  // Resource Capacity Planner State
  const [humanResources, setHumanResources] = useState<HumanResource[]>([
    { id: 'hr_1', name: 'Aslam (Senior Machinist)', role: 'Operator', maxHoursPerWeek: 40, allocatedHours: 38, department: 'Machining Line' },
    { id: 'hr_2', name: 'Tariq (QA Supervisor)', role: 'Inspector', maxHoursPerWeek: 40, allocatedHours: 32, department: 'Quality Control' },
    { id: 'hr_3', name: 'Bilal (Plant Supervisor)', role: 'Supervisor', maxHoursPerWeek: 40, allocatedHours: 42, department: 'Assembly Plant' },
    { id: 'hr_4', name: 'Rashid (Master Welder)', role: 'Welder', maxHoursPerWeek: 40, allocatedHours: 36, department: 'Fabrication' }
  ]);

  const [machineResources, setMachineResources] = useState<MachineResource[]>([
    { id: 'm_1', name: 'CNC Milling Machine #01', type: 'Machining', maxHoursPerWeek: 60, allocatedHours: 55, status: 'OPERATIONAL' },
    { id: 'm_2', name: 'Hydraulic Press #04', type: 'Pressing', maxHoursPerWeek: 60, allocatedHours: 48, status: 'OPERATIONAL' },
    { id: 'm_3', name: 'Automated Assembly Line #2', type: 'Assembly', maxHoursPerWeek: 80, allocatedHours: 78, status: 'OPERATIONAL' },
    { id: 'm_4', name: 'Laser Cutting Unit #02', type: 'Cutting', maxHoursPerWeek: 50, allocatedHours: 52, status: 'MAINTENANCE' }
  ]);

  const [recurringRules, setRecurringRules] = useState([
    { id: 'rec_1', taskName: 'Daily Plant Equipment Maintenance & Lubrication', interval: 'DAILY', assignedTo: 'Maintenance Chief Aslam', nextRun: '2026-11-02 08:00 AM', status: 'ACTIVE' },
    { id: 'rec_2', taskName: 'Weekly Quality Assurance & FBR Compliance Reporting', interval: 'WEEKLY', assignedTo: 'QA Officer Tariq', nextRun: '2026-11-08 09:00 AM', status: 'ACTIVE' },
    { id: 'rec_3', taskName: 'Monthly Warehouse Stock Audit & Reconciliation', interval: 'MONTHLY', assignedTo: 'Inventory Manager Bilal', nextRun: '2026-12-01 10:00 AM', status: 'ACTIVE' }
  ]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [newRecName, setNewRecName] = useState('Daily Boiler Safety Inspection');
  const [newRecInterval, setNewRecInterval] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [newRecAssignee, setNewRecAssignee] = useState('Chief Engineer Aslam');

  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('Stage 6: Final QA Audit & Dispatch Staging');
  const [newAssignedTo, setNewAssignedTo] = useState('Quality Supervisor Tariq');
  const [newDependsOn, setNewDependsOn] = useState<string | null>('pt_05');
  const [newStartDate, setNewStartDate] = useState('2026-11-02');
  const [newDueDate, setNewDueDate] = useState('2026-11-04');

  const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
  const [recentNotificationFeed, setRecentNotificationFeed] = useState<string[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
    }
  };

  const triggerBrowserAlert = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/public/pwa-192x192.png' });
      } catch (err) {
        console.warn('Browser Notification error:', err);
      }
    }
  };

  // Helper to check if a task's prerequisite is satisfied
  const isPrerequisiteMet = (task: ProductionTask): boolean => {
    if (!task.dependsOnTaskId) return true;
    const prereq = tasks.find((t) => t.id === task.dependsOnTaskId);
    return prereq ? prereq.status === 'COMPLETED' || prereq.progressPercent === 100 : true;
  };

  // Handle advancing or completing a task stage
  const handleUpdateTaskProgress = async (taskId: string, newProgress: number) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (targetTask.dependsOnTaskId) {
      const prereq = tasks.find((t) => t.id === targetTask.dependsOnTaskId);
      if (prereq && (prereq.status !== 'COMPLETED' && prereq.progressPercent < 100)) {
        setBlockedAlert(
          `BLOCKED ENTRY: "${targetTask.taskName}" cannot start because prerequisite task "${prereq.taskName}" is not 100% COMPLETED!`
        );
        setTimeout(() => setBlockedAlert(null), 5000);
        return;
      }
    }

    const isNowCompleted = newProgress >= 100;

    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          progressPercent: Math.min(100, newProgress),
          status: isNowCompleted ? ('COMPLETED' as const) : ('IN_PROGRESS' as const)
        };
      }
      return t;
    });

    const unlockedTaskNames: string[] = [];

    const finalTasks = updatedTasks.map((t) => {
      if (t.dependsOnTaskId) {
        const p = updatedTasks.find((parent) => parent.id === t.dependsOnTaskId);
        if (p && (p.status === 'COMPLETED' || p.progressPercent === 100) && t.status === 'BLOCKED') {
          unlockedTaskNames.push(t.taskName);
          return { ...t, status: 'READY_TO_START' as const };
        }
      }
      return t;
    });

    setTasks(finalTasks);

    if (isNowCompleted) {
      const feedMsg = `Stage Completed: "${targetTask.taskName}" finished 100%.`;
      setRecentNotificationFeed((prev) => [feedMsg, ...prev]);

      await notificationStore.addNotification({
        tenantId: currentCompany.tenantId,
        title: 'Stage Completed in Production',
        message: `Stage "${targetTask.taskName}" marked 100% COMPLETED for Work Order #${targetTask.orderNo}.`,
        type: 'SYSTEM',
        severity: 'INFO',
        targetTab: 'production'
      });
    }

    if (unlockedTaskNames.length > 0) {
      for (const unName of unlockedTaskNames) {
        const unMsg = `⚡ Task Dependency Unlocked! Stage "${unName}" is now UNLOCKED & READY TO START.`;
        setRecentNotificationFeed((prev) => [unMsg, ...prev]);

        triggerBrowserAlert('⚡ Production Task Unlocked!', `Stage "${unName}" is now unlocked and ready to start.`);

        await notificationStore.addNotification({
          tenantId: currentCompany.tenantId,
          title: 'Task Dependency Unlocked!',
          message: `Stage "${unName}" is now UNLOCKED & READY TO START for Work Order #${targetTask.orderNo}.`,
          type: 'SYSTEM',
          severity: 'HIGH',
          targetTab: 'production'
        });
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const prereqMet = newDependsOn
      ? tasks.find((t) => t.id === newDependsOn)?.status === 'COMPLETED'
      : true;

    const newTask: ProductionTask = {
      id: `pt_${Date.now()}`,
      workOrderId: 'wo_01',
      orderNo: 'WO-2026-088',
      taskName: newTaskName,
      assignedTo: newAssignedTo,
      dependsOnTaskId: newDependsOn || null,
      startDate: newStartDate,
      dueDate: newDueDate,
      progressPercent: 0,
      status: prereqMet ? 'READY_TO_START' : 'BLOCKED',
      tenantId: currentCompany.tenantId
    };

    setTasks([...tasks, newTask]);
    setShowTaskModal(false);

    const assignMsg = `📋 New Task Assigned: "${newTaskName}" assigned to ${newAssignedTo}.`;
    setRecentNotificationFeed((prev) => [assignMsg, ...prev]);

    triggerBrowserAlert('📋 New Task Assigned', `"${newTaskName}" assigned to ${newAssignedTo}.`);

    await notificationStore.addNotification({
      tenantId: currentCompany.tenantId,
      title: 'New Production Task Assigned',
      message: `Task "${newTaskName}" assigned to ${newAssignedTo} for Work Order #${newTask.orderNo}.`,
      type: 'SYSTEM',
      severity: 'MEDIUM',
      targetTab: 'production'
    });
  };

  const handleCreateRecurringRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule = {
      id: `rec_${Date.now()}`,
      taskName: newRecName,
      interval: newRecInterval,
      assignedTo: newRecAssignee,
      nextRun: new Date(Date.now() + 86400000).toISOString().replace('T', ' ').slice(0, 16),
      status: 'ACTIVE'
    };
    setRecurringRules([...recurringRules, newRule]);

    const autoTask: ProductionTask = {
      id: `pt_${Date.now()}`,
      workOrderId: 'wo_01',
      orderNo: `REC-${newRecInterval}-${Date.now().toString().slice(-4)}`,
      taskName: `${newRecName} (${newRecInterval} Recurring)`,
      assignedTo: newRecAssignee,
      dependsOnTaskId: null,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      progressPercent: 0,
      status: 'READY_TO_START',
      tenantId: currentCompany.tenantId
    };
    setTasks([autoTask, ...tasks]);
    setShowRecurringModal(false);
  };

  const productionSpeech = `Resource Capacity Planner & Production Routing for ${currentCompany.name}. Human and machine workload visualized against project deadlines.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Factory className="w-6 h-6 text-rose-400" />
            Production Routing & Resource Capacity Planner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize human and machine workload against project deadlines to optimize scheduling for {currentCompany.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={productionSpeech} label="Production Audio" />
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'capacity' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resource Capacity
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'gantt' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gantt Task Flow
            </button>
            <button
              onClick={() => setActiveTab('workOrders')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'workOrders' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Work Orders
            </button>
            <button
              onClick={() => setActiveTab('bom')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'bom' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Master BOMs
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'recurring' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recurring Schedules
            </button>
          </div>
        </div>
      </div>

      {blockedAlert && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="font-bold">{blockedAlert}</div>
        </div>
      )}

      {/* RESOURCE CAPACITY PLANNER TAB */}
      {activeTab === 'capacity' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Human & Machine Workload vs. Project Deadlines
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time capacity utilization tracking to prevent bottlenecks and optimize plant shift scheduling.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Plant Capacity: Optimal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Human Resources Workload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Human Resources Workload
                </h3>
                <span className="text-xs text-cyan-400 font-mono">4 Operators / Supervisors</span>
              </div>

              <div className="space-y-4">
                {humanResources.map((hr) => {
                  const percent = Math.round((hr.allocatedHours / hr.maxHoursPerWeek) * 100);
                  const isOverloaded = percent > 100;
                  return (
                    <div key={hr.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-100">{hr.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{hr.role} • {hr.department}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isOverloaded ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          percent > 90 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {percent}% Allocated
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverloaded ? 'bg-rose-500' :
                            percent > 90 ? 'bg-amber-500' :
                            'bg-gradient-to-r from-cyan-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Allocated: {hr.allocatedHours} hrs / wk</span>
                        <span>Capacity Limit: {hr.maxHoursPerWeek} hrs / wk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Machine Resources Workload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> Machine & Equipment Capacity
                </h3>
                <span className="text-xs text-purple-400 font-mono">4 Heavy Machines</span>
              </div>

              <div className="space-y-4">
                {machineResources.map((mach) => {
                  const percent = Math.round((mach.allocatedHours / mach.maxHoursPerWeek) * 100);
                  const isMaintenance = mach.status === 'MAINTENANCE';
                  return (
                    <div key={mach.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-100">{mach.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Type: {mach.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMaintenance ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {mach.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {percent}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMaintenance ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Running: {mach.allocatedHours} hrs / wk</span>
                        <span>Max Runtime: {mach.maxHoursPerWeek} hrs / wk</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GANTT TASK FLOW TAB */}
      {activeTab === 'gantt' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <GitCommit className="w-5 h-5" />
                Work Order #WO-2026-088 Sequential Stage Dependencies
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each production stage must reach 100% completion before downstream dependant tasks automatically unlock.
              </p>
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Production Stage
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => {
              const prereqMet = isPrerequisiteMet(task);
              const isLocked = task.status === 'BLOCKED' || !prereqMet;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : isLocked
                      ? 'bg-slate-900/60 border-rose-500/30 opacity-80'
                      : 'bg-slate-900 border-slate-800 shadow-xl'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl mt-0.5 ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                        isLocked ? 'bg-rose-500/20 text-rose-400' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {task.status === 'COMPLETED' ? <CheckSquare className="w-5 h-5" /> :
                         isLocked ? <Lock className="w-5 h-5" /> :
                         <Unlock className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-rose-400">Stage #{index + 1}</span>
                          <h3 className="text-sm font-black text-slate-100">{task.taskName}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Assigned to: <strong className="text-slate-200">{task.assignedTo}</strong> • Timeline: <span className="font-mono text-cyan-400">{task.startDate} → {task.dueDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        task.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        isLocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isLocked ? 'BLOCKED (PREREQUISITE PENDING)' : task.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Slider Controls */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Stage Progress</span>
                      <span className="font-bold text-slate-200">{task.progressPercent}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                          }`}
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={isLocked && task.progressPercent === 0}
                          onClick={() => handleUpdateTaskProgress(task.id, 0)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 disabled:opacity-40 cursor-pointer"
                        >
                          0%
                        </button>
                        <button
                          disabled={isLocked}
                          onClick={() => handleUpdateTaskProgress(task.id, 50)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-cyan-300 disabled:opacity-40 cursor-pointer"
                        >
                          50%
                        </button>
                        <button
                          disabled={isLocked}
                          onClick={() => handleUpdateTaskProgress(task.id, 100)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white shadow-md disabled:opacity-40 cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete (100%)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WORK ORDERS TAB */}
      {activeTab === 'workOrders' && (
        <DataTable
          title="Active Production Work Orders"
          data={workOrders}
          columns={[
            { key: 'orderNo', header: 'Order No', accessor: (w) => <span className="font-bold text-rose-400 font-mono">{w.orderNo}</span>, sortable: true },
            { key: 'productName', header: 'Product Name', accessor: (w) => <span className="font-bold text-slate-100">{w.productName}</span>, sortable: true },
            { key: 'plannedQty', header: 'Planned Qty', accessor: (w) => <span className="text-cyan-400 font-mono font-bold">{w.plannedQty} units</span> },
            { key: 'completedQty', header: 'Completed Qty', accessor: (w) => <span className="text-emerald-400 font-mono font-bold">{w.completedQty} units</span> },
            { key: 'dates', header: 'Timeline', accessor: (w) => <span className="font-mono text-slate-300 text-xs">{w.startDate} → {w.dueDate}</span> },
            {
              key: 'status',
              header: 'Status',
              accessor: (w) => (
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {w.status}
                </span>
              )
            }
          ]}
        />
      )}

      {/* MASTER BOMS TAB */}
      {activeTab === 'bom' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boms.map((bom) => (
              <div key={bom.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{bom.productName}</h3>
                    <div className="text-xs text-rose-400 font-mono">{bom.bomCode} • Output: {bom.outputQty} units</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 font-mono text-xs font-bold border border-rose-500/20">
                    Total Cost: Rs. {bom.totalCost.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Component Raw Materials:</div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {bom.components.map((c, i) => (
                      <div key={i} className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                        <span>{c.itemName}</span>
                        <span className="text-cyan-400">{c.qtyRequired} units (Rs. {c.unitCost}/unit)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                  <span>Labor Cost: Rs. {bom.laborCost.toLocaleString()}</span>
                  <span>Overhead: Rs. {bom.overheadCost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECURRING SCHEDULES TAB */}
      {activeTab === 'recurring' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Automated Recurring Production Task Schedules
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define recurring maintenance or reporting intervals (Daily, Weekly, Monthly) that auto-generate entries in the production timeline.
              </p>
            </div>
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Recurring Rule
            </button>
          </div>

          <DataTable
            title="Active Recurring Task Schedules"
            data={recurringRules}
            columns={[
              {
                key: 'taskName',
                header: 'Recurring Task Name',
                accessor: (r) => <span className="font-bold text-slate-100">{r.taskName}</span>,
                sortable: true
              },
              {
                key: 'interval',
                header: 'Scheduling Interval',
                accessor: (r) => (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {r.interval}
                  </span>
                )
              },
              {
                key: 'assignedTo',
                header: 'Assigned Operator',
                accessor: (r) => <span className="text-slate-300">{r.assignedTo}</span>
              },
              {
                key: 'nextRun',
                header: 'Next Auto-Scheduled Run',
                accessor: (r) => <span className="font-mono text-cyan-400">{r.nextRun}</span>
              },
              {
                key: 'status',
                header: 'Status',
                accessor: (r) => (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {r.status}
                  </span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400">
                Add Production Stage & Dependency Lock
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task / Stage Title</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prerequisite Task Dependency</label>
                <select
                  value={newDependsOn || ''}
                  onChange={(e) => setNewDependsOn(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                >
                  <option value="">No Prerequisite (Can Start Immediately)</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      Depends on: {t.taskName} ({t.status})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  This task will remain BLOCKED until the selected prerequisite stage reaches 100% completion.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Operator / Team</label>
                <input
                  type="text"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Save Task Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Recurring Schedule Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400">
                Create Recurring Task Schedule
              </h3>
              <button
                onClick={() => setShowRecurringModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecurringRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduling Interval</label>
                <select
                  value={newRecInterval}
                  onChange={(e) => setNewRecInterval(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold"
                >
                  <option value="DAILY">Daily Maintenance</option>
                  <option value="WEEKLY">Weekly Reporting & Audit</option>
                  <option value="MONTHLY">Monthly Reconciliation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Operator / Department</label>
                <input
                  type="text"
                  value={newRecAssignee}
                  onChange={(e) => setNewRecAssignee(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Save & Auto-Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
