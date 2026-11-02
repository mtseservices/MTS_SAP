import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TenantErrorBreakdown } from '../../../services/auditInsightsService';

interface D3ErrorFrequencyChartProps {
  data: TenantErrorBreakdown[];
  selectedTenant: string;
  onSelectTenant: (slug: string) => void;
}

const ERROR_SERIES = [
  { key: 'gatewayErrors502_503', label: '502/503 Gateway Timeout', color: '#f43f5e' },
  { key: 'rateLimits429', label: '429 Rate Limit Throttled', color: '#f59e0b' },
  { key: 'serverErrors500', label: '500 Internal Server', color: '#ec4899' },
  { key: 'clientErrors4xx', label: '4xx Bad Request / Client', color: '#38bdf8' }
];

export const D3ErrorFrequencyChart: React.FC<D3ErrorFrequencyChartProps> = ({
  data,
  selectedTenant,
  onSelectTenant
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredTenant, setHoveredTenant] = useState<TenantErrorBreakdown | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = 300;
    const margin = { top: 25, right: 25, bottom: 45, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto; font-family: inherit;');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Tenants
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.tenantSlug))
      .range([0, innerWidth])
      .padding(0.35);

    // D3 Stack Generator
    const stackKeys = ['clientErrors4xx', 'serverErrors500', 'rateLimits429', 'gatewayErrors502_503'] as const;
    const stack = d3
      .stack<TenantErrorBreakdown>()
      .keys(stackKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data);

    // Y Scale: Total Errors Max
    const maxVal = d3.max(series, (layer) => d3.max(layer, (d) => d[1])) || 60;
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.15]).range([innerHeight, 0]).nice();

    // Horizontal Grid Lines
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // Color Map
    const colorMap: Record<string, string> = {
      clientErrors4xx: '#38bdf8',
      serverErrors500: '#ec4899',
      rateLimits429: '#f59e0b',
      gatewayErrors502_503: '#f43f5e'
    };

    // Draw Stacked Layers
    const layers = g
      .selectAll('g.layer')
      .data(series)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => colorMap[d.key] || '#94a3b8');

    layers
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.data.tenantSlug) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('rx', 3)
      .attr('stroke', (d) => (selectedTenant === d.data.tenantSlug ? '#ffffff' : 'none'))
      .attr('stroke-width', (d) => (selectedTenant === d.data.tenantSlug ? 2 : 0))
      .style('cursor', 'pointer')
      .on('click', function (_, d) {
        onSelectTenant(d.data.tenantSlug === selectedTenant ? 'ALL' : d.data.tenantSlug);
      })
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 0.85);
        setHoveredTenant(d.data);
        const [mx] = d3.pointer(event, container);
        setTooltipPos({ x: mx, y: event.clientY });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1.0);
        setHoveredTenant(null);
        setTooltipPos(null);
      })
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]));

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickFormat((slug) => {
      const match = data.find((d) => d.tenantSlug === slug);
      if (!match) return String(slug);
      return match.tenantName.split(' ')[0];
    });

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', (slug) => (selectedTenant === slug ? '#38bdf8' : '#94a3b8'))
      .attr('font-size', '11px')
      .attr('font-weight', (slug) => (selectedTenant === slug ? 'bold' : 'normal'))
      .attr('dy', '1em');

    xAxisGroup.selectAll('line').attr('stroke', '#334155');
    xAxisGroup.select('.domain').attr('stroke', '#334155');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    yAxisGroup.selectAll('line').attr('stroke', '#334155');
    yAxisGroup.select('.domain').attr('stroke', '#334155');

    // Total Count labels on top of bars
    data.forEach((d) => {
      const x = (xScale(d.tenantSlug) || 0) + xScale.bandwidth() / 2;
      const y = yScale(d.totalErrors) - 6;

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('fill', d.severity === 'CRITICAL' ? '#f43f5e' : d.severity === 'DEGRADED' ? '#f59e0b' : '#38bdf8')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'monospace')
        .text(`${d.totalErrors}`);
    });
  }, [data, selectedTenant]);

  return (
    <div className="relative w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Error Log Frequency by Tenant
            </h3>
          </div>
          <span className="text-[11px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
            D3.js Stacked Bar
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Distribution of 4xx, 429, 502/503 gateway timeouts, and 500 exceptions across tenant environments.
        </p>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden my-2">
        <svg ref={svgRef} className="w-full h-auto block" />

        {/* Hover Tooltip */}
        {hoveredTenant && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[240px]"
            style={{
              left: `${tooltipPos?.x || 150}px`,
              top: '70px'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-xs font-bold text-slate-200">
                {hoveredTenant.tenantName}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredTenant.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : hoveredTenant.severity === 'DEGRADED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {hoveredTenant.errorRatePct}% Failure Rate
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Gateway 502/503:
                </span>
                <strong className="font-mono text-rose-400">{hoveredTenant.gatewayErrors502_503}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Rate Limits 429:
                </span>
                <strong className="font-mono text-amber-400">{hoveredTenant.rateLimits429}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  Server Errors 500:
                </span>
                <strong className="font-mono text-pink-400">{hoveredTenant.serverErrors500}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Client Errors 4xx:
                </span>
                <strong className="font-mono text-sky-400">{hoveredTenant.clientErrors4xx}</strong>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] text-slate-400">Top Failing Endpoint:</div>
              <div className="text-[10px] font-mono text-rose-300 truncate mt-0.5">
                {hoveredTenant.topFailingEndpoint}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        {ERROR_SERIES.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
