"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 400,
  height = 300,
  className = "",
  showLabels = true,
  showValues = true,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = (width - 80) / data.length;
  const chartHeight = height - 60;

  return (
    <div className={cn("bg-white rounded-lg p-4", className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line
          x1={40}
          y1={20}
          x2={40}
          y2={chartHeight + 20}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* X-axis */}
        <line
          x1={40}
          y1={chartHeight + 20}
          x2={width - 20}
          y2={chartHeight + 20}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = 40 + index * barWidth + barWidth * 0.1;
          const y = chartHeight + 20 - barHeight;
          const barColor = item.color || "#3b82f6";

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={barColor}
                className="hover:opacity-80 transition-opacity"
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={x + (barWidth * 0.8) / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.value}
                </text>
              )}

              {/* X-axis label */}
              {showLabels && (
                <text
                  x={x + (barWidth * 0.8) / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = Math.round(maxValue * ratio);
          const y = chartHeight + 20 - ratio * chartHeight;

          return (
            <g key={index}>
              <line
                x1={35}
                y1={y}
                x2={40}
                y2={y}
                stroke="#9ca3af"
                strokeWidth={1}
              />
              <text
                x={30}
                y={y + 3}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface PieChartProps {
  data: ChartData[];
  size?: number;
  className?: string;
  showLabels?: boolean;
  showPercentages?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  className = "",
  showLabels = true,
  showPercentages = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = 0;

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#ec4899",
    "#6366f1",
  ];

  return (
    <div className={cn("bg-white rounded-lg p-4", className)}>
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;

          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ");

          const color = item.color || colors[index % colors.length];

          currentAngle += angle;

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={color}
                className="hover:opacity-80 transition-opacity"
              />

              {showPercentages && percentage > 5 && (
                <text
                  x={
                    centerX +
                    radius * 0.7 * Math.cos((startAngleRad + endAngleRad) / 2)
                  }
                  y={
                    centerY +
                    radius * 0.7 * Math.sin((startAngleRad + endAngleRad) / 2)
                  }
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {percentage.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {showLabels && (
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            const percentage = ((item.value / total) * 100).toFixed(1);

            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-500">({percentage}%)</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface LineChartProps {
  data: Array<{ x: number | string; y: number }>;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 400,
  height = 300,
  className = "",
  color = "#3b82f6",
  showDots = true,
}) => {
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const chartWidth = width - 80;
  const chartHeight = height - 60;

  const points = data.map((point, index) => {
    const x = 40 + (index / (data.length - 1)) * chartWidth;
    const y =
      20 + chartHeight - ((point.y - minY) / (maxY - minY)) * chartHeight;
    return { x, y, originalY: point.y };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className={cn("bg-white rounded-lg p-4", className)}>
      <svg width={width} height={height}>
        {/* Y-axis */}
        <line
          x1={40}
          y1={20}
          x2={40}
          y2={chartHeight + 20}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* X-axis */}
        <line
          x1={40}
          y1={chartHeight + 20}
          x2={width - 20}
          y2={chartHeight + 20}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={2}
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${data[index].x}: ${point.originalY}`}</title>
            </circle>
          ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = Math.round(minY + (maxY - minY) * ratio);
          const y = chartHeight + 20 - ratio * chartHeight;

          return (
            <g key={index}>
              <line
                x1={35}
                y1={y}
                x2={40}
                y2={y}
                stroke="#9ca3af"
                strokeWidth={1}
              />
              <text
                x={30}
                y={y + 3}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 5) === 0) {
            const x = 40 + (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.x}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export { type ChartData };
