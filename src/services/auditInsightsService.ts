import { apiAuditService } from './apiAuditService';

export type TimeWindow = '15m' | '1h' | '24h' | '7d';
export type LatencyMetricMode = 'avg' | 'p90' | 'p99';

export interface TenantLatencyPoint {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  color: string;
  latencyMs: number;
}

export interface LatencyTimeSlice {
  timestamp: string;
  timeLabel: string;
  date: Date;
  tenants: Record<string, number>; // tenantSlug -> latencyMs
  systemAvg: number;
  systemP95: number;
  systemP99: number;
}

export interface TenantErrorBreakdown {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  color: string;
  clientErrors4xx: number;
  rateLimits429: number;
  gatewayErrors502_503: number;
  serverErrors500: number;
  totalErrors: number;
  totalRequests: number;
  errorRatePct: number;
  topFailingEndpoint: string;
  severity: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface BottleneckCandidate {
  id: string;
  endpoint: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  category: 'BANK_GATEWAY' | 'TAX_FBR' | 'AI_OCR' | 'INVENTORY' | 'FINANCE' | 'AUTH';
  avgLatencyMs: number;
  p99LatencyMs: number;
  requestRatePerMin: number;
  errorCount: number;
  errorRatePct: number;
  severity: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  rootCause: string;
  impactDescription: string;
  remediationAdvice: string;
  mitigationApplied?: boolean;
}

const TENANT_COLORS: Record<string, string> = {
  albarka: '#06b6d4',   // Cyan
  solartech: '#10b981', // Emerald
  crest: '#f59e0b',     // Amber
  master: '#a855f7',    // Purple
  default: '#38bdf8'    // Sky
};

export class AuditInsightsService {
  private mitigatedBottlenecks: Set<string> = new Set();
  private subscribers: Array<() => void> = [];

  constructor() {
    // Listen for live probe updates in apiAuditService
    apiAuditService.subscribe(() => {
      this.notifySubscribers();
    });
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb());
  }

  public toggleMitigation(bottleneckId: string) {
    if (this.mitigatedBottlenecks.has(bottleneckId)) {
      this.mitigatedBottlenecks.delete(bottleneckId);
    } else {
      this.mitigatedBottlenecks.add(bottleneckId);
    }
    this.notifySubscribers();
  }

  public isMitigated(bottleneckId: string): boolean {
    return this.mitigatedBottlenecks.has(bottleneckId);
  }

  public resetAllMitigations() {
    this.mitigatedBottlenecks.clear();
    this.notifySubscribers();
  }

