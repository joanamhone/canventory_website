import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { subDays, format, addDays, isWithinInterval, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { useAppContext } from '../../context/AppContext'; // Import useAppContext

const RevenueChart: React.FC = () => {
  const { payments, treatments } = useAppContext(); // Get payments and treatments from AppContext
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Helper to ensure dates are treated as start/end of day for interval checks
  const getStartOfDay = (date: Date) => startOfDay(date);
  const getEndOfDay = (date: Date) => endOfDay(date);

  // Memoized data generation based on timeRange, payments, and treatments
  const data = useMemo(() => {
    let startDate: Date;
    const endDate = new Date(); // Always current date

    switch (timeRange) {
      case 'week':
        startDate = subDays(endDate, 6); // Last 7 days including today
        break;
      case 'month':
        startDate = subDays(endDate, 29); // Last 30 days including today
        break;
      case 'year':
        startDate = subDays(endDate, 364); // Last 365 days including today
        break;
      default:
        startDate = subDays(endDate, 29); // Default to month
    }

    const dataMap: { [key: string]: { date: string; revenue: number; medication: number; services: number } } = {};

    // Initialize data points for each day in the range
    const numDays = differenceInDays(endDate, startDate) + 1;
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const formattedDate = format(date, 'MMM dd');
      dataMap[formattedDate] = { date: formattedDate, revenue: 0, medication: 0, services: 0 };
    }

    // Aggregate payments for total revenue
    payments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      if (isWithinInterval(paymentDate, { start: getStartOfDay(startDate), end: getEndOfDay(endDate) })) {
        const formattedDate = format(paymentDate, 'MMM dd');
        if (dataMap[formattedDate]) {
          dataMap[formattedDate].revenue += payment.amount;
        }
      }
    });

    // Aggregate treatment costs for medication and services revenue
    treatments.forEach(treatment => {
      const treatmentDate = new Date(treatment.date);
      if (isWithinInterval(treatmentDate, { start: getStartOfDay(startDate), end: getEndOfDay(endDate) })) {
        const formattedDate = format(treatmentDate, 'MMM dd');
        if (dataMap[formattedDate]) {
          const medsCost = treatment.medications?.reduce((sum, med) => sum + (med.totalCost ?? 0), 0) || 0;
          const servicesCost = treatment.services?.reduce((sum, service) => sum + (service.cost ?? 0), 0) || 0;
          dataMap[formattedDate].medication += medsCost;
          dataMap[formattedDate].services += servicesCost;
        }
      }
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [timeRange, payments, treatments]); // Dependencies for useMemo

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              <span className="font-semibold">{entry.name}:</span> K{entry.value.toFixed(2)} {/* Changed $ to K */}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Revenue Overview</h3>

        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as 'week' | 'month' | 'year')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#42052d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#42052d" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorMedication" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5dd3" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6c5dd3" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffa84a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffa84a" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#f0f0f0' }}
              tick={{ fontSize: 12, fill: '#718096' }}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={(value) => `K${value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#718096' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#42052d"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Total Revenue"
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="medication"
              stroke="#6c5dd3"
              fillOpacity={1}
              fill="url(#colorMedication)"
              name="Medication"
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="services"
              stroke="#ffa84a"
              fillOpacity={1}
              fill="url(#colorServices)"
              name="Services"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
