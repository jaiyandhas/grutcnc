import { type Machine, type InsertMachine, type UpdateMachine, type Alert, type InsertAlert, type CriticalSpare, type InsertSpare, type UpdateSpare, type MaintenanceLog, type InsertMaintenanceLog } from "@shared/schema";
import { randomUUID } from "crypto";
import { loadCriticalSparesFromCSV } from "./services/csv-loader";

export interface IStorage {
  // Machine operations
  getMachines(): Promise<Machine[]>;
  getMachine(id: string): Promise<Machine | undefined>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: string, machine: UpdateMachine): Promise<Machine | undefined>;
  deleteMachine(id: string): Promise<boolean>;
  simulateWear(): Promise<Machine[]>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  
  // Critical Spares operations
  getCriticalSpares(): Promise<CriticalSpare[]>;
  getCriticalSpare(id: string): Promise<CriticalSpare | undefined>;
  createCriticalSpare(spare: InsertSpare): Promise<CriticalSpare>;
  updateCriticalSpare(id: string, spare: UpdateSpare): Promise<CriticalSpare | undefined>;
  deleteCriticalSpare(id: string): Promise<boolean>;
  loadSparesFromCSV(): Promise<CriticalSpare[]>;
  simulateSpareWear(): Promise<CriticalSpare[]>;
  
  // Maintenance Log operations
  getMaintenanceLogs(spareId?: string): Promise<MaintenanceLog[]>;
  createMaintenanceLog(log: InsertMaintenanceLog): Promise<MaintenanceLog>;
}

export class MemStorage implements IStorage {
  private machines: Map<string, Machine>;
  private alerts: Map<string, Alert>;
  private criticalSpares: Map<string, CriticalSpare>;
  private maintenanceLogs: Map<string, MaintenanceLog>;
  private sparesLoaded: boolean = false;

  constructor() {
    this.machines = new Map();
    this.alerts = new Map();
    this.criticalSpares = new Map();
    this.maintenanceLogs = new Map();
  }

  async getMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }

  async getMachine(id: string): Promise<Machine | undefined> {
    return this.machines.get(id);
  }

  async createMachine(insertMachine: InsertMachine): Promise<Machine> {
    const id = randomUUID();
    const now = new Date();
    const machine: Machine = {
      ...insertMachine,
      id,
      remainingLife: insertMachine.initialLife,
      createdAt: now,
      updatedAt: now,
    };
    this.machines.set(id, machine);
    return machine;
  }

  async updateMachine(id: string, updateData: UpdateMachine): Promise<Machine | undefined> {
    const existing = this.machines.get(id);
    if (!existing) return undefined;

    const updated: Machine = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.machines.set(id, updated);
    return updated;
  }

  async deleteMachine(id: string): Promise<boolean> {
    return this.machines.delete(id);
  }

  async simulateWear(): Promise<Machine[]> {
    const wearRate = 0.05; // 5% wear rate per simulation
    const updatedMachines: Machine[] = [];
    const machineEntries = Array.from(this.machines.entries());

    for (const [id, machine] of machineEntries) {
      const wearAmount = machine.operatingHours * machine.loadFactor * wearRate;
      const newRemainingLife = Math.max(0, machine.remainingLife - wearAmount);
      
      const updated: Machine = {
        ...machine,
        remainingLife: newRemainingLife,
        updatedAt: new Date(),
      };
      
      this.machines.set(id, updated);
      updatedMachines.push(updated);
    }

    return updatedMachines;
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      machineId: insertAlert.machineId || null,
      spareId: insertAlert.spareId || null,
      alertType: insertAlert.alertType || 'wear',
      sentViaWhatsapp: insertAlert.sentViaWhatsapp || 0,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  // Critical Spares operations
  async getCriticalSpares(): Promise<CriticalSpare[]> {
    if (!this.sparesLoaded) {
      await this.loadSparesFromCSV();
    }
    return Array.from(this.criticalSpares.values());
  }

  async getCriticalSpare(id: string): Promise<CriticalSpare | undefined> {
    return this.criticalSpares.get(id);
  }

  async createCriticalSpare(insertSpare: InsertSpare): Promise<CriticalSpare> {
    const id = randomUUID();
    const now = new Date();
    const spare: CriticalSpare = {
      ...insertSpare,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.criticalSpares.set(id, spare);
    return spare;
  }

  async updateCriticalSpare(id: string, updateData: UpdateSpare): Promise<CriticalSpare | undefined> {
    const existing = this.criticalSpares.get(id);
    if (!existing) return undefined;

    const updated: CriticalSpare = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    
    this.criticalSpares.set(id, updated);
    return updated;
  }

  async deleteCriticalSpare(id: string): Promise<boolean> {
    return this.criticalSpares.delete(id);
  }

  async loadSparesFromCSV(): Promise<CriticalSpare[]> {
    if (this.sparesLoaded) {
      return Array.from(this.criticalSpares.values());
    }

    try {
      const sparesData = await loadCriticalSparesFromCSV();
      for (const spareData of sparesData) {
        await this.createCriticalSpare(spareData);
      }
      this.sparesLoaded = true;
      console.log(`Loaded ${sparesData.length} critical spares into storage`);
    } catch (error) {
      console.error('Failed to load spares from CSV:', error);
    }

    return Array.from(this.criticalSpares.values());
  }

  async simulateSpareWear(): Promise<CriticalSpare[]> {
    const spares = Array.from(this.criticalSpares.values());
    
    for (const spare of spares) {
      // Simulate wear progression
      const hourlyWearRate = 100 / (spare.expectedLifeHours || 8760);
      const additionalHours = Math.floor(Math.random() * 168); // Random 0-168 hours (1 week)
      const additionalWear = hourlyWearRate * additionalHours * (spare.loadFactor || 1.0);
      
      const newOperatingHours = (spare.operatingHours || 0) + additionalHours;
      const newWearPercentage = Math.min(100, (spare.wearPercentage || 0) + additionalWear);
      
      // Calculate remaining life and status
      const remainingLifePercentage = Math.max(0, 100 - newWearPercentage);
      
      // Update predicted replacement date
      let predictedDate = null;
      if (remainingLifePercentage > 0 && spare.expectedLifeHours) {
        const remainingHours = spare.expectedLifeHours * (remainingLifePercentage / 100);
        const hoursPerDay = 8; // 8 hours operation per day
        const daysToReplacement = Math.max(1, remainingHours / hoursPerDay);
        predictedDate = new Date(Date.now() + daysToReplacement * 24 * 60 * 60 * 1000);
      }

      await this.updateCriticalSpare(spare.id, {
        operatingHours: newOperatingHours,
        wearPercentage: newWearPercentage,
        predictedReplacementDate: predictedDate,
      });

      // Generate alerts for critical conditions
      if (remainingLifePercentage < 20 || (spare.quantityInHand || 0) < (spare.reorderLevel || 2)) {
        let alertType: 'wear' | 'stock' = remainingLifePercentage < 20 ? 'wear' : 'stock';
        let message = '';
        
        if (remainingLifePercentage < 20) {
          message = `🚨 CRITICAL: ${spare.itemDescription} (${spare.itemCode}) has ${remainingLifePercentage.toFixed(1)}% life remaining. Immediate replacement needed. Cost: ₹${spare.replacementCostInr?.toLocaleString()}`;
        } else {
          message = `📦 LOW STOCK: ${spare.itemDescription} (${spare.itemCode}) has ${spare.quantityInHand} units left (below reorder level of ${spare.reorderLevel})`;
        }

        await this.createAlert({
          spareId: spare.id,
          machineId: null,
          message,
          severity: remainingLifePercentage < 20 ? 'critical' : 'warning',
          alertType,
          sentViaWhatsapp: 0,
        });
      }
    }

    return Array.from(this.criticalSpares.values());
  }

  // Maintenance Log operations
  async getMaintenanceLogs(spareId?: string): Promise<MaintenanceLog[]> {
    const logs = Array.from(this.maintenanceLogs.values());
    if (spareId) {
      return logs.filter(log => log.spareId === spareId);
    }
    return logs;
  }

  async createMaintenanceLog(insertLog: InsertMaintenanceLog): Promise<MaintenanceLog> {
    const id = randomUUID();
    const log: MaintenanceLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.maintenanceLogs.set(id, log);

    // Update the spare's quantity and reset operating hours if it's a replacement
    if (insertLog.spareId && insertLog.maintenanceType === 'replacement') {
      const spare = this.criticalSpares.get(insertLog.spareId);
      if (spare) {
        const newQuantity = Math.max(0, (spare.quantityInHand || 0) - (insertLog.quantityUsed || 1));
        await this.updateCriticalSpare(insertLog.spareId, {
          quantityInHand: newQuantity,
          operatingHours: 0,
          wearPercentage: 0,
          lastMaintenanceDate: new Date(),
        });
      }
    }

    return log;
  }
}

export const storage = new MemStorage();
