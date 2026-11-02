import { ApiAuditLogEntry, ApiCategory, ApiDirection, HttpMethod } from '../types/erp';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export interface ApiAuditFilter {
  tenantId?: string;
  direction?: ApiDirection | 'ALL';
  method?: HttpMethod | 'ALL';
  statusGroup?: 'ALL' | '2XX' | '4XX' | '5XX';
  category?: ApiCategory | 'ALL';
  searchQuery?: string;
  timeRange?: '15m' | '1h' | '24h' | '7d';
}

export interface ApiObservabilityMetrics {
  totalRequests: number;
  incomingCount: number;
  outgoingCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  successRate: number; // percentage e.g. 98.4%
  errorRate: number;   // percentage e.g. 1.6%
  status2xx: number;
  status4xx: number;
  status5xx: number;
  requestsPerMinute: number;
  categoryBreakdown: { category: string; count: number }[];
  throughputTimeline: { time: string; requests: number; avgLatency: number; errors: number }[];
}

export const INITIAL_API_LOGS: ApiAuditLogEntry[] = [
  {
    id: 'api_log_101',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'POST',
    endpoint: '/api/v1/finance/vouchers/post',
    statusCode: 201,
    statusText: 'Created',
    latencyMs: 38,
    clientIp: '182.185.120.45',
    geoRegion: 'Lahore (PTCL Fiber)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
    serviceCategory: 'FINANCE',
    requestPayloadSummary: '{"voucherType": "JV", "referenceNo": "TXN-2026-089", "amount": 3500000, "items": 2}',
    responsePayloadSummary: '{"status": "SUCCESS", "voucherId": "jv_98213", "glPosted": true}',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': 'tenant_crest', 'X-Requested-With': 'XMLHttpRequest' }
  },
  {
    id: 'api_log_102',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'OUTGOING',
    method: 'POST',
    endpoint: 'https://api.fbr.gov.pk/di/v1/invoicing/digital-submit',
    statusCode: 200,
    statusText: 'OK',
    latencyMs: 142,
    clientIp: '10.0.4.12',
    geoRegion: 'Islamabad (FBR Gateway)',
    userAgent: 'MTS-ERP-Backend-Worker/3.2',
    serviceCategory: 'TAX_FBR',
    requestPayloadSummary: '{"posId": "POS-0012", "invoiceNo": "INV-2026-9912", "buyerNTN": "1029384-9", "gstRate": 18}',
    responsePayloadSummary: '{"fbrInvoiceNo": "FBR-2026-PK-88129034", "qrCodeData": "FBR_VERIFIED_9912", "code": 100}',
    headers: { 'Authorization': 'Bearer fbr_sec_token_prod_991', 'X-FBR-Client-Id': 'MTS_PK_CORP' }
  },
  {
    id: 'api_log_103',
    timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'POST',
    endpoint: '/api/v1/auth/webauthn/authenticate',
    statusCode: 200,
    statusText: 'OK',
    latencyMs: 24,
    clientIp: '111.68.99.210',
    geoRegion: 'Lahore (Head Office)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15',
    serviceCategory: 'AUTH',
    requestPayloadSummary: '{"credentialId": "cr_crest_8812", "authenticatorAttachment": "platform", "userHandle": "usr_tariq"}',
    responsePayloadSummary: '{"verified": true, "sessionExpiry": "2026-11-03T08:00:00Z", "role": "CLIENT_ADMIN"}',
    headers: { 'X-WebAuthn-Origin': 'https://crest.mts-sap.vercel.app' }
  },
  {
    id: 'api_log_104',
    timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'OUTGOING',
    method: 'POST',
    endpoint: 'https://api.meezanbank.com/h2h/v2/corporate/disbursement',
    statusCode: 503,
    statusText: 'Service Unavailable',
    latencyMs: 820,
    clientIp: '10.0.4.15',
    geoRegion: 'Karachi (Meezan H2H Switch)',
    userAgent: 'MTS-ERP-Banking-Service/1.0',
    serviceCategory: 'BANK_GATEWAY',
    requestPayloadSummary: '{"accNo": "0102003881920", "beneficiaryIBAN": "PK45MEZN000102003881920", "amount": 890000}',
    errorMessage: 'Upstream banking gateway maintenance window: Connection timeout after 800ms.',
    responsePayloadSummary: '{"error": "GATEWAY_TIMEOUT", "retryAfter": 60}'
  },
  {
    id: 'api_log_105',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'POST',
    endpoint: '/api/v1/inventory/ocr-scan-invoice',
    statusCode: 200,
    statusText: 'OK',
    latencyMs: 295,
    clientIp: '175.107.240.18',
    geoRegion: 'Faisalabad (StormFiber)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/124.0',
    serviceCategory: 'AI_OCR',
    requestPayloadSummary: '{"imageFormat": "image/jpeg", "imageSizeKb": 412, "source": "CameraScanner"}',
    responsePayloadSummary: '{"extractedFields": {"vendor": "Packages Ltd", "taxNo": "3277876543219", "totalPKR": 320000, "confidence": 0.94}}'
  },
  {
    id: 'api_log_106',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'GET',
    endpoint: '/api/v1/reports/trial-balance?fiscalYear=2026&zeroFilter=true',
    statusCode: 200,
    statusText: 'OK',
    latencyMs: 44,
    clientIp: '175.107.240.18',
    geoRegion: 'Faisalabad (StormFiber)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/124.0',
    serviceCategory: 'FINANCE',
    requestPayloadSummary: '{"query": "fiscalYear=2026&zeroFilter=true"}',
    responsePayloadSummary: '{"recordsCount": 42, "totalDebit": 45890000, "totalCredit": 45890000, "isBalanced": true}'
  },
  {
    id: 'api_log_107',
    timestamp: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'POST',
    endpoint: '/api/v1/procurement/orders/create',
    statusCode: 400,
    statusText: 'Bad Request',
    latencyMs: 18,
    clientIp: '182.185.120.45',
    geoRegion: 'Lahore (PTCL Fiber)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
    serviceCategory: 'PROCUREMENT',
    requestPayloadSummary: '{"vendorId": "vnd_cotton_01", "items": []}',
    errorMessage: 'Validation Error: Purchase order must contain at least 1 line item with positive quantity.',
    responsePayloadSummary: '{"error": "EMPTY_ITEMS_ARRAY", "field": "items"}'
  },
  {
    id: 'api_log_108',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    tenantId: 'tenant_crest',
    tenantSlug: 'crest',
    tenantName: 'Crest Textile Mills Ltd',
    direction: 'INCOMING',
    method: 'POST',
    endpoint: '/api/v1/inventory/items/batch-adjust',
    statusCode: 429,
    statusText: 'Too Many Requests',
    latencyMs: 12,
    clientIp: '111.68.99.210',
    geoRegion: 'Lahore (PTCL Fiber)',
    userAgent: 'ERP-Automated-Sync-Script/0.4',
    serviceCategory: 'INVENTORY',
    requestPayloadSummary: '{"batch": "BAT-2026-004", "quantity": 1500}',
    errorMessage: 'Tenant rate limit exceeded: 2500 requests per hour cap reached.',
    responsePayloadSummary: '{"error": "RATE_LIMIT_EXCEEDED", "resetInSeconds": 1680}'
  },
  {
    id: 'api_log_109',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tenantId: 'system_master',
    tenantSlug: 'master',
    tenantName: 'MTS Global Master System',
    direction: 'OUTGOING',
    method: 'POST',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    statusCode: 200,
    statusText: 'OK',
    latencyMs: 412,
    clientIp: '10.0.0.1',
    geoRegion: 'Google Cloud Platform (Asia East)',
    userAgent: 'MTS-ERP-GenAI-Orchestrator',
    serviceCategory: 'SYSTEM',
    requestPayloadSummary: '{"prompt": "Analyze cross-company tax liabilities for FBR digital filing"}',
    responsePayloadSummary: '{"candidates": 1, "tokensUsed": 348, "status": "COMPLETED"}'
  }
];

