import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendDirection = null,
  color = 'blue',
  onClick = null
}) => {
  const getTrendIcon = () => {
    if (!trend || !trendDirection) return null;
    return trendDirection === 'up' ? '↗️' : '↘️';
  };

  const getTrendClass = () => {
    if (!trend || !trendDirection) return '';
    return trendDirection === 'up' ? 'trend-up' : 'trend-down';
  };

  return (
    <div 
      className={`stat-card stat-card-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <div className="stat-icon">
          {icon}
        </div>
        {trend && (
          <div className={`trend-indicator ${getTrendClass()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{trend}%</span>
          </div>
        )}
      </div>
      
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;