import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BottleneckCandidate } from '../../../services/auditInsightsService';

interface D3BottleneckBubblePlotProps {
  data: BottleneckCandidate[];
  selectedBottleneckId: string | null;
  onSelectBottleneck: (id: string) => void;
}

export const D3BottleneckBubblePlot: React.FC<D3BottleneckBubblePlotProps> = ({
  data,
  selectedBottleneckId,
  onSelectBottleneck
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<BottleneckCandidate | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 360;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };
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

    // X Scale: Request Concurrency (req/min)
    const maxX = (d3.max(data, (d) => d.requestRatePerMin) || 300) * 1.25;
    const xScale = d3.scaleLinear().domain([0, maxX]).range([0, innerWidth]).nice();

    // Y Scale: Average Latency (ms)
    const maxY = (d3.max(data, (d) => d.avgLatencyMs) || 900) * 1.2;
    const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();

    // Bubble Radius Scale: based on error count
    const rScale = d3.scaleSqrt().domain([0, 100]).range([12, 34]);

    // Background Bottleneck Alert Quadrant (Top Right)
    // Latency >= 250ms & Request Rate >= 80 req/min
    const quadX = xScale(80);
    const quadY = yScale(250);

    // High Bottleneck Risk Zone
    g.append('rect')
      .attr('x', quadX)
      .attr('y', 0)
      .attr('width', innerWidth - quadX)
      .attr('height', quadY)
      .attr('fill', '#f43f5e')
      .attr('fill-opacity', 0.05)
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-opacity', 0.25)
      .attr('rx', 6);

    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .attr('fill', '#f43f5e')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .text('⚠️ CRITICAL BOTTLENECK ZONE (Latency > 250ms & High Traffic)');

    // Optimal Zone (Bottom Left)
    g.append('rect')
      .attr('x', 0)
      .attr('y', quadY)
      .attr('width', quadX)
      .attr('height', innerHeight - quadY)
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.03)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-opacity', 0.15)
      .attr('rx', 6);

    g.append('text')
      .attr('x', 12)
      .attr('y', innerHeight - 12)
      .attr('fill', '#10b981')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('✓ OPTIMAL THROUGHPUT ZONE');

    // Horizontal & Vertical Grid Lines
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    const xAxisGrid = d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat((d) => `${d} req/m`);
    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    xAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px').attr('dy', '1em');
    xAxisGroup.selectAll('line').attr('stroke', '#334155');
    xAxisGroup.select('.domain').attr('stroke', '#334155');

    // X Axis Title
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Traffic Concurrency (Requests per Minute)');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat((d) => `${d}ms`);
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '10px');
    yAxisGroup.selectAll('line').attr('stroke', '#334155');
    yAxisGroup.select('.domain').attr('stroke', '#334155');

    // Y Axis Title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Average Latency (ms)');

    // Bubble Groups
    const nodes = g
      .selectAll('g.bubble-node')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bubble-node')
      .attr('transform', (d) => `translate(${xScale(d.requestRatePerMin)}, ${yScale(d.avgLatencyMs)})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => onSelectBottleneck(d.id))
      .on('mouseenter', function (event, d) {
        d3.select(this).raise();
        setHoveredNode(d);
        const [mx] = d3.pointer(event, container);
        setTooltipPos({ x: mx, y: event.clientY });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        setTooltipPos(null);
      });

    // Pulsing outer ring for Critical nodes
    nodes
      .filter((d) => d.severity === 'CRITICAL')
      .append('circle')
      .attr('r', (d) => rScale(d.errorCount) + 7)
      .attr('fill', 'none')
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)
      .attr('stroke-dasharray', '2,2');

    // Selected indicator ring
    nodes
      .filter((d) => d.id === selectedBottleneckId)
      .append('circle')
      .attr('r', (d) => rScale(d.errorCount) + 5)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 3);

    // Primary Bubble Circle
    nodes
      .append('circle')
      .attr('r', (d) => rScale(d.errorCount))
      .attr('fill', (d) =>
        d.severity === 'CRITICAL'
          ? '#f43f5e'
          : d.severity === 'WARNING'
          ? '#f59e0b'
          : '#10b981'
      )
      .attr('fill-opacity', (d) => (d.id === selectedBottleneckId ? 0.95 : 0.75))
      .attr('stroke', (d) =>
        d.severity === 'CRITICAL'
          ? '#fda4af'
          : d.severity === 'WARNING'
          ? '#fcd34d'
          : '#6ee7b7'
      )
      .attr('stroke-width', 2);

    // Bubble Center Label (Short code or error count)
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text((d) => (d.errorCount > 0 ? `${d.errorCount} err` : `${d.avgLatencyMs}ms`));

    // Endpoint Name tag above bubble
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (d) => -(rScale(d.errorCount) + 6))
      .attr('fill', (d) => (d.id === selectedBottleneckId ? '#38bdf8' : '#cbd5e1'))
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => {
        const parts = d.endpoint.split('/');
        return parts[parts.length - 1] || d.endpoint;
      });
  }, [data, selectedBottleneckId]);

  return (
    <div className="relative w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100">
              D3 Bottleneck Scatter Matrix (Latency vs Concurrency vs Errors)
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              Bubble Radius ∝ Error Frequency
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pinpoints services located in the high-latency / high-error hazard zone. Click any bubble to inspect root cause & simulate mitigation.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Degraded (150-350ms)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Critical Bottleneck (&gt;350ms)</span>
          </div>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto block" />

        {/* Floating Tooltip */}
        {hoveredNode && tooltipPos && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md min-w-[280px]"
            style={{
              left: `${tooltipPos.x}px`,
              top: '90px'
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-xs font-bold text-slate-200">
                {hoveredNode.tenantName}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredNode.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : hoveredNode.severity === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {hoveredNode.severity} BOTTLENECK
              </span>
            </div>

            <div className="text-[11px] font-mono text-cyan-300 break-all mb-2">
              {hoveredNode.endpoint}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Avg Latency:</span>
                <strong className="text-slate-100 font-mono text-sm">{hoveredNode.avgLatencyMs}ms</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">P99 Latency:</span>
                <strong className="text-amber-400 font-mono text-sm">{hoveredNode.p99LatencyMs}ms</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Traffic Rate:</span>
                <strong className="text-slate-100 font-mono">{hoveredNode.requestRatePerMin} req/m</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Error Rate:</span>
                <strong className="text-rose-400 font-mono">{hoveredNode.errorRatePct}% ({hoveredNode.errorCount} err)</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Root Cause:</span> {hoveredNode.rootCause}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
              Click bubble to view root cause diagnostic & mitigation action →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
