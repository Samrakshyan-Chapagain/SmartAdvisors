import React from 'react';
import { DonutChartProps } from '../types/PlanDegreePage';

/**
 * DonutChart Component
 * 
 * Displays a circular progress visualization using SVG with stroke-dashoffset animation.
 * Shows credit hour progress with color transitions based on percentage thresholds.
 * 
 * Validates Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */
const DonutChart: React.FC<DonutChartProps> = ({ percentage, maxHours, currentHours }) => {
  // SVG circle parameters
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offset for the arc (percentage of circumference)
  const strokeOffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on percentage thresholds
  // Blue: < 80%, Amber: 80-100%, Red: > 100%
  const getColor = () => {
    if (percentage > 100) return '#EF4444'; // red
    if (percentage >= 80) return '#F59E0B'; // amber
    return '#0046FF'; // blue
  };
  
  const color = getColor();
  
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle with animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          className="transition-all duration-600 ease-in-out"
          style={{
            transitionProperty: 'stroke-dashoffset, stroke'
          }}
        />
      </svg>
      
      {/* Center text overlay */}
      <div className="absolute flex flex-col items-center justify-center">
        <div 
          className="text-3xl font-bold transition-colors duration-600"
          style={{ color }}
        >
          {Math.round(percentage)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {currentHours} / {maxHours} hrs
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
