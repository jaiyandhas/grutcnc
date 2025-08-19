import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { Machine } from '@shared/schema';

interface OverallWearTrendChartProps {
  machines: Machine[];
}

export function OverallWearTrendChart({ machines }: OverallWearTrendChartProps) {
  // Generate trend data based on current machine states
  const generateTrendData = () => {
    // Calculate the average wear across all machines for different time periods
    const timePoints = ['6 months ago', '5 months ago', '4 months ago', '3 months ago', '2 months ago', '1 month ago', 'Now'];
    
    return timePoints.map((period, index) => {
      // Simulate historical data - in a real system this would come from actual historical data
      const averageLife = machines.length > 0 
        ? machines.reduce((sum, machine) => {
            // Simulate wear progression over time
            const wearRate = (100 - machine.remainingLife) / 6; // Assume 6 months of wear
            const historicalLife = Math.min(100, machine.remainingLife + (wearRate * (6 - index)));
            return sum + historicalLife;
          }, 0) / machines.length
        : 100;
      
      return {
        period: period,
        averageLife: Math.round(averageLife),
        healthyCount: machines.filter(m => {
          const historicalLife = m.remainingLife + ((100 - m.remainingLife) / 6) * (6 - index);
          return historicalLife > 60;
        }).length,
        warningCount: machines.filter(m => {
          const historicalLife = m.remainingLife + ((100 - m.remainingLife) / 6) * (6 - index);
          return historicalLife >= 20 && historicalLife <= 60;
        }).length,
        criticalCount: machines.filter(m => {
          const historicalLife = m.remainingLife + ((100 - m.remainingLife) / 6) * (6 - index);
          return historicalLife < 20;
        }).length,
      };
    });
  };

  const trendData = generateTrendData();
  const currentAverage = trendData[trendData.length - 1]?.averageLife || 0;
  const previousAverage = trendData[trendData.length - 2]?.averageLife || 0;
  const trend = currentAverage - previousAverage;

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600 font-semibold">
            Avg. Life: {data.averageLife}%
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-green-600">Healthy: {data.healthyCount}</p>
            <p className="text-amber-600">Warning: {data.warningCount}</p>
            <p className="text-red-600">Critical: {data.criticalCount}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Wear Trend</h3>
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs last month
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Average</p>
            <p className="text-2xl font-bold text-gray-900">{currentAverage}%</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLife" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="averageLife"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLife)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Healthy</p>
            <p className="text-lg font-bold text-green-700">{trendData[trendData.length - 1]?.healthyCount || 0}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600 font-medium">Warning</p>
            <p className="text-lg font-bold text-amber-700">{trendData[trendData.length - 1]?.warningCount || 0}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-lg font-bold text-red-700">{trendData[trendData.length - 1]?.criticalCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}