import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Server,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
  Globe2,
  Cpu,
  BarChart2,
  SlidersHorizontal,
  TrendingUp,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { apiAuditService, ApiAuditFilter, ApiObservabilityMetrics } from '../../services/apiAuditService';
import { ApiAuditLogEntry, ApiCategory, ApiDirection, HttpMethod } from '../../types/erp';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface SystemApiAuditViewerProps {
  onNavigateAuditInsights?: () => void;
}

export const SystemApiAuditViewer: React.FC<SystemApiAuditViewerProps> = ({ onNavigateAuditInsights }) => {
  const { allCompanies } = useAuthTenant();

  const [logs, setLogs] = useState<ApiAuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<ApiObservabilityMetrics>(apiAuditService.getObservabilityMetrics());
  const [isLivePolling, setIsLivePolling] = useState(true);
  const [isPinging, setIsPinging] = useState(false);
  const [selectedPayloadLog, setSelectedPayloadLog] = useState<ApiAuditLogEntry | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filters State
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<ApiDirection | 'ALL'>('ALL');
  const [filterMethod, setFilterMethod] = useState<HttpMethod | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | '2XX' | '4XX' | '5XX'>('ALL');
  const [filterCategory, setFilterCategory] = useState<ApiCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshData = () => {
    const filter: ApiAuditFilter = {
      tenantId: filterTenant,
      direction: filterDirection,
      method: filterMethod,
      statusGroup: filterStatus,
      category: filterCategory,
      searchQuery
    };
    setLogs(apiAuditService.getLogs(filter));
    setMetrics(apiAuditService.getObservabilityMetrics());
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = apiAuditService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [filterTenant, filterDirection, filterMethod, filterStatus, filterCategory, searchQuery]);

  // Live Auto-refresh polling timer
  useEffect(() => {
    if (!isLivePolling) return;
    const interval = setInterval(() => {
      // Periodic automatic metrics refresh
      setMetrics(apiAuditService.getObservabilityMetrics());
    }, 5000);
    return () => clearInterval(interval);
  }, [isLivePolling]);

  const handleRunSyntheticProbe = async () => {
    setIsPinging(true);
    try {
      await apiAuditService.runSyntheticProbe('albarka', '/api/v1/health/ping', 'INCOMING');
      await apiAuditService.runSyntheticProbe('master', 'https://api.fbr.gov.pk/v1/ping', 'OUTGOING');
      refreshData();
    } finally {
      setIsPinging(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Observability Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-800/40 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              System API Audit & Real-Time Observability
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Monitor incoming tenant requests, outgoing government & banking integrations (FBR e-Invoicing, Meezan Bank H2H, AI OCR), latency percentiles, and error anomalies across all client tenants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsLivePolling(!isLivePolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLivePolling
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLivePolling ? 'animate-spin' : ''}`} />
            {isLivePolling ? 'Live Polling: 5s' : 'Polling: Paused'}
          </button>

          {onNavigateAuditInsights && (
            <button
              onClick={onNavigateAuditInsights}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-bold text-xs border border-purple-500/40 shadow-lg shadow-purple-950/40 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              D3 Audit Insights
            </button>
          )}

          <button
            onClick={handleRunSyntheticProbe}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isPinging ? 'Pinging...' : 'Synthetic Diagnostic Probe'}
          </button>

          <button
            onClick={() => apiAuditService.exportLogsToCSV(logs)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => apiAuditService.exportLogsToJSON(logs)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-xs font-semibold transition-all"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* KPI Observability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Traffic</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{metrics.totalRequests.toLocaleString()} req</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
              <span className="text-cyan-400 flex items-center">
                <ArrowDownLeft className="w-3 h-3 mr-0.5" /> In: {metrics.incomingCount}
              </span>
              <span className="text-purple-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> Out: {metrics.outgoingCount}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Latency Metrics */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latency Profile</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.avgLatencyMs} ms</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              P95 Percentile: <span className="text-amber-400 font-bold">{metrics.p95LatencyMs} ms</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Success vs Error Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uptime & Error Rate</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{metrics.successRate}%</div>
            <div className="text-[11px] mt-1 font-mono">
              <span className={metrics.errorRate > 2 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                Errors: {metrics.errorRate}% (4xx: {metrics.status4xx}, 5xx: {metrics.status5xx})
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Outgoing Gateways Health */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">External Gateways</div>
            <div className="text-sm font-bold text-slate-100 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> FBR Digital Tax: OK
            </div>
            <div className="text-[11px] text-amber-300 font-mono mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Meezan H2H: High Latency
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency & Throughput Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                API Request Throughput & Average Latency (Past 45m)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Sample Interval: 5m</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.throughputTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#reqGradient)" name="Requests" />
                <Area type="monotone" dataKey="avgLatency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="Avg Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Status Code Distribution
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">{metrics.successRate}% OK</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 2xx Success
                </span>
                <span className="font-mono text-slate-300 font-bold">{metrics.status2xx} req ({metrics.successRate}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.successRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 4xx Client Error (Auth/Rate-limit)
                </span>
                <span className="font-mono text-slate-300 font-bold">{metrics.status4xx} req</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${metrics.totalRequests > 0 ? (metrics.status4xx / metrics.totalRequests) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> 5xx Gateway / Upstream Error
                </span>
                <span className="font-mono text-slate-300 font-bold">{metrics.status5xx} req</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${metrics.totalRequests > 0 ? (metrics.status5xx / metrics.totalRequests) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Service categories tags */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-2">Category Split</span>
              <div className="flex flex-wrap gap-1.5">
                {metrics.categoryBreakdown.map((c) => (
                  <span key={c.category} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                    {c.category}: {c.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Filter & Query Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">({logs.length} matching entries)</span>
          </div>

          <button
            onClick={() => {
              setFilterTenant('ALL');
              setFilterDirection('ALL');
              setFilterMethod('ALL');
              setFilterStatus('ALL');
              setFilterCategory('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Tenant Selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tenant Instance</label>
            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Client Tenants</option>
              {allCompanies.map((c) => (
                <option key={c.tenantId} value={c.tenantId}>
                  {c.name}
                </option>
              ))}
              <option value="system_master">MTS Master System</option>
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Direction</label>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Directions</option>
              <option value="INCOMING">Incoming (Client to ERP)</option>
              <option value="OUTGOING">Outgoing (ERP to External Gateways)</option>
            </select>
          </div>

          {/* HTTP Method */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">HTTP Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Status Group */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Code</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Status Codes</option>
              <option value="2XX">2xx Success (200, 201)</option>
              <option value="4XX">4xx Client Error (400, 429)</option>
              <option value="5XX">5xx Server Error (500, 503)</option>
            </select>
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="FINANCE">Finance & Accounts</option>
              <option value="TAX_FBR">FBR Digital Invoicing</option>
              <option value="BANK_GATEWAY">Banking H2H Switch</option>
              <option value="AI_OCR">AI Document OCR</option>
              <option value="AUTH">WebAuthn / Biometrics</option>
              <option value="INVENTORY">Inventory & Stock</option>
              <option value="SYSTEM">Master & AI Gateway</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Details</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Endpoint, IP, payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Request Log Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 font-mono">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-3">Flow</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Latency</th>
                <th className="py-3 px-4">Tenant Company</th>
                <th className="py-3 px-4">Client IP / ISP Gateway</th>
                <th className="py-3 px-3 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic font-sans">
                    No API telemetry logs found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                  const isClientError = log.statusCode >= 400 && log.statusCode < 500;
                  const isServerError = log.statusCode >= 500;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Time */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {log.direction === 'INCOMING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            <ArrowDownLeft className="w-3 h-3 text-cyan-400" /> IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            <ArrowUpRight className="w-3 h-3 text-purple-400" /> OUT
                          </span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : log.method === 'POST'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : log.method === 'PUT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {log.method}
                        </span>
                      </td>

                      {/* Endpoint */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-200 font-semibold" title={log.endpoint}>
                        {log.endpoint}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuccess
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isClientError
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {log.statusCode} {log.statusText}
                        </span>
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <span
                          className={`font-bold ${
                            log.latencyMs < 100
                              ? 'text-emerald-400'
                              : log.latencyMs < 300
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {log.latencyMs} ms
                        </span>
                      </td>

                      {/* Tenant */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-sans">
                        <span className="font-semibold">{log.tenantName}</span>
                      </td>

                      {/* IP / Region */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{log.clientIp}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{log.geoRegion}</div>
                      </td>

                      {/* Inspect Payload Action */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedPayloadLog(log)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Drawer / Modal */}
      {selectedPayloadLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedPayloadLog.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {selectedPayloadLog.method}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    {selectedPayloadLog.endpoint}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  {selectedPayloadLog.tenantName} • {selectedPayloadLog.latencyMs}ms • {selectedPayloadLog.statusCode} {selectedPayloadLog.statusText}
                </p>
              </div>

              <button
                onClick={() => setSelectedPayloadLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
              {/* Error Trace if available */}
              {selectedPayloadLog.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1 font-sans">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Error Exception
                  </div>
                  <div>{selectedPayloadLog.errorMessage}</div>
                </div>
              )}

              {/* Request Headers */}
              {selectedPayloadLog.headers && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 font-bold font-sans">
                    <span>HTTP Request Headers</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedPayloadLog.headers, null, 2), 'headers')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedKey === 'headers' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedPayloadLog.headers, null, 2)}
                  </pre>
                </div>
              )}

              {/* Request Payload */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 font-bold font-sans">
                  <span>Request Payload (Body / Params)</span>
                  <button
                    onClick={() => copyToClipboard(selectedPayloadLog.requestPayloadSummary || '{}', 'req')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedKey === 'req' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
                  {selectedPayloadLog.requestPayloadSummary || 'None'}
                </pre>
              </div>

              {/* Response Payload */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 font-bold font-sans">
                  <span>Response Body Payload</span>
                  <button
                    onClick={() => copyToClipboard(selectedPayloadLog.responsePayloadSummary || '{}', 'res')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedKey === 'res' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto">
                  {selectedPayloadLog.responsePayloadSummary || 'None'}
                </pre>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedPayloadLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
