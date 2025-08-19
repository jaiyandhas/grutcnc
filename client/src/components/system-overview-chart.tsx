import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import type { Machine } from "@shared/schema";

interface SystemOverviewChartProps {
  machines: Machine[];
}

export function SystemOverviewChart({ machines }: SystemOverviewChartProps) {
  const healthyCount = machines.filter(m => m.remainingLife > 60).length;
  const warningCount = machines.filter(m => m.remainingLife >= 20 && m.remainingLife <= 60).length;
  const criticalCount = machines.filter(m => m.remainingLife < 20).length;

  const data = [
    { name: "Healthy", value: healthyCount, color: "#10B981" },
    { name: "Warning", value: warningCount, color: "#F59E0B" },
    { name: "Critical", value: criticalCount, color: "#EF4444" },
  ].filter(item => item.value > 0);

  const avgHealth = machines.length > 0 
    ? Math.round(machines.reduce((sum, m) => sum + m.remainingLife, 0) / machines.length)
    : 0;
  
  const avgHours = machines.length > 0
    ? Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length)
    : 0;
  
  const avgLoad = machines.length > 0
    ? (machines.reduce((sum, m) => sum + m.loadFactor, 0) / machines.length).toFixed(2)
    : "0.00";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
      <div className="relative h-64" data-testid="system-overview-chart">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-sm">No machines to display</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600" data-testid="avg-health">
            {avgHealth}%
          </div>
          <div className="text-xs text-gray-600">Avg Health</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600" data-testid="avg-hours">
            {avgHours.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Avg Hours</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900" data-testid="avg-load">
            {avgLoad}
          </div>
          <div className="text-xs text-gray-600">Avg Load</div>
        </div>
      </div>
    </div>
  );
}
