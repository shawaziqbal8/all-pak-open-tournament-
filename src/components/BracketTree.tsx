import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MatchScore } from '../types';

interface TreeNode {
  name: string;
  match?: MatchScore;
  children?: TreeNode[];
}

export default function BracketTree({ matches }: { matches: MatchScore[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || matches.length === 0) return;

    // Build a mock hierarchy for demonstration
    // Since matches aren't explicitly structured as a tree in the db, 
    // we'll link them linearly or visually arrange them.
    const rootData: TreeNode = {
      name: "Finals",
      children: [
        { name: "Semifinal 1", children: [{ name: "Quarter 1" }, { name: "Quarter 2" }]},
        { name: "Semifinal 2", children: [{ name: "Quarter 3" }, { name: "Quarter 4" }]}
      ]
    };

    const width = 800;
    const height = 400;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', 'translate(50, 0)');

    const tree = d3.tree<TreeNode>().size([height, width - 200]);
    const root = d3.hierarchy(rootData);
    tree(root);

    // Links (lines)
    g.selectAll('.link')
      .data(root.links())
      .join('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#334155')
        .attr('stroke-width', 2)
        .attr('d', d3.linkHorizontal<any, any>()
          .x(d => d.y)
          .y(d => d.x)
        );

    // Nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);

    // Match Box
    node.append('rect')
      .attr('width', 120)
      .attr('height', 50)
      .attr('y', -25)
      .attr('rx', 6)
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569');

    // Text Label
    node.append('text')
      .attr('dy', 5)
      .attr('dx', 10)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#f8fafc')
      .text(d => {
        // If we have actual matches, render the match teams, else render the node name
        const matchInfo = matches.find((m, idx) => idx === d.depth * 2); // random mapping for demo
        if (matchInfo) {
           return `${matchInfo.team1} vs ${matchInfo.team2}`;
        }
        return d.data.name;
      });

  }, [matches]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full overflow-x-auto min-h-[450px]">
      <h3 className="text-xl font-bold text-white mb-4">Live Tournament Bracket</h3>
      {matches.length === 0 ? (
        <p className="text-slate-500 text-sm">No match data available to generate bracket.</p>
      ) : (
        <svg ref={svgRef}></svg>
      )}
    </div>
  );
}