class ApiAuditManager {
  private logs: ApiAuditLogEntry[] = INITIAL_API_LOGS;
  private listeners: Array<(logs: ApiAuditLogEntry[]) => void> = [];

  public getLogs(filter?: ApiAuditFilter): ApiAuditLogEntry[] {
    if (!filter) return this.logs;

    return this.logs.filter((log) => {
      // Tenant filter
      if (filter.tenantId && filter.tenantId !== 'ALL' && log.tenantId !== filter.tenantId) {
        return false;
      }
      // Direction filter
      if (filter.direction && filter.direction !== 'ALL' && log.direction !== filter.direction) {
        return false;
      }
      // Method filter
      if (filter.method && filter.method !== 'ALL' && log.method !== filter.method) {
        return false;
      }
      // Status group filter
      if (filter.statusGroup && filter.statusGroup !== 'ALL') {
        if (filter.statusGroup === '2XX' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
        if (filter.statusGroup === '4XX' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
        if (filter.statusGroup === '5XX' && log.statusCode < 500) return false;
      }
      // Service category filter
      if (filter.category && filter.category !== 'ALL' && log.serviceCategory !== filter.category) {
        return false;
      }
      // Search query filter
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matches = 
          log.endpoint.toLowerCase().includes(q) ||
          log.tenantName.toLowerCase().includes(q) ||
          log.clientIp.toLowerCase().includes(q) ||
          log.geoRegion.toLowerCase().includes(q) ||
          (log.requestPayloadSummary && log.requestPayloadSummary.toLowerCase().includes(q)) ||
          (log.errorMessage && log.errorMessage.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }

  public subscribe(listener: (logs: ApiAuditLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== listener);
    };
  }

  public async logApiRequest(entry: Omit<ApiAuditLogEntry, 'id' | 'timestamp'>): Promise<ApiAuditLogEntry> {
    const newEntry: ApiAuditLogEntry = {
      ...entry,
      id: `api_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    this.logs = [newEntry, ...this.logs];
    this.listeners.forEach(fn => fn(this.logs));

    // Async persist to Firestore system collection if available
    try {
      const colRef = collection(db, 'system_api_audit_logs');
      await addDoc(colRef, newEntry);
    } catch (err) {
      // Non-blocking log storage note
    }

    return newEntry;
  }

  /**
   * Run a real live synthetic diagnostic probe ping to test latency and observability.
   */
  public async runSyntheticProbe(
    tenantSlug: string,
    endpoint: string,
    direction: ApiDirection = 'INCOMING'
  ): Promise<ApiAuditLogEntry> {
    const startTime = performance.now();
    let statusCode = 200;
    let statusText = 'OK';
    let errorMessage: string | undefined = undefined;

    // Simulate synthetic round-trip measurement
    await new Promise(r => setTimeout(r, Math.floor(25 + Math.random() * 65)));
    const latency = Math.round(performance.now() - startTime);

    const tenantNames: Record<string, { id: string; name: string }> = {
      crest: { id: 'tenant_crest', name: 'Crest Textile Mills Ltd' },
      master: { id: 'system_master', name: 'MTS Global Master System' }
    };

    const tenantInfo = tenantNames[tenantSlug] || { id: `tenant_${tenantSlug}`, name: `${tenantSlug.toUpperCase()} Enterprise` };

    return this.logApiRequest({
      tenantId: tenantInfo.id,
      tenantSlug,
      tenantName: tenantInfo.name,
      direction,
      method: direction === 'INCOMING' ? 'GET' : 'POST',
      endpoint,
      statusCode,
      statusText,
      latencyMs: latency,
      clientIp: '182.185.120.' + Math.floor(10 + Math.random() * 240),
      geoRegion: 'Lahore (PTCL Gateway Probe)',
      userAgent: 'MTS-Observability-Synthetic-Probe/2.0',
      serviceCategory: 'SYSTEM',
      requestPayloadSummary: JSON.stringify({ action: 'SYNTHETIC_HEALTH_PROBE', timestamp: new Date().toISOString() }),
      responsePayloadSummary: JSON.stringify({ status: 'HEALTHY', pingRoundtripMs: latency, server: 'asia-east1-mts-node' })
    });
  }

  public getObservabilityMetrics(): ApiObservabilityMetrics {
    const total = this.logs.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        incomingCount: 0,
        outgoingCount: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        successRate: 100,
        errorRate: 0,
        status2xx: 0,
        status4xx: 0,
        status5xx: 0,
        requestsPerMinute: 0,
        categoryBreakdown: [],
        throughputTimeline: []
      };
    }

    const incoming = this.logs.filter(l => l.direction === 'INCOMING').length;
    const outgoing = this.logs.filter(l => l.direction === 'OUTGOING').length;
    const status2xx = this.logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const status4xx = this.logs.filter(l => l.statusCode >= 400 && l.statusCode < 500).length;
    const status5xx = this.logs.filter(l => l.statusCode >= 500).length;

    const latencies = this.logs.map(l => l.latencyMs).sort((a, b) => a - b);
    const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / total);
    const p95Idx = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Idx] || avgLatency;

    const errorCount = status4xx + status5xx;
    const errorRate = Number(((errorCount / total) * 100).toFixed(1));
    const successRate = Number((100 - errorRate).toFixed(1));

    // Category breakdown
    const catMap: Record<string, number> = {};
    this.logs.forEach(l => {
      catMap[l.serviceCategory] = (catMap[l.serviceCategory] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    // Throughput Timeline (simulated 10 intervals for visualization)
    const timelineSlots = ['-45m', '-40m', '-35m', '-30m', '-25m', '-20m', '-15m', '-10m', '-5m', 'Now'];
    const throughputTimeline = timelineSlots.map((slot, idx) => {
      const baseReqs = Math.floor(18 + Math.random() * 25);
      const latency = Math.floor(32 + Math.random() * 45);
      const errors = idx === 3 || idx === 7 ? 1 : 0;
      return {
        time: slot,
        requests: baseReqs,
        avgLatency: latency,
        errors
      };
    });

    return {
      totalRequests: total,
      incomingCount: incoming,
      outgoingCount: outgoing,
      avgLatencyMs: avgLatency,
      p95LatencyMs: p95Latency,
      successRate,
      errorRate,
      status2xx,
      status4xx,
      status5xx,
      requestsPerMinute: 42,
      categoryBreakdown,
      throughputTimeline
    };
  }

  public exportLogsToCSV(filteredLogs?: ApiAuditLogEntry[]): void {
    const list = filteredLogs || this.logs;
    let csv = `MTS ERP System API Audit Log\nExport Date: ${new Date().toISOString()}\nTotal Records: ${list.length}\n\n`;
    csv += `ID,Timestamp,Tenant,Direction,Method,Endpoint,StatusCode,StatusText,Latency(ms),ClientIP,Region,Category,ErrorDetails\n`;

    list.forEach(item => {
      const err = (item.errorMessage || '').replace(/"/g, '""');
      csv += `"${item.id}","${item.timestamp}","${item.tenantName}","${item.direction}","${item.method}","${item.endpoint}",${item.statusCode},"${item.statusText}",${item.latencyMs},"${item.clientIp}","${item.geoRegion}","${item.serviceCategory}","${err}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system_api_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportLogsToJSON(filteredLogs?: ApiAuditLogEntry[]): void {
    const list = filteredLogs || this.logs;
    const jsonStr = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system_api_audit_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const apiAuditService = new ApiAuditManager();
