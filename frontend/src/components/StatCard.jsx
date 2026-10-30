import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, trend }) {
  return (
    <div className="card-panel group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">{label}</h3>
        {Icon && <Icon className="w-5 h-5 text-primary opacity-80" />}
      </div>
      <div className="flex items-end gap-3">
        <h2 className="text-3xl font-display font-bold text-text-primary">{value}</h2>
        {trend && (
          <span className={`text-sm font-medium mb-1 ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="text-sm text-text-secondary mt-2">{subtext}</p>}
    </div>
  );
}
