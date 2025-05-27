// src/components/ui/calendar.tsx
import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface CalendarProps {
  // mode: 'single'; // Removed unused mode prop
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => { // Removed mode from destructuring
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className={`p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left text-gray-600 dark:text-gray-300"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h3 className="font-semibold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right text-gray-600 dark:text-gray-300"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, index) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isTodayDate = isToday(day);

          // Calculate offset for the first day of the month
          const firstDayOfMonth = startOfMonth(currentMonth).getDay();
          const offset = index === 0 ? `col-start-${firstDayOfMonth + 1}` : '';

          return (
            <button
              key={day.toISOString()}
              className={`p-2 rounded-md transition-colors ${offset}
                ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${isTodayDate && !isSelected ? 'border border-primary-500 dark:border-primary-400' : ''}
              `}
              onClick={() => onSelect(day)}
              disabled={!isCurrentMonth} // Disable days outside the current month
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
