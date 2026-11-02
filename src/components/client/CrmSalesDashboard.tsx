import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CrmLead, CrmDeal } from './CrmModule';

interface Props {
  leads: CrmLead[];
  deals: CrmDeal[];
}

export const CrmSalesDashboard: React.FC<Props> = ({ leads, deals }) => {
  const winLossRef = useRef<SVGSVGElement>(null);
  const cycleTimeRef = useRef<SVGSVGElement>(null);
  const repActivityRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!winLossRef.current || !cycleTimeRef.current || !repActivityRef.current) return;

    // 1. Win/Loss Ratio (Pie Chart)
    const won = deals.filter(d => d.stage === 'Closed Won').length + leads.filter(l => l.status === 'CLOSED_WON').length;
    const lost = deals.filter(d => d.stage === 'Closed Lost').length + leads.filter(l => l.status === 'CLOSED_LOST').length;
    
    const data = [
      { label: 'Won', value: won, color: '#10b981' }, // emerald-500
      { label: 'Lost', value: lost, color: '#f43f5e' }, // rose-500
    ];

    d3.select(winLossRef.current).selectAll('*').remove();
    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select(winLossRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<{label: string, value: number, color: string}>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<{label: string, value: number, color: string}>>().innerRadius(radius * 0.5).outerRadius(radius);

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color);

    // 2. Average Deal Cycle Time (Bar Chart) - Placeholder Logic
    d3.select(cycleTimeRef.current).selectAll('*').remove();
    const cycleData = [
      { stage: 'Prospecting', days: 5 },
      { stage: 'Qualified', days: 8 },
      { stage: 'Negotiation', days: 12 },
    ];
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 300 - margin.left - margin.right;
    const chartHeight = 200 - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(cycleData.map(d => d.stage)).range([0, chartWidth]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(cycleData, d => d.days) || 0]).range([chartHeight, 0]);

    const svgCycle = d3.select(cycleTimeRef.current)
      .attr('width', 300)
      .attr('height', 200)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svgCycle.selectAll('rect')
      .data(cycleData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.stage) || 0)
      .attr('y', d => y(d.days))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.days))
      .attr('fill', '#06b6d4'); // cyan-500

    // 3. Rep Activity Scores (Bar Chart) - Placeholder Logic
    d3.select(repActivityRef.current).selectAll('*').remove();
    const repData = [
      { name: 'Rep A', score: 85 },
      { name: 'Rep B', score: 65 },
      { name: 'Rep C', score: 90 },
    ];
    
    const svgRep = d3.select(repActivityRef.current)
      .attr('width', 300)
      .attr('height', 200)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xRep = d3.scaleBand().domain(repData.map(d => d.name)).range([0, chartWidth]).padding(0.2);
    const yRep = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    svgRep.selectAll('rect')
      .data(repData)
      .enter()
      .append('rect')
      .attr('x', d => xRep(d.name) || 0)
      .attr('y', d => yRep(d.score))
      .attr('width', xRep.bandwidth())
      .attr('height', d => chartHeight - yRep(d.score))
      .attr('fill', '#8b5cf6'); // violet-500

  }, [leads, deals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-100">Win/Loss Ratio</h3>
        <svg ref={winLossRef} className="mx-auto" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-100">Avg Cycle Time (Days)</h3>
        <svg ref={cycleTimeRef} className="mx-auto" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-100">Rep Activity Score</h3>
        <svg ref={repActivityRef} className="mx-auto" />
      </div>
    </div>
  );
};