  /**
   * Generates continuous time-series data for D3 Latency Trend charts
   */
  public getLatencyTimeSeries(
    timeWindow: TimeWindow = '1h',
    metricMode: LatencyMetricMode = 'avg'
  ): LatencyTimeSlice[] {
    const pointsCount = timeWindow === '15m' ? 15 : timeWindow === '1h' ? 24 : timeWindow === '24h' ? 24 : 14;
    const intervalMs =
      timeWindow === '15m'
        ? 60 * 1000 // 1 min
        : timeWindow === '1h'
        ? 2.5 * 60 * 1000 // 2.5 min
        : timeWindow === '24h'
        ? 60 * 60 * 1000 // 1 hr
        : 12 * 60 * 60 * 1000; // 12 hrs

    const now = Date.now();
    const slices: LatencyTimeSlice[] = [];

    // Base latency profiles per tenant
    const baseLatencies: Record<string, number> = {
      albarka: 45,
      solartech: this.isMitigated('bn_solartech_meezan') ? 95 : 220,
      crest: this.isMitigated('bn_crest_ocr') ? 85 : 310,
      master: 32
    };

    const multiplier = metricMode === 'avg' ? 1.0 : metricMode === 'p90' ? 1.45 : 2.1;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const sliceTime = new Date(now - i * intervalMs);
      const timeLabel =
        timeWindow === '15m' || timeWindow === '1h'
          ? sliceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : sliceTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });

      // Add realistic variance + temporal spikes (e.g. at middle points)
      const isPeakInterval = i % 7 === 2 || i === 4;

      const albarkaLat = Math.round(
        (baseLatencies.albarka + Math.sin(i * 0.8) * 14 + (isPeakInterval ? 35 : 0)) * multiplier
      );

      const solartechLat = Math.round(
        (baseLatencies.solartech + Math.cos(i * 0.6) * 38 + (isPeakInterval && !this.isMitigated('bn_solartech_meezan') ? 280 : 0)) * multiplier
      );

      const crestLat = Math.round(
        (baseLatencies.crest + Math.sin(i * 0.4) * 45 + (isPeakInterval && !this.isMitigated('bn_crest_ocr') ? 210 : 0)) * multiplier
      );

      const masterLat = Math.round(
        (baseLatencies.master + Math.cos(i * 0.5) * 8) * multiplier
      );

      const values = [albarkaLat, solartechLat, crestLat, masterLat];
      const systemAvg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const systemP95 = Math.round(Math.max(...values) * 0.95);
      const systemP99 = Math.round(Math.max(...values) * 1.12);

      slices.push({
        timestamp: sliceTime.toISOString(),
        timeLabel,
        date: sliceTime,
        tenants: {
          albarka: Math.max(15, albarkaLat),
          solartech: Math.max(20, solartechLat),
          crest: Math.max(22, crestLat),
          master: Math.max(12, masterLat)
        },
        systemAvg,
        systemP95,
        systemP99
      });
    }

    return slices;
  }

  /**
   * Generates Error Log Frequency per active tenant
   */
  public getErrorBreakdown(timeWindow: TimeWindow = '1h'): TenantErrorBreakdown[] {
    const isSolarMitigated = this.isMitigated('bn_solartech_meezan');
    const isCrestMitigated = this.isMitigated('bn_crest_ocr');
    const isAlbarkaMitigated = this.isMitigated('bn_albarka_rate_limit');

    return [
      {
        tenantId: 'tenant_solartech',
        tenantSlug: 'solartech',
        tenantName: 'SolarTech Power Solutions PK',
        color: TENANT_COLORS.solartech,
        clientErrors4xx: 18,
        rateLimits429: isSolarMitigated ? 2 : 46,
        gatewayErrors502_503: isSolarMitigated ? 4 : 84, // Meezan bank timeout
        serverErrors500: 5,
        totalErrors: isSolarMitigated ? 29 : 153,
        totalRequests: 2840,
        errorRatePct: isSolarMitigated ? 1.0 : 5.4,
        topFailingEndpoint: 'https://api.meezanbank.com/h2h/v2/corporate/disbursement',
        severity: isSolarMitigated ? 'HEALTHY' : 'CRITICAL'
      },
      {
        tenantId: 'tenant_crest',
        tenantSlug: 'crest',
        tenantName: 'Crest Textile Mills Ltd',
        color: TENANT_COLORS.crest,
        clientErrors4xx: 24,
        rateLimits429: 6,
        gatewayErrors502_503: isCrestMitigated ? 3 : 38,
        serverErrors500: isCrestMitigated ? 4 : 29, // OCR engine queue saturation
        totalErrors: isCrestMitigated ? 37 : 97,
        totalRequests: 3420,
        errorRatePct: isCrestMitigated ? 1.1 : 2.8,
        topFailingEndpoint: '/api/v1/inventory/ocr-scan-invoice',
        severity: isCrestMitigated ? 'HEALTHY' : 'DEGRADED'
      },
      {
        tenantId: 'tenant_albarka',
        tenantSlug: 'albarka',
        tenantName: 'Albarka Food Industries (Pvt) Ltd',
        color: TENANT_COLORS.albarka,
        clientErrors4xx: 32,
        rateLimits429: isAlbarkaMitigated ? 1 : 14,
        gatewayErrors502_503: 11, // FBR gateway retries
        serverErrors500: 2,
        totalErrors: isAlbarkaMitigated ? 46 : 59,
        totalRequests: 4180,
        errorRatePct: isAlbarkaMitigated ? 1.1 : 1.4,
        topFailingEndpoint: 'https://api.fbr.gov.pk/di/v1/invoicing/digital-submit',
        severity: 'HEALTHY'
      },
      {
        tenantId: 'system_master',
        tenantSlug: 'master',
        tenantName: 'MTS Global Master System',
        color: TENANT_COLORS.master,
        clientErrors4xx: 4,
        rateLimits429: 0,
        gatewayErrors502_503: 1,
        serverErrors500: 1,
        totalErrors: 6,
        totalRequests: 1950,
        errorRatePct: 0.3,
        topFailingEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        severity: 'HEALTHY'
      }
    ];
  }

  /**
   * Identified System Bottlenecks for the Scatter Plot and Mitigation Matrix
   */
  public getBottlenecks(): BottleneckCandidate[] {
    const isSolarMitigated = this.isMitigated('bn_solartech_meezan');
    const isCrestMitigated = this.isMitigated('bn_crest_ocr');
    const isAlbarkaMitigated = this.isMitigated('bn_albarka_rate_limit');

    return [
      {
        id: 'bn_solartech_meezan',
        endpoint: 'https://api.meezanbank.com/h2h/v2/corporate/disbursement',
        tenantId: 'tenant_solartech',
        tenantSlug: 'solartech',
        tenantName: 'SolarTech Power Solutions PK',
        category: 'BANK_GATEWAY',
        avgLatencyMs: isSolarMitigated ? 110 : 820,
        p99LatencyMs: isSolarMitigated ? 210 : 1450,
        requestRatePerMin: 145,
        errorCount: isSolarMitigated ? 4 : 84,
        errorRatePct: isSolarMitigated ? 0.8 : 8.7,
        severity: isSolarMitigated ? 'HEALTHY' : 'CRITICAL',
        rootCause: 'Upstream Meezan Bank Host-to-Host gateway timeout; synchronous thread blocking on 800ms disbursement window.',
        impactDescription: 'Supplier vendor payments delayed, pending cheque queue backing up during 12:00-14:00 settlement cycle.',
        remediationAdvice: 'Deploy asynchronous queuing worker with exponential backoff and circuit breaker fallback to batch mode.',
        mitigationApplied: isSolarMitigated
      },
      {
        id: 'bn_crest_ocr',
        endpoint: '/api/v1/inventory/ocr-scan-invoice',
        tenantId: 'tenant_crest',
        tenantSlug: 'crest',
        tenantName: 'Crest Textile Mills Ltd',
        category: 'AI_OCR',
        avgLatencyMs: isCrestMitigated ? 92 : 395,
        p99LatencyMs: isCrestMitigated ? 180 : 780,
        requestRatePerMin: 85,
        errorCount: isCrestMitigated ? 7 : 38,
        errorRatePct: isCrestMitigated ? 1.2 : 4.5,
        severity: isCrestMitigated ? 'HEALTHY' : 'WARNING',
        rootCause: 'High-resolution bill scans submitted simultaneously from 4 yarn spinning units saturating client inference thread.',
        impactDescription: 'Goods Receipt Note (GRN) creation slowed down by up to 12 seconds per multi-page invoice scan.',
        remediationAdvice: 'Compress client images to 1280px max before upload; offload OCR model inference to parallel web workers.',
        mitigationApplied: isCrestMitigated
      },
      {
        id: 'bn_albarka_rate_limit',
        endpoint: '/api/v1/inventory/items/batch-adjust',
        tenantId: 'tenant_albarka',
        tenantSlug: 'albarka',
        tenantName: 'Albarka Food Industries (Pvt) Ltd',
        category: 'INVENTORY',
        avgLatencyMs: isAlbarkaMitigated ? 35 : 185,
        p99LatencyMs: isAlbarkaMitigated ? 65 : 320,
        requestRatePerMin: 220,
        errorCount: isAlbarkaMitigated ? 2 : 28,
        errorRatePct: isAlbarkaMitigated ? 0.4 : 3.8,
        severity: isAlbarkaMitigated ? 'HEALTHY' : 'WARNING',
        rootCause: 'Warehouse barcode sync script firing 15 requests per second, exceeding default 2500 req/hr tenant quota.',
        impactDescription: 'Intermittent 429 Too Many Requests response returned to Kot Lakhpat central dispatch warehouse handhelds.',
        remediationAdvice: 'Increase tenant quota threshold to 10,000 req/hr and configure client sync script to send 50-item batches.',
        mitigationApplied: isAlbarkaMitigated
      },
      {
        id: 'bn_fbr_digital_invoicing',
        endpoint: 'https://api.fbr.gov.pk/di/v1/invoicing/digital-submit',
        tenantId: 'tenant_albarka',
        tenantSlug: 'albarka',
        tenantName: 'Albarka Food Industries (Pvt) Ltd',
        category: 'TAX_FBR',
        avgLatencyMs: 142,
        p99LatencyMs: 380,
        requestRatePerMin: 310,
        errorCount: 11,
        errorRatePct: 0.9,
        severity: 'HEALTHY',
        rootCause: 'FBR Islamabad gateway response time varies between 90ms and 350ms during peak business closing hours.',
        impactDescription: 'POS sales receipt QR code generation requires 200ms round-trip to tax authority servers.',
        remediationAdvice: 'Pre-allocate fiscal invoice numbers offline with asynchronous FBR server reconciliation sync.',
        mitigationApplied: false
      },
      {
        id: 'bn_gl_trial_balance',
        endpoint: '/api/v1/reports/trial-balance',
        tenantId: 'tenant_crest',
        tenantSlug: 'crest',
        tenantName: 'Crest Textile Mills Ltd',
        category: 'FINANCE',
        avgLatencyMs: 64,
        p99LatencyMs: 140,
        requestRatePerMin: 40,
        errorCount: 1,
        errorRatePct: 0.1,
        severity: 'HEALTHY',
        rootCause: 'Complex multi-level Chart of Accounts calculation covering 42,000 ledger transactions.',
        impactDescription: 'Slight delay on monthly closing report generation.',
        remediationAdvice: 'Cache aggregated account balances with invalidation on new voucher posting.',
        mitigationApplied: false
      }
    ];
  }
}

export const auditInsightsService = new AuditInsightsService();
