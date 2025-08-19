import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

export function LiveIndicator() {
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Pulse animation for live status
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className={`font-medium ${isLive ? 'text-green-700' : 'text-gray-500'}`}>
          {isLive ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      <div className="text-xs text-gray-500">
        Real-time monitoring • Auto-alerts enabled
      </div>
    </div>
  );
}