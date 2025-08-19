import { storage } from "../storage";
import { sendWhatsAppAlert } from "./whatsapp";

interface RealtimeEngine {
  start(): void;
  stop(): void;
}

class TwinAIRealtimeEngine implements RealtimeEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting TwinAI Real-time Engine...');
    this.isRunning = true;
    
    // Run every 30 seconds for real-time impact
    this.intervalId = setInterval(async () => {
      await this.processRealtimeUpdates();
    }, 30000);

    // Initial run
    this.processRealtimeUpdates();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ TwinAI Real-time Engine stopped');
  }

  private async processRealtimeUpdates() {
    try {
      console.log('⚡ Processing real-time updates...');
      
      // Simulate machine wear
      const updatedMachines = await storage.simulateWear();
      let machineAlerts = 0;
      
      for (const machine of updatedMachines) {
        if (machine.remainingLife < 20) {
          const alertSent = await sendWhatsAppAlert(
            machine.name, 
            machine.componentType, 
            machine.remainingLife,
            machine.replacementCost
          );
          
          await storage.createAlert({
            machineId: machine.id,
            spareId: null,
            message: `🚨 URGENT: ${machine.name}'s ${machine.componentType} at ${machine.remainingLife.toFixed(1)}% life. Replace immediately! Cost: ₹${machine.replacementCost.toLocaleString()}`,
            severity: "critical",
            alertType: "wear",
            sentViaWhatsapp: alertSent ? 1 : 0,
          });
          machineAlerts++;
        }
      }

      // Simulate spare wear and inventory changes
      const updatedSpares = await storage.simulateSpareWear();
      let spareAlerts = 0;
      
      for (const spare of updatedSpares) {
        const remainingLife = Math.max(0, 100 - (spare.wearPercentage || 0));
        const isLowStock = (spare.quantityInHand || 0) <= (spare.reorderLevel || 2);
        
        if (remainingLife < 20 || isLowStock) {
          let message = '';
          let alertType: 'wear' | 'stock' = 'wear';
          
          if (remainingLife < 20) {
            message = `🔧 CRITICAL: ${spare.itemDescription} (${spare.itemCode}) has ${remainingLife.toFixed(1)}% life remaining. Immediate replacement needed! Cost: ₹${(spare.replacementCostInr || 0).toLocaleString()}`;
          } else {
            message = `📦 STOCK ALERT: ${spare.itemDescription} (${spare.itemCode}) has only ${spare.quantityInHand} units left. Reorder now!`;
            alertType = 'stock';
          }
          
          const alertSent = await sendWhatsAppAlert(
            spare.itemCode, 
            spare.itemDescription, 
            remainingLife,
            spare.replacementCostInr || 0
          );
          spareAlerts++;
        }
      }

      // Randomly consume inventory to simulate real usage
      if (Math.random() > 0.7) {
        await this.simulateInventoryConsumption();
      }

      console.log(`✅ Real-time update complete: ${machineAlerts} machine alerts, ${spareAlerts} spare alerts sent`);
      
    } catch (error) {
      console.error('❌ Error in real-time processing:', error);
    }
  }

  private async simulateInventoryConsumption() {
    try {
      const spares = await storage.getCriticalSpares();
      const randomSpares = spares.filter(() => Math.random() > 0.9); // 10% chance per spare
      
      for (const spare of randomSpares) {
        if ((spare.quantityInHand || 0) > 0) {
          const consumedQuantity = Math.floor(Math.random() * 2) + 1; // 1-2 units
          const newQuantity = Math.max(0, (spare.quantityInHand || 0) - consumedQuantity);
          
          await storage.updateCriticalSpare(spare.id, {
            quantityInHand: newQuantity
          });

          // Create maintenance log for the consumption
          await storage.createMaintenanceLog({
            spareId: spare.id,
            maintenanceType: 'repair',
            quantityUsed: consumedQuantity,
            cost: (spare.replacementCostInr || 0) * 0.1, // 10% of replacement cost
            notes: 'Automated consumption - real-time usage simulation',
            performedBy: 'System Auto-Tracking'
          });

          console.log(`📉 Consumed ${consumedQuantity} units of ${spare.itemCode}, remaining: ${newQuantity}`);
        }
      }
    } catch (error) {
      console.error('Error simulating inventory consumption:', error);
    }
  }
}

export const realtimeEngine = new TwinAIRealtimeEngine();