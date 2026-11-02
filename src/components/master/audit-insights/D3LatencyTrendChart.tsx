import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LatencyTimeSlice, LatencyMetricMode } from '../../../services/auditInsightsService';

interface D3LatencyTrendChartProps {
  data: LatencyTimeSlice[];
  metricMode: LatencyMetricMode;
  selectedTenant: string; // 'ALL' or specific tenantSlug
  onSelectTenant: (slug: string) => void;
}

const TENANTS_CONFIG: Record<string, { label: string; color: string }> = {
  albarka: { label: 'Albarka Food Industries', color: '#06b6d4' },
  solartech: { label: 'SolarTech Power PK', color: '#10b981' },
  crest: { label: 'Crest Textile Mills', color: '#f59e0b' },
  master: { label: 'MTS Master System', color: '#a855f7' }
};

export const D3LatencyTrendChart: React.FC<D3LatencyTrendChartProps> = ({
  data,
  metricMode,
  selectedTenant,
  onSelectTenant
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredSlice, setHoveredSlice] = useState<LatencyTimeSlice | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 340;
    const margin = { top: 25, right: 35, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto; font-family: inherit;');

    // Define defs & linear gradients
    const defs = svg.append('defs');

    // Create gradient for each tenant area
    Object.entries(TENANTS_CONFIG).forEach(([key, cfg]) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `area-gradient-${key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', cfg.color)
        .attr('stop-opacity', 0.28);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', cfg.color)
        .attr('stop-opacity', 0.0);
    });

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Time)
    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    // Y Scale (Latency in ms)
    const maxVal = d3.max(data, (d) => {
      if (selectedTenant !== 'ALL') {
        return d.tenants[selectedTenant] || 100;
      }
      return Math.max(...Object.values(d.tenants), d.systemP99);
    }) || 300;

    const yMax = Math.max(maxVal * 1.18, 280); // ensure room for SLA line
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

    // Horizontal Grid Lines
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // SLA Warning Line (250ms)
    if (yScale(250) >= 0 && yScale(250) <= innerHeight) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(250))
        .attr('y2', yScale(250))
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', innerWidth - 8)
        .attr('y', yScale(250) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#f59e0b')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('SLA Warning Threshold (250ms)');
    }

    // SLA Critical Breach Line (500ms)
    if (yScale(500) >= 0 && yScale(500) <= innerHeight) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(500))
        .attr('y2', yScale(500))
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.8);

      g.append('text')
        .attr('x', innerWidth - 8)
        .attr('y', yScale(500) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#f43f5e')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('SLA Critical Breach (500ms)');
    }

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(data.length, Math.floor(innerWidth / 90)))
      .tickFormat((d) => d3.timeFormat('%H:%M')(d as Date));

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('dy', '1em');
    xAxisGroup.selectAll('line').attr('stroke', '#334155');
    xAxisGroup.select('.domain').attr('stroke', '#334155');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `${d}ms`);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    yAxisGroup.selectAll('line').attr('stroke', '#334155');
    yAxisGroup.select('.domain').attr('stroke', '#334155');

    // Line & Area Generator
    const lineGenerator = (tenantKey: string) =>
      d3
        .line<LatencyTimeSlice>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.tenants[tenantKey] || 0))
        .curve(d3.curveMonotoneX);

    const areaGenerator = (tenantKey: string) =>
      d3
        .area<LatencyTimeSlice>()
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => yScale(d.tenants[tenantKey] || 0))
        .curve(d3.curveMonotoneX);

    // Draw paths for tenants
    const activeTenants =
      selectedTenant === 'ALL'
        ? Object.keys(TENANTS_CONFIG)
        : [selectedTenant];

    activeTenants.forEach((tenantKey) => {
      const config = TENANTS_CONFIG[tenantKey];
      if (!config) return;

      // Draw subtle fill area
      g.append('path')
        .datum(data)
        .attr('fill', `url(#area-gradient-${tenantKey})`)
        .attr('d', areaGenerator(tenantKey));

      // Draw stroke curve
      const path = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', selectedTenant === tenantKey ? 3 : 2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', lineGenerator(tenantKey));

      // Smooth path entrance animation
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength?.() || 0;
      if (totalLength > 0) {
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .attr('stroke-dashoffset', 0);
      }
    });

    // Crosshair line (vertical indicator)
    const crosshair = g
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0);

    // Dot indicators at intersection points
    const dotsGroup = g.append('g').attr('class', 'dots-group');

    // Invisible interactive mouse overlay
    const bisectDate = d3.bisector<LatencyTimeSlice, Date>((d) => d.date).center;

    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const x0 = xScale.invert(mx);
        const index = bisectDate(data, x0);
        const slice = data[index];

        if (slice) {
          const cx = xScale(slice.date);
          crosshair.attr('x1', cx).attr('x2', cx).attr('opacity', 0.85);

          // Draw active dots
          dotsGroup.selectAll('*').remove();
          activeTenants.forEach((tKey) => {
            const lat = slice.tenants[tKey];
            if (lat !== undefined) {
              const cy = yScale(lat);
              const color = TENANTS_CONFIG[tKey]?.color || '#38bdf8';

              dotsGroup
                .append('circle')
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', 5)
                .attr('fill', color)
                .attr('stroke', '#0f172a')
                .attr('stroke-width', 2);
            }
          });

          setHoveredSlice(slice);
          setTooltipPos({
            x: cx + margin.left,
            y: event.clientY
          });
        }
      })
      .on('mouseleave', function () {
        crosshair.attr('opacity', 0);
        dotsGroup.selectAll('*').remove();
        setHoveredSlice(null);
        setTooltipPos(null);
      });
  }, [data, metricMode, selectedTenant]);

  return (
    <div className="relative w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100">
              System-Wide Multi-Tenant API Latency Trends
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              D3.js Vector Engine • {metricMode.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time latency progression across active tenants against national SLA tolerance thresholds.
          </p>
        </div>

        {/* Tenant Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectTenant('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedTenant === 'ALL'
                ? 'bg-slate-700 text-white border border-slate-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            All Tenants
          </button>
          {Object.entries(TENANTS_CONFIG).map(([slug, cfg]) => {
            const isSelected = selectedTenant === slug;
            return (
              <button
                key={slug}
                onClick={() => onSelectTenant(slug)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'border-current text-white shadow-sm'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? `${cfg.color}25` : undefined,
                  borderColor: isSelected ? cfg.color : undefined
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span>{cfg.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto block" />

        {/* Custom D3 Tooltip */}
        {hoveredSlice && tooltipPos && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[220px]"
            style={{
              left: `${tooltipPos.x}px`,
              top: '80px'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-[11px] font-mono text-slate-300 font-bold">
                {hoveredSlice.timeLabel}
              </span>
              <span className="text-[10px] text-slate-400">
                Sys Avg: <strong className="text-cyan-400 font-mono">{hoveredSlice.systemAvg}ms</strong>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {Object.entries(TENANTS_CONFIG).map(([slug, cfg]) => {
                if (selectedTenant !== 'ALL' && selectedTenant !== slug) return null;
                const lat = hoveredSlice.tenants[slug] || 0;
                const isBreaching = lat >= 500;
                const isWarning = lat >= 250 && lat < 500;

                return (
                  <div key={slug} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                      <span className="text-slate-300 truncate">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <span
                        className={
                          isBreaching
                            ? 'text-rose-400'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {lat}ms
                      </span>
                      {isBreaching && (
                        <span className="text-[9px] px-1 py-0.2 bg-rose-950 text-rose-300 rounded border border-rose-800">
                          SLA Breach
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>P95: {hoveredSlice.systemP95}ms</span>
              <span>P99: {hoveredSlice.systemP99}ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Reference Thresholds */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span>Warning: 250ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
            <span>Critical SLA: 500ms</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Tip: Hover over curve to inspect millisecond timestamps • Click tenant pill to isolate curve
        </div>
      </div>
    </div>
  );
};
