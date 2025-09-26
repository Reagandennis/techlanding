'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartProps {
  title: string;
  description?: string;
  data: any[];
  height?: number;
  className?: string;
}

interface LineChartProps extends ChartProps {
  xDataKey: string;
  lines: {
    dataKey: string;
    stroke: string;
    name: string;
    strokeWidth?: number;
    type?: 'monotone' | 'linear' | 'step';
  }[];
  showGrid?: boolean;
  showLegend?: boolean;
}

interface AreaChartProps extends ChartProps {
  xDataKey: string;
  areas: {
    dataKey: string;
    fill: string;
    stroke: string;
    name: string;
    stackId?: string;
  }[];
  stacked?: boolean;
}

interface BarChartProps extends ChartProps {
  xDataKey: string;
  bars: {
    dataKey: string;
    fill: string;
    name: string;
    stackId?: string;
  }[];
  horizontal?: boolean;
}

interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
];

export const AnalyticsLineChart: React.FC<LineChartProps> = ({
  title,
  description,
  data,
  xDataKey,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type={line.type || 'monotone'}
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                name={line.name}
                dot={{ fill: line.stroke, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const AnalyticsAreaChart: React.FC<AreaChartProps> = ({
  title,
  description,
  data,
  xDataKey,
  areas,
  height = 300,
  stacked = false,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                stackId={stacked ? area.stackId || '1' : undefined}
                stroke={area.stroke}
                fill={area.fill}
                name={area.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const AnalyticsBarChart: React.FC<BarChartProps> = ({
  title,
  description,
  data,
  xDataKey,
  bars,
  height = 300,
  horizontal = false,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout={horizontal ? 'horizontal' : 'vertical'}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {horizontal ? (
              <>
                <XAxis type="number" />
                <YAxis dataKey={xDataKey} type="category" />
              </>
            ) : (
              <>
                <XAxis dataKey={xDataKey} />
                <YAxis />
              </>
            )}
            <Tooltip />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                stackId={bar.stackId}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const AnalyticsPieChart: React.FC<PieChartProps> = ({
  title,
  description,
  data,
  dataKey,
  nameKey,
  colors = COLORS,
  height = 300,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 80,
  className,
}) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? renderCustomizedLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={`flex items-center ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ProgressChartProps {
  title: string;
  data: { name: string; completed: number; total: number; color: string }[];
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.completed / item.total) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">
                  {item.completed}/{item.total} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

interface ComparisonChartProps extends ChartProps {
  xDataKey: string;
  compareData: {
    current: any[];
    previous: any[];
  };
  dataKey: string;
  currentLabel: string;
  previousLabel: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title,
  description,
  compareData,
  xDataKey,
  dataKey,
  currentLabel,
  previousLabel,
  height = 300,
  className,
}) => {
  // Merge current and previous data for comparison
  const mergedData = compareData.current.map((currentItem, index) => {
    const previousItem = compareData.previous[index] || {};
    return {
      ...currentItem,
      [`previous_${dataKey}`]: previousItem[dataKey] || 0,
      [`current_${dataKey}`]: currentItem[dataKey],
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={`current_${dataKey}`} fill="#0088FE" name={currentLabel} />
            <Bar dataKey={`previous_${dataKey}`} fill="#00C49F" name={previousLabel} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};