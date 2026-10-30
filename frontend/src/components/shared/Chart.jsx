import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, BarChart, Bar, Cell } from 'recharts';

const chartColors = { brand: '#0EA5E9', success: '#10B981', danger: '#EF4444', warning: '#f59e0b', slate: '#64748b' };

export function TrendLineChart({ data, dataKey = 'score', color = chartColors.brand, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GaugeChart({ value = 0, size = 160 }) {
  const getColor = (v) => v >= 80 ? chartColors.success : v >= 60 ? chartColors.warning : v >= 40 ? '#f97316' : chartColors.danger;
  const data = [{ value, fill: getColor(value) }];
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={225} endAngle={-45} barSize={12}>
          <RadialBar background={{ fill: 'rgba(255,255,255,0.06)' }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-black text-white">{value}</span>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}

export function AdherenceBarChart({ data, height = 180 }) {
  const getColor = (pct) => pct >= 90 ? chartColors.success : pct >= 70 ? chartColors.warning : chartColors.danger;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e2e8f0' }} />
        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={getColor(entry.pct)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
export function VitalsTrendChart({ data, height = 240 }) {
  // Sort data by date ascending for the chart
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Format data for XAxis and parse systolic pressure
  const formattedData = sortedData.map(d => {
    let systolic = null;
    if (d.blood_pressure && typeof d.blood_pressure === 'string') {
      const parts = d.blood_pressure.split('/');
      if (parts.length > 0) systolic = parseInt(parts[0]);
    } else if (typeof d.blood_pressure === 'number') {
      systolic = d.blood_pressure;
    }

    return {
      ...d,
      systolic,
      displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });


  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis 
          dataKey="displayDate" 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          axisLine={false} 
          tickLine={false} 
          minTickGap={20}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          axisLine={false} 
          tickLine={false} 
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ 
            background: '#0f172a', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px',
            fontSize: '12px'
          }}
          itemStyle={{ padding: '0' }}
        />
        <Line 
          name="Sugar (mg/dL)"
          type="monotone" 
          dataKey="sugar_level" 
          stroke={chartColors.brand} 
          strokeWidth={3} 
          dot={{ r: 4, fill: chartColors.brand, strokeWidth: 2, stroke: '#0f172a' }} 
          activeDot={{ r: 6 }} 
          connectNulls
        />
        <Line 
          name="Systolic BP (mmHg)"
          type="monotone" 
          dataKey="systolic" 
          stroke={chartColors.success} 
          strokeWidth={3} 
          dot={{ r: 4, fill: chartColors.success, strokeWidth: 2, stroke: '#0f172a' }} 
          activeDot={{ r: 6 }}
          connectNulls
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
