import React, { ReactNode } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'from last period',
  color = 'primary'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-white';
      case 'secondary':
        return 'bg-secondary text-white';
      case 'success':
        return 'bg-success text-white';
      case 'warning':
        return 'bg-warning text-white';
      case 'error':
        return 'bg-error text-white';
      case 'accent':
        return 'bg-accent text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-500'; // Handle undefined change explicitly
    return change > 0 ? 'text-success' : 'text-error';
  };

  const getChangeIcon = () => {
    if (change === undefined) return null; // Handle undefined change explicitly
    return change > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {/* Changed $ to K for value display */}
            <h3 className="text-2xl font-bold mt-2">{value}</h3> 
            
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
                {getChangeIcon()}
                {/* Changed $ to K for change display */}
                <span className="ml-1">{Math.abs(change)}%</span> 
                <span className="ml-1 text-gray-500">{changeLabel}</span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${getColorClasses()}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
