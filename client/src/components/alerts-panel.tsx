import { AlertTriangle, Clock, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@shared/schema";

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="text-red-500" size={18} />;
      case "warning":
        return <Clock className="text-amber-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-amber-600";
      default:
        return "text-blue-600";
    }
  };

  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
      
      <div className="space-y-4" data-testid="alerts-panel">
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getAlertBgColor(alert.severity)}`}
              data-testid={`alert-${alert.id}`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.severity)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getAlertTextColor(alert.severity)}`}>
                    {alert.severity === "critical" ? "Critical Alert" :
                     alert.severity === "warning" ? "Warning" : "Info"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : "Just now"}
                    {alert.sentViaWhatsapp ? " • WhatsApp sent" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent alerts</p>
            <p className="text-xs text-gray-400">System is running smoothly</p>
          </div>
        )}
        
        {alerts.length > 3 && (
          <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2" data-testid="view-all-alerts">
            View All Alerts ({alerts.length})
          </button>
        )}
      </div>
    </div>
  );
}
