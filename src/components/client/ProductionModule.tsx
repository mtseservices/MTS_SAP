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
  Volume2
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_BOMS, INITIAL_WORK_ORDERS, INITIAL_PRODUCTION_TASKS } from '../../services/mockData';
import { BillOfMaterials, WorkOrder, ProductionTask } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';
import { notificationStore } from '../../services/notificationStore';

export const ProductionModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [boms, setBoms] = useState<BillOfMaterials[]>(INITIAL_BOMS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [tasks, setTasks] = useState<ProductionTask[]>(INITIAL_PRODUCTION_TASKS);
  const [activeTab, setActiveTab] = useState<'workOrders' | 'gantt' | 'bom'>('gantt');

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

    // Check if prerequisite task is completed
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

    // Update task
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

    // Re-evaluate dependent task lock statuses and trigger real-time notifications for unlocked tasks
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

    // Trigger Notification for Dependency Resolution!
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

    // Trigger Assignment Notifications
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

  const productionSpeech = `Production and Manufacturing for ${currentCompany.name}. Active Gantt workflow stages: ${tasks.length}. Sequential task dependency locks enforced in real time.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Factory className="w-6 h-6 text-rose-400" />
            Production Routing & Gantt Task Dependency Flow
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential task dependencies, Gantt timeline tracking, prerequisite locks, and WIP stage completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={productionSpeech} label="Production Audio" />
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
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
          </div>
        </div>
      </div>

      {blockedAlert && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="font-bold">{blockedAlert}</div>
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
                Tasks are strictly dependent: Stage N cannot start until Stage N-1 is 100% completed.
              </p>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Dependent Task Stage
            </button>
          </div>

          {/* Sequential Stage Cards & Gantt Bars */}
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const prereqMet = isPrerequisiteMet(task);
              const prereqTask = tasks.find((t) => t.id === task.dependsOnTaskId);

              let statusBadge = (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" /> BLOCKED
                </span>
              );

              if (task.status === 'COMPLETED') {
                statusBadge = (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> COMPLETED
                  </span>
                );
              } else if (task.status === 'IN_PROGRESS') {
                statusBadge = (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-400" /> IN PROGRESS ({task.progressPercent}%)
                  </span>
                );
              } else if (prereqMet) {
                statusBadge = (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Unlock className="w-3 h-3 text-cyan-400" /> READY TO START
                  </span>
                );
              }

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    task.status === 'COMPLETED'
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : !prereqMet
                      ? 'bg-slate-950/80 border-slate-800 opacity-80'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Task Title & Dependency info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Step {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{task.taskName}</h3>
                        {statusBadge}
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Assigned: <strong className="text-slate-200">{task.assignedTo}</strong></span>
                        <span>• Timeline: <strong className="font-mono text-slate-300">{task.startDate} to {task.dueDate}</strong></span>
                      </div>

                      {/* Dependency Badge */}
                      {prereqTask && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-slate-400">Prerequisite Dependency:</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                              prereqTask.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {prereqTask.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Lock className="w-3 h-3 text-rose-400" />
                            )}
                            {prereqTask.taskName} ({prereqTask.status})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Control Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div
                          className={`h-full transition-all duration-500 ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-500'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!prereqMet ? (
                          <button
                            onClick={() =>
                              handleUpdateTaskProgress(task.id, task.progressPercent + 25)
                            }
                            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-bold text-xs flex items-center gap-1 opacity-60 cursor-not-allowed"
                            title="Prerequisite task incomplete"
                          >
                            <Lock className="w-3.5 h-3.5" /> Blocked
                          </button>
                        ) : task.status === 'COMPLETED' ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Fully Completed
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateTaskProgress(task.id, Math.min(75, task.progressPercent + 30))}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                            >
                              <Play className="w-3.5 h-3.5" /> Advance Stage (+30%)
                            </button>
                            <button
                              onClick={() => handleUpdateTaskProgress(task.id, 100)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all"
                            >
                              <CheckSquare className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                          </>
                        )}
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
          title="Active Factory Work Orders"
          data={workOrders}
          columns={[
            {
              key: 'orderNo',
              header: 'Work Order No',
              accessor: (w) => <span className="font-mono font-bold text-rose-400">{w.orderNo}</span>,
              sortable: true
            },
            {
              key: 'productName',
              header: 'Finished Product',
              accessor: (w) => <span className="font-bold text-slate-100">{w.productName}</span>,
              sortable: true
            },
            {
              key: 'plannedQty',
              header: 'Planned Qty',
              accessor: (w) => <span className="font-mono">{w.plannedQty}</span>,
              isNumeric: true
            },
            {
              key: 'completedQty',
              header: 'Completed Qty',
              accessor: (w) => <span className="font-mono text-emerald-400 font-bold">{w.completedQty}</span>,
              isNumeric: true
            },
            { key: 'dueDate', header: 'Due Date', accessor: (w) => w.dueDate },
            {
              key: 'status',
              header: 'Status',
              accessor: (w) => (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  {w.status}
                </span>
              )
            }
          ]}
        />
      )}

      {/* MASTER BOMS TAB */}
      {activeTab === 'bom' && (
        <DataTable
          title="Bill of Materials (BOM) Recipes"
          data={boms}
          columns={[
            {
              key: 'bomCode',
              header: 'BOM Code',
              accessor: (b) => <span className="font-mono font-bold text-cyan-400">{b.bomCode}</span>,
              sortable: true
            },
            {
              key: 'productName',
              header: 'Output Product',
              accessor: (b) => <span className="font-bold text-slate-100">{b.productName}</span>,
              sortable: true
            },
            {
              key: 'outputQty',
              header: 'Batch Output Qty',
              accessor: (b) => <span className="font-mono">{b.outputQty}</span>,
              isNumeric: true
            },
            {
              key: 'totalCost',
              header: 'Total Batch Cost (PKR)',
              accessor: (b) => <span className="font-mono font-bold text-emerald-400">Rs. {b.totalCost.toLocaleString()}</span>,
              isNumeric: true,
              sortable: true
            }
          ]}
        />
      )}

      {/* Create Dependent Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-rose-400">
                Create Dependent Task Stage
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
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
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                >
                  Save Task Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
