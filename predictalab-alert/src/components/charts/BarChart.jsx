import React from 'react';

const BarChart = ({ data, title, height = 300 }) => {
  // Simple bar chart using CSS and divs
  const maxValue = Math.max(...data.map(item => 
    Math.max(...Object.keys(item).filter(key => key !== 'month' && key !== 'name').map(key => item[key]))
  ));

  const getDataKeys = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'month' && key !== 'name');
  };

  const getColorForKey = (key, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      
      <div className="bar-chart" style={{ height: `${height}px` }}>
        <div className="chart-grid">
          {/* Y-axis labels */}
          <div className="y-axis">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="y-label">
                {Math.round((maxValue * (4 - index)) / 4)}
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="chart-area">
            {/* Grid lines */}
            <div className="grid-lines">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid-line horizontal"></div>
              ))}
            </div>

            {/* Bars */}
            <div className="bars-container">
              {data.map((item, itemIndex) => (
                <div key={itemIndex} className="bar-group">
                  {getDataKeys().map((key, keyIndex) => (
                    <div
                      key={key}
                      className="bar"
                      style={{
                        height: `${(item[key] * 100) / maxValue}%`,
                        backgroundColor: getColorForKey(key, keyIndex)
                      }}
                      title={`${key}: ${item[key]}`}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-axis */}
        <div className="x-axis">
          {data.map((item, index) => (
            <div key={index} className="x-label">
              {item.month || item.name}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        {getDataKeys().map((key, index) => (
          <div key={key} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: getColorForKey(key, index) }}
            ></div>
            <span className="legend-label">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;