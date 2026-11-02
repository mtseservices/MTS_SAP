import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Download,
  Printer,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Box,
  Truck
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

export interface BatchItem {
  id: string;
  batchNumber: string;
  itemCode: string;
  itemName: string;
  category: 'Raw Materials' | 'Finished Goods' | 'Packaging' | 'WIP / Mixing';
  zoneId: string;
  zoneName: string;
  zoneTemperature: string;
  manufacturingDate: string;
  expiryDate: string;
  daysRemaining: number;
  quantity: number;
  uom: string;
  unitCost: number;
  totalValuation: number;
  qcStatus: 'APPROVED' | 'QUARANTINED' | 'UNDER_INSPECTION' | 'EXPEDITE_DISPATCH';
  barcode: string;
}

export const WAREHOUSE_ZONES = [
  { id: 'zone_raw', name: 'Raw Material Silos', temp: 'Ambient (22°C)', code: 'WH-Z1' },
  { id: 'zone_cold', name: 'Cold Storage Bay', temp: '-18°C ~ 4°C', code: 'WH-Z2' },
  { id: 'zone_wip', name: 'Mixing & WIP Buffer', temp: 'Climate Controlled', code: 'WH-Z3' },
  { id: 'zone_fg', name: 'Finished Goods Hub', temp: 'Ambient (20°C)', code: 'WH-Z4' },
  { id: 'zone_pack', name: 'Packaging & Cartons', temp: 'Dry Store (25°C)', code: 'WH-Z5' },
  { id: 'zone_qa', name: 'Quarantine & Inspection', temp: 'Isolated Bay', code: 'WH-Z6' },
];

export const LONGEVITY_BUCKETS = [
  { id: 'urgent_15', label: '< 15 Days', sub: 'Urgent Action Required', minDays: -999, maxDays: 15, severity: 'critical', baseColor: '#ef4444' },
  { id: 'critical_30', label: '16 – 30 Days', sub: '30-Day Critical Threshold', minDays: 16, maxDays: 30, severity: 'danger', baseColor: '#f97316' },
  { id: 'warning_60', label: '31 – 60 Days', sub: 'Warning Horizon', minDays: 31, maxDays: 60, severity: 'warning', baseColor: '#eab308' },
  { id: 'attention_90', label: '61 – 90 Days', sub: 'Attention Horizon', minDays: 61, maxDays: 90, severity: 'attention', baseColor: '#06b6d4' },
  { id: 'safe_90plus', label: '> 90 Days', sub: 'Safe Longevity', minDays: 91, maxDays: 9999, severity: 'safe', baseColor: '#10b981' },
];

// Rich realistic mock batches for Pakistani Enterprise (Flour, Oil, Biscuits, Dairy, Flavorings, Packaging)
export const INITIAL_BATCHES: BatchItem[] = [
  // < 15 Days (Critical Alert)
  {
    id: 'b_01',
    batchNumber: 'LOT-2026-CHOC-09',
    itemCode: 'RM-CHOC-COAT',
    itemName: 'Liquid Chocolate Compound Paste',
    category: 'Raw Materials',
    zoneId: 'zone_cold',
    zoneName: 'Cold Storage Bay',
    zoneTemperature: '4°C Controlled',
    manufacturingDate: '2026-05-10',
    expiryDate: '2026-11-12',
    daysRemaining: 10,
    quantity: 450,
    uom: 'Kg',
    unitCost: 1200,
    totalValuation: 540000,
    qcStatus: 'EXPEDITE_DISPATCH',
    barcode: '896400099011'
  },
  {
    id: 'b_02',
    batchNumber: 'LOT-2026-YEAST-04',
    itemCode: 'RM-ACT-YEAST',
    itemName: 'Instant Active Bakery Yeast (Vacuum Pack)',
    category: 'Raw Materials',
    zoneId: 'zone_cold',
    zoneName: 'Cold Storage Bay',
    zoneTemperature: '4°C Controlled',
    manufacturingDate: '2026-04-15',
    expiryDate: '2026-11-08',
    daysRemaining: 6,
    quantity: 320,
    uom: 'Packs',
    unitCost: 750,
    totalValuation: 240000,
    qcStatus: 'EXPEDITE_DISPATCH',
    barcode: '896400099028'
  },
  {
    id: 'b_03',
    batchNumber: 'LOT-2026-WIP-DOUGH-88',
    itemCode: 'WIP-DOUGH-CREAM',
    itemName: 'Semi-Processed Cream Sandwich Dough',
    category: 'WIP / Mixing',
    zoneId: 'zone_wip',
    zoneName: 'Mixing & WIP Buffer',
    zoneTemperature: 'Climate Controlled',
    manufacturingDate: '2026-10-28',
    expiryDate: '2026-11-14',
    daysRemaining: 12,
    quantity: 800,
    uom: 'Kg',
    unitCost: 450,
    totalValuation: 360000,
    qcStatus: 'APPROVED',
    barcode: '896400099035'
  },
  {
    id: 'b_04',
    batchNumber: 'LOT-2026-DAIRY-33',
    itemCode: 'RM-FRESH-MILK',
    itemName: 'Pasteurized Liquid Dairy Milk Batch',
    category: 'Raw Materials',
    zoneId: 'zone_qa',
    zoneName: 'Quarantine & Inspection',
    zoneTemperature: 'Isolated Bay',
    manufacturingDate: '2026-10-25',
    expiryDate: '2026-11-05',
    daysRemaining: 3,
    quantity: 1200,
    uom: 'Liters',
    unitCost: 220,
    totalValuation: 264000,
    qcStatus: 'QUARANTINED',
    barcode: '896400099042'
  },

  // 16 - 30 Days (Critical 30-Day Threshold)
  {
    id: 'b_05',
    batchNumber: 'LOT-2026-FG-BIS-102',
    itemCode: 'FG-BISCUIT-BOX',
    itemName: 'Albarka Energy Biscuits (Promo Pack)',
    category: 'Finished Goods',
    zoneId: 'zone_fg',
    zoneName: 'Finished Goods Hub',
    zoneTemperature: 'Ambient (20°C)',
    manufacturingDate: '2026-05-15',
    expiryDate: '2026-11-24',
    daysRemaining: 22,
    quantity: 950,
    uom: 'Cartons',
    unitCost: 1250,
    totalValuation: 1187500,
    qcStatus: 'EXPEDITE_DISPATCH',
    barcode: '896400099059'
  },
  {
    id: 'b_06',
    batchNumber: 'LOT-2026-FLAV-VAN-12',
    itemCode: 'RM-VANILLA-EXT',
    itemName: 'Pure Bourbon Vanilla Concentrate',
    category: 'Raw Materials',
    zoneId: 'zone_cold',
    zoneName: 'Cold Storage Bay',
    zoneTemperature: '4°C Controlled',
    manufacturingDate: '2026-03-01',
    expiryDate: '2026-11-28',
    daysRemaining: 26,
    quantity: 65,
    uom: 'Bottles (5L)',
    unitCost: 14500,
    totalValuation: 942500,
    qcStatus: 'APPROVED',
    barcode: '896400099066'
  },
  {
    id: 'b_07',
    batchNumber: 'LOT-2026-EGG-PWDR-08',
    itemCode: 'RM-EGG-POWDER',
    itemName: 'Whole Spray-Dried Egg Powder',
    category: 'Raw Materials',
    zoneId: 'zone_raw',
    zoneName: 'Raw Material Silos',
    zoneTemperature: 'Ambient (22°C)',
    manufacturingDate: '2026-01-20',
    expiryDate: '2026-11-20',
    daysRemaining: 18,
    quantity: 400,
    uom: 'Kg',
    unitCost: 1100,
    totalValuation: 440000,
    qcStatus: 'UNDER_INSPECTION',
    barcode: '896400099073'
  },
  {
    id: 'b_08',
    batchNumber: 'LOT-2026-PACK-FILM-19',
    itemCode: 'PK-MET-BOPP',
    itemName: 'Corona-Treated BOPP Metallized Film',
    category: 'Packaging',
    zoneId: 'zone_pack',
    zoneName: 'Packaging & Cartons',
    zoneTemperature: 'Dry Store (25°C)',
    manufacturingDate: '2025-11-15',
    expiryDate: '2026-11-29',
    daysRemaining: 27,
    quantity: 15,
    uom: 'Jumbo Rolls',
    unitCost: 38000,
    totalValuation: 570000,
    qcStatus: 'APPROVED',
    barcode: '896400099080'
  },

  // 31 - 60 Days (Warning Horizon)
  {
    id: 'b_09',
    batchNumber: 'LOT-2026-OIL-09B',
    itemCode: 'RM-OIL-16L',
    itemName: 'Refined Edible Palm Olein Oil',
    category: 'Raw Materials',
    zoneId: 'zone_raw',
    zoneName: 'Raw Material Silos',
    zoneTemperature: 'Ambient (22°C)',
    manufacturingDate: '2026-06-10',
    expiryDate: '2026-12-18',
    daysRemaining: 46,
    quantity: 580,
    uom: 'Tins',
    unitCost: 5900,
    totalValuation: 3422000,
    qcStatus: 'APPROVED',
    barcode: '896400099097'
  },
  {
    id: 'b_10',
    batchNumber: 'LOT-2026-SUGAR-FINE-44',
    itemCode: 'RM-SUGAR-50K',
    itemName: 'Refined White Caster Sugar (50kg)',
    category: 'Raw Materials',
    zoneId: 'zone_raw',
    zoneName: 'Raw Material Silos',
    zoneTemperature: 'Ambient (22°C)',
    manufacturingDate: '2026-06-05',
    expiryDate: '2026-12-25',
    daysRemaining: 53,
    quantity: 820,
    uom: 'Bags',
    unitCost: 6800,
    totalValuation: 5576000,
    qcStatus: 'APPROVED',
    barcode: '896400099103'
  },
  {
    id: 'b_11',
    batchNumber: 'LOT-2026-FG-WAFER-70',
    itemCode: 'FG-WAFERS-400G',
    itemName: 'Crispy Chocolate Wafers (Box of 12)',
    category: 'Finished Goods',
    zoneId: 'zone_fg',
    zoneName: 'Finished Goods Hub',
    zoneTemperature: 'Ambient (20°C)',
    manufacturingDate: '2026-07-01',
    expiryDate: '2026-12-15',
    daysRemaining: 43,
    quantity: 1100,
    uom: 'Cartons',
    unitCost: 1450,
    totalValuation: 1595000,
    qcStatus: 'APPROVED',
    barcode: '896400099110'
  },
  {
    id: 'b_12',
    batchNumber: 'LOT-2026-LECITHIN-02',
    itemCode: 'RM-SOY-LEC',
    itemName: 'Food Grade Soya Lecithin Emulsifier',
    category: 'Raw Materials',
    zoneId: 'zone_wip',
    zoneName: 'Mixing & WIP Buffer',
    zoneTemperature: 'Climate Controlled',
    manufacturingDate: '2026-04-20',
    expiryDate: '2026-12-28',
    daysRemaining: 56,
    quantity: 18,
    uom: 'Drums (200kg)',
    unitCost: 85000,
    totalValuation: 1530000,
    qcStatus: 'APPROVED',
    barcode: '896400099127'
  },

  // 61 - 90 Days (Attention Horizon)
  {
    id: 'b_13',
    batchNumber: 'LOT-2026-FLOUR-10A',
    itemCode: 'RM-FLOUR-50K',
    itemName: 'Super Fine Wheat Flour (Milled)',
    category: 'Raw Materials',
    zoneId: 'zone_raw',
    zoneName: 'Raw Material Silos',
    zoneTemperature: 'Ambient (22°C)',
    manufacturingDate: '2026-07-20',
    expiryDate: '2027-01-20',
    daysRemaining: 79,
    quantity: 1400,
    uom: 'Bags',
    unitCost: 3500,
    totalValuation: 4900000,
    qcStatus: 'APPROVED',
    barcode: '896400099134'
  },
  {
    id: 'b_14',
    batchNumber: 'LOT-2026-FG-RUSK-201',
    itemCode: 'FG-PREM-RUSK',
    itemName: 'Royal Crispy Toast Rusk (450g Pack)',
    category: 'Finished Goods',
    zoneId: 'zone_fg',
    zoneName: 'Finished Goods Hub',
    zoneTemperature: 'Ambient (20°C)',
    manufacturingDate: '2026-08-10',
    expiryDate: '2027-01-25',
    daysRemaining: 84,
    quantity: 1650,
    uom: 'Cartons',
    unitCost: 980,
    totalValuation: 1617000,
    qcStatus: 'APPROVED',
    barcode: '896400099141'
  },
  {
    id: 'b_15',
    batchNumber: 'LOT-2026-BUTTER-FAT-99',
    itemCode: 'RM-AMF-FAT',
    itemName: 'Anhydrous Milk Fat (AMF Butter)',
    category: 'Raw Materials',
    zoneId: 'zone_cold',
    zoneName: 'Cold Storage Bay',
    zoneTemperature: '4°C Controlled',
    manufacturingDate: '2026-07-15',
    expiryDate: '2027-01-14',
    daysRemaining: 73,
    quantity: 140,
    uom: 'Cartons (25kg)',
    unitCost: 24000,
    totalValuation: 3360000,
    qcStatus: 'APPROVED',
    barcode: '896400099158'
  },

  // > 90 Days (Safe Longevity)
  {
    id: 'b_16',
    batchNumber: 'LOT-2026-SALT-IOD-55',
    itemCode: 'RM-IOD-SALT',
    itemName: 'Iodized Industrial Fine Salt (50kg)',
    category: 'Raw Materials',
    zoneId: 'zone_raw',
    zoneName: 'Raw Material Silos',
    zoneTemperature: 'Ambient (22°C)',
    manufacturingDate: '2026-08-01',
    expiryDate: '2028-08-01',
    daysRemaining: 638,
    quantity: 2200,
    uom: 'Bags',
    unitCost: 650,
    totalValuation: 1430000,
    qcStatus: 'APPROVED',
    barcode: '896400099165'
  },
  {
    id: 'b_17',
    batchNumber: 'LOT-2026-PACK-CORR-100',
    itemCode: 'PK-BOX-100',
    itemName: 'Heavy Duty 5-Ply Corrugated Shipping Box',
    category: 'Packaging',
    zoneId: 'zone_pack',
    zoneName: 'Packaging & Cartons',
    zoneTemperature: 'Dry Store (25°C)',
    manufacturingDate: '2026-09-01',
    expiryDate: '2029-09-01',
    daysRemaining: 1030,
    quantity: 8500,
    uom: 'Cartons',
    unitCost: 180,
    totalValuation: 1530000,
    qcStatus: 'APPROVED',
    barcode: '896400099172'
  },
  {
    id: 'b_18',
    batchNumber: 'LOT-2026-FG-CAKE-303',
    itemCode: 'FG-FRUIT-CAKE',
    itemName: 'Traditional Festive Plum Fruit Cake',
    category: 'Finished Goods',
    zoneId: 'zone_fg',
    zoneName: 'Finished Goods Hub',
    zoneTemperature: 'Ambient (20°C)',
    manufacturingDate: '2026-09-15',
    expiryDate: '2027-03-15',
    daysRemaining: 133,
    quantity: 2400,
    uom: 'Boxes',
    unitCost: 820,
    totalValuation: 1968000,
    qcStatus: 'APPROVED',
    barcode: '896400099189'
  },
  {
    id: 'b_19',
    batchNumber: 'LOT-2026-QA-HOLD-14',
    itemCode: 'RM-CITRIC-ACID',
    itemName: 'Citric Acid Monohydrate (Food Grade)',
    category: 'Raw Materials',
    zoneId: 'zone_qa',
    zoneName: 'Quarantine & Inspection',
    zoneTemperature: 'Isolated Bay',
    manufacturingDate: '2026-07-10',
    expiryDate: '2027-07-10',
    daysRemaining: 250,
    quantity: 350,
    uom: 'Bags (25kg)',
    unitCost: 4500,
    totalValuation: 1575000,
    qcStatus: 'QUARANTINED',
    barcode: '896400099196'
  }
];

interface CellData {
  zoneId: string;
  zoneName: string;
  bucketId: string;
  bucketLabel: string;
  bucketSub: string;
  severity: string;
  batches: BatchItem[];
  count: number;
  totalValuation: number;
  criticalCount: number;
}

export const BatchExpirationHeatmap: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [batches, setBatches] = useState<BatchItem[]>(INITIAL_BATCHES);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [onlyCriticalThreshold, setOnlyCriticalThreshold] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive inspection / cell selection
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);
  const [actionBatch, setActionBatch] = useState<BatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered batch dataset
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (selectedZone !== 'ALL' && b.zoneId !== selectedZone) return false;
      if (onlyCriticalThreshold && b.daysRemaining > 30) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.batchNumber.toLowerCase().includes(q) ||
          b.itemName.toLowerCase().includes(q) ||
          b.itemCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [batches, selectedZone, onlyCriticalThreshold, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = batches.length;
    const critical30 = batches.filter(b => b.daysRemaining <= 30);
    const criticalValuation = critical30.reduce((acc, b) => acc + b.totalValuation, 0);
    const urgent15 = batches.filter(b => b.daysRemaining <= 15);
    const totalValuation = batches.reduce((acc, b) => acc + b.totalValuation, 0);
    const quarantined = batches.filter(b => b.qcStatus === 'QUARANTINED');

    return {
      total,
      critical30Count: critical30.length,
      criticalValuation,
      urgent15Count: urgent15.length,
      totalValuation,
      quarantinedCount: quarantined.length
    };
  }, [batches]);

  // Build grid matrix of cells: Zone x Bucket
  const gridMatrix = useMemo<CellData[]>(() => {
    const cells: CellData[] = [];

    WAREHOUSE_ZONES.forEach((zone) => {
      LONGEVITY_BUCKETS.forEach((bucket) => {
        const matchingBatches = batches.filter((b) => {
          if (b.zoneId !== zone.id) return false;
          return b.daysRemaining >= bucket.minDays && b.daysRemaining <= bucket.maxDays;
        });

        const totalVal = matchingBatches.reduce((acc, b) => acc + b.totalValuation, 0);
        const crit = matchingBatches.filter(b => b.daysRemaining <= 30).length;

        cells.push({
          zoneId: zone.id,
          zoneName: zone.name,
          bucketId: bucket.id,
          bucketLabel: bucket.label,
          bucketSub: bucket.sub,
          severity: bucket.severity,
          batches: matchingBatches,
          count: matchingBatches.length,
          totalValuation: totalVal,
          criticalCount: crit
        });
      });
    });

    return cells;
  }, [batches]);

  // Render D3 SVG Heatmap
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth || 920;
    const margin = { top: 60, right: 30, bottom: 40, left: 200 };
    const width = Math.max(860, containerWidth) - margin.left - margin.right;
    const height = WAREHOUSE_ZONES.length * 68; // 68px per warehouse zone row

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3
      .scaleBand()
      .domain(LONGEVITY_BUCKETS.map((b) => b.id))
      .range([0, width])
      .padding(0.08);

    const yScale = d3
      .scaleBand()
      .domain(WAREHOUSE_ZONES.map((z) => z.id))
      .range([0, height])
      .padding(0.12);

    // X Axis Headers (Buckets)
    const xHeaders = g
      .append('g')
      .attr('class', 'x-axis')
      .selectAll('.bucket-header')
      .data(LONGEVITY_BUCKETS)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${(xScale(d.id) || 0) + xScale.bandwidth() / 2}, -16)`);

    xHeaders
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('fill', (d) => (d.severity === 'critical' ? '#f87171' : d.severity === 'danger' ? '#fb923c' : '#94a3b8'))
      .text((d) => d.label);

    xHeaders
      .append('text')
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#64748b')
      .text((d) => (d.id === 'critical_30' ? '⚠️ ≤30d Threshold' : d.sub));

    // Y Axis Labels (Warehouse Zones)
    const yHeaders = g
      .append('g')
      .attr('class', 'y-axis')
      .selectAll('.zone-header')
      .data(WAREHOUSE_ZONES)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(-16, ${(yScale(d.id) || 0) + yScale.bandwidth() / 2})`);

    yHeaders
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('fill', '#e2e8f0')
      .text((d) => d.name);

    yHeaders
      .append('text')
      .attr('y', 15)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('fill', '#38bdf8')
      .text((d) => `${d.code} • ${d.temp}`);

    // Heatmap Cells
    const cellGroups = g
      .selectAll('.heatmap-cell')
      .data(gridMatrix)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell')
      .attr('transform', (d) => `translate(${xScale(d.bucketId)},${yScale(d.zoneId)})`)
      .style('cursor', (d) => (d.count > 0 ? 'pointer' : 'default'))
      .on('click', (_, d) => {
        if (d.count > 0) {
          setSelectedCell(d);
        }
      });

    // Color computation function
    const getCellFill = (d: CellData) => {
      if (d.count === 0) return '#0f172a'; // Empty slate
      if (d.bucketId === 'urgent_15') return '#7f1d1d'; // Dark crimson
      if (d.bucketId === 'critical_30') return '#7c2d12'; // Deep orange-red
      if (d.bucketId === 'warning_60') return '#78350f'; // Deep amber
      if (d.bucketId === 'attention_90') return '#0e7490'; // Deep cyan
      return '#064e3b'; // Deep emerald
    };

    const getCellBorder = (d: CellData) => {
      if (d.count === 0) return '#1e293b';
      if (d.bucketId === 'urgent_15') return '#ef4444';
      if (d.bucketId === 'critical_30') return '#f97316';
      if (d.bucketId === 'warning_60') return '#f59e0b';
      if (d.bucketId === 'attention_90') return '#06b6d4';
      return '#10b981';
    };

    // Cell Background Rectangles
    cellGroups
      .append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('fill', (d) => getCellFill(d))
      .attr('stroke', (d) => getCellBorder(d))
      .attr('stroke-width', (d) => (d.count > 0 ? 1.5 : 1))
      .attr('opacity', 0)
      .transition()
      .duration(450)
      .attr('opacity', 1);

    // Glowing animation for < 30 Days critical cells with batches
    cellGroups
      .filter((d) => (d.bucketId === 'urgent_15' || d.bucketId === 'critical_30') && d.count > 0)
      .select('rect')
      .attr('class', 'animate-pulse')
      .attr('stroke-width', 2);

    // Text: Batch Count
    cellGroups
      .filter((d) => d.count > 0)
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2 - 4)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '800')
      .attr('fill', '#ffffff')
      .text((d) => `${d.count} ${d.count === 1 ? 'Batch' : 'Batches'}`);

    // Text: PKR Valuation
    cellGroups
      .filter((d) => d.count > 0)
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2 + 14)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', (d) => (d.bucketId === 'urgent_15' || d.bucketId === 'critical_30' ? '#fed7aa' : '#94a3b8'))
      .text((d) => `Rs. ${(d.totalValuation / 1000).toFixed(0)}k`);

    // Empty cell indicator (Dash)
    cellGroups
      .filter((d) => d.count === 0)
      .append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#334155')
      .text('—');

    // D3 Interactive Tooltip using DOM
    const tooltip = d3
      .select(containerRef.current)
      .selectAll('.d3-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 50);

    cellGroups
      .on('mouseover', function (event, d) {
        if (d.count === 0) return;
        d3.select(this).select('rect').attr('stroke-width', 3).attr('stroke', '#38bdf8');

        tooltip.transition().duration(150).style('opacity', 1);

        const isCrit = d.bucketId === 'urgent_15' || d.bucketId === 'critical_30';
        tooltip.html(`
          <div class="p-3 rounded-xl bg-slate-900/95 border ${isCrit ? 'border-rose-500 shadow-rose-950/50' : 'border-slate-700'} shadow-2xl backdrop-blur-md text-slate-100 max-w-xs space-y-1.5 text-xs font-sans">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="font-bold text-cyan-300">${d.zoneName}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-emerald-300'}">
                ${d.bucketLabel}
              </span>
            </div>
            <div class="text-[11px] text-slate-300">
              <span class="font-bold text-white">${d.count} Batches</span> • Total: <span class="font-mono font-bold text-purple-300">Rs. ${d.totalValuation.toLocaleString()}</span>
            </div>
            <div class="space-y-1 pt-1">
              ${d.batches
                .slice(0, 3)
                .map(
                  (b) => `
                <div class="flex items-center justify-between text-[10px] bg-slate-800/80 px-2 py-1 rounded">
                  <span class="font-mono font-semibold text-slate-200 truncate max-w-[130px]">${b.itemName}</span>
                  <span class="font-mono font-bold ${b.daysRemaining <= 30 ? 'text-rose-400' : 'text-emerald-400'}">${b.daysRemaining}d left</span>
                </div>`
                )
                .join('')}
              ${d.batches.length > 3 ? `<div class="text-[9px] text-slate-400 text-center">+${d.batches.length - 3} more batches (click to inspect)</div>` : ''}
            </div>
            <div class="text-[9px] text-slate-500 pt-1 text-center font-mono">Click cell to drill down</div>
          </div>
        `);
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        tooltip.style('left', `${x + 20}px`).style('top', `${y - 10}px`);
      })
      .on('mouseout', function (_, d) {
        d3.select(this).select('rect').attr('stroke-width', d.count > 0 ? 1.5 : 1).attr('stroke', getCellBorder(d));
        tooltip.transition().duration(200).style('opacity', 0);
      });
  }, [gridMatrix]);

  // Batch action handlers
  const handleExpediteBatch = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, qcStatus: 'EXPEDITE_DISPATCH' } : b))
    );
    setActionBatch(null);
    showToast(`Batch expedited for immediate production dispatch & discount proposal.`);
  };

  const handleQuarantineBatch = (batchId: string) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, qcStatus: 'QUARANTINED', zoneId: 'zone_qa', zoneName: 'Quarantine & Inspection' } : b))
    );
    setActionBatch(null);
    showToast(`Batch locked and moved to Zone WH-Z6 Quarantine Bay.`);
  };

  const handleExportCSV = () => {
    const headers = 'Batch Number,Item Code,Item Description,Category,Zone,Expiry Date,Days Remaining,Quantity,UOM,Unit Cost PKR,Valuation PKR,QC Status\n';
    const rows = filteredBatches
      .map(
        (b) =>
          `"${b.batchNumber}","${b.itemCode}","${b.itemName}","${b.category}","${b.zoneName}","${b.expiryDate}",${b.daysRemaining},${b.quantity},"${b.uom}",${b.unitCost},${b.totalValuation},"${b.qcStatus}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Expiration_Analysis_${currentCompany.slug}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Batch Expiration Schedule exported to CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-4 rounded-2xl bg-cyan-950/95 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Departmental Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                    Batch Longevity & Expiration Heatmap
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    D3.js Visualization
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                    30-Day Critical Threshold Guard
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time spatial distribution of inventory batch longevity across all 6 warehouse climate zones.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setOnlyCriticalThreshold(!onlyCriticalThreshold)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                onlyCriticalThreshold
                  ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>≤ 30-Day Critical Batches Only</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 30-Day Critical Alert Banner (if critical batches exist) */}
        {stats.critical30Count > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 to-amber-950/50 border border-rose-500/40 text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black text-rose-300 uppercase tracking-wide flex items-center gap-2">
                  <span>Critical Expiry Risk: {stats.critical30Count} Batches Nearing 30-Day Threshold</span>
                  <span className="text-[10px] bg-rose-600 px-2 py-0.2 text-white rounded font-mono">
                    Rs. {(stats.criticalValuation / 1000000).toFixed(2)}M at Risk
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  Batches in <span className="font-semibold text-white">Cold Storage Bay</span> and <span className="font-semibold text-white">Mixing Buffer</span> require immediate priority dispatch, discount sales challan, or production blend incorporation to prevent write-offs.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setOnlyCriticalThreshold(true);
                setSelectedZone('ALL');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-1"
            >
              <span>Inspect All Critical</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Active Batches</span>
            <span className="text-xl font-black text-slate-100">{stats.total} Lots</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">≤ 30-Day Critical Risk</span>
            <span className="text-xl font-black text-rose-400">{stats.critical30Count} Batches</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Valuation (PKR)</span>
            <span className="text-xl font-black text-purple-400">Rs. {(stats.totalValuation / 1000000).toFixed(2)}M</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Quarantined / Held</span>
            <span className="text-xl font-black text-amber-400">{stats.quarantinedCount} Lots</span>
          </div>
        </div>
      </div>

      {/* Heatmap Visualization Canvas */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Warehouse Zone vs. Shelf-Life Longevity Matrix
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any colored cell to drill down into batch records, inspect lots, or issue expedited movement.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-semibold">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-300">&lt; 15d Urgent</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-orange-300">16–30d Critical</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-amber-300">31–60d Warning</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-cyan-300">61–90d Attention</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-300">&gt; 90d Safe</span>
            </div>
          </div>
        </div>

        {/* D3 SVG Container */}
        <div ref={containerRef} className="relative overflow-x-auto py-2">
          <svg ref={svgRef} className="mx-auto block" />
        </div>
      </div>

      {/* Selected Cell Drill-Down Modal / Drawer */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-100">
                    {selectedCell.zoneName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedCell.bucketLabel} ({selectedCell.bucketSub})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {selectedCell.count} batch lots • Combined Value: Rs. {selectedCell.totalValuation.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Batch List in Cell */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedCell.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300 text-xs">
                          {batch.batchNumber}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-slate-700 text-slate-300 font-semibold">
                          {batch.category}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          batch.daysRemaining <= 15 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          batch.daysRemaining <= 30 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {batch.daysRemaining} Days Remaining
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">
                        {batch.itemName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        SKU: {batch.itemCode} • Barcode: {batch.barcode}
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-sm font-black text-purple-400 font-mono">
                        Rs. {batch.totalValuation.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {batch.quantity.toLocaleString()} {batch.uom} @ Rs. {batch.unitCost}/{batch.uom}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700/60 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Mfg: <strong className="text-slate-300">{batch.manufacturingDate}</strong></span>
                      <span>Expiry: <strong className="text-amber-300">{batch.expiryDate}</strong></span>
                      <span>Status: <strong className="text-cyan-300">{batch.qcStatus}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExpediteBatch(batch.id)}
                        className="px-2.5 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-200 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Flame className="w-3 h-3 text-orange-300" />
                        <span>Expedite Dispatch</span>
                      </button>

                      <button
                        onClick={() => handleQuarantineBatch(batch.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-rose-300" />
                        <span>Move to Quarantine</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Batch Expiry Register Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-purple-400" />
              Comprehensive Batch Longevity & Expiry Register
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Filter by zone, search lot numbers, or take immediate corrective action on near-expiry stock.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {/* Zone Filter */}
            <div className="relative">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Warehouse Zones</option>
                {WAREHOUSE_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Batch / Lot No</th>
                <th className="p-3">Product Description</th>
                <th className="p-3">Warehouse Zone</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Longevity</th>
                <th className="p-3 text-right">Available Qty</th>
                <th className="p-3 text-right">Total Valuation</th>
                <th className="p-3 text-center">QC Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredBatches.map((batch) => {
                const isUrgent = batch.daysRemaining <= 15;
                const isCrit30 = batch.daysRemaining > 15 && batch.daysRemaining <= 30;

                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isUrgent
                        ? 'bg-rose-950/20'
                        : isCrit30
                        ? 'bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-cyan-300">
                      {batch.batchNumber}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-100">{batch.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {batch.itemCode} • {batch.category}
                      </div>
                    </td>

                    <td className="p-3 text-slate-300">
                      <div>{batch.zoneName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{batch.zoneTemperature}</div>
                    </td>

                    <td className="p-3 font-mono text-slate-200">
                      {batch.expiryDate}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                            : isCrit30
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                            : batch.daysRemaining <= 60
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isUrgent && <Flame className="w-2.5 h-2.5 text-rose-400" />}
                        {batch.daysRemaining} Days
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-100">
                      {batch.quantity.toLocaleString()} {batch.uom}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-purple-400">
                      Rs. {batch.totalValuation.toLocaleString()}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          batch.qcStatus === 'EXPEDITE_DISPATCH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : batch.qcStatus === 'QUARANTINED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {batch.qcStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleExpediteBatch(batch.id)}
                          title="Expedite Dispatch"
                          className="p-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleQuarantineBatch(batch.id)}
                          title="Lock in Quarantine"
                          className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
