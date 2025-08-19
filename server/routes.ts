import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMachineSchema, updateMachineSchema, type InsertMachine, type UpdateMachine, insertSpareSchema, updateSpareSchema, insertMaintenanceLogSchema } from "@shared/schema";
import { sendWhatsAppAlert, sendWhatsAppMessage } from "./services/whatsapp";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all machines
  app.get("/api/machines", async (_req, res) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch machines" });
    }
  });

  // Get single machine
  app.get("/api/machines/:id", async (req, res) => {
    try {
      const machine = await storage.getMachine(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch machine" });
    }
  });

  // Create new machine
  app.post("/api/machines", async (req, res) => {
    try {
      const validatedData = insertMachineSchema.parse(req.body);
      const machine = await storage.createMachine(validatedData);
      
      // Check if machine is below threshold and send alert
      if (machine.remainingLife < 20) {
        const alertSent = await sendWhatsAppAlert(machine.name, machine.componentType, machine.remainingLife, machine.replacementCost);
        await storage.createAlert({
          machineId: machine.id,
          spareId: null,
          message: `${machine.name}'s ${machine.componentType} is below safe threshold at ${machine.remainingLife.toFixed(1)}%. Replacement cost: ₹${machine.replacementCost.toLocaleString()}`,
          severity: "critical",
          alertType: "wear",
          sentViaWhatsapp: alertSent ? 1 : 0,
        });
      }
      
      res.status(201).json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create machine" });
    }
  });

  // Update machine
  app.put("/api/machines/:id", async (req, res) => {
    try {
      const validatedData = updateMachineSchema.parse(req.body);
      const updatedMachine = await storage.updateMachine(req.params.id, validatedData);
      
      if (!updatedMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      res.json(updatedMachine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update machine" });
    }
  });

  // Delete machine
  app.delete("/api/machines/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMachine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete machine" });
    }
  });

  // Simulate wear for all machines
  app.post("/api/simulate", async (_req, res) => {
    try {
      const updatedMachines = await storage.simulateWear();
      
      // Check for machines that crossed the critical threshold and send alerts
      for (const machine of updatedMachines) {
        if (machine.remainingLife < 20) {
          const alertSent = await sendWhatsAppAlert(machine.name, machine.componentType, machine.remainingLife, machine.replacementCost);
          await storage.createAlert({
            machineId: machine.id,
            spareId: null,
            message: `${machine.name}'s ${machine.componentType} is below safe threshold at ${machine.remainingLife.toFixed(1)}%. Replacement cost: ₹${machine.replacementCost.toLocaleString()}`,
            severity: "critical",
            alertType: "wear",
            sentViaWhatsapp: alertSent ? 1 : 0,
          });
        }
      }
      
      res.json(updatedMachines);
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate wear" });
    }
  });

  // Get all alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Send a WhatsApp message (either simple Body or Content API)
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const schema = z.object({
        to: z.string().optional(),
        body: z.string().optional(),
        contentSid: z.string().optional(),
        contentVariables: z.record(z.union([z.string(), z.number()])).optional(),
      }).refine((v) => Boolean(v.body) || Boolean(v.contentSid), {
        message: "Either body or contentSid must be provided",
        path: ["body"],
      });

      const payload = schema.parse(req.body);
      const result = await sendWhatsAppMessage({
        to: payload.to,
        body: payload.body,
        contentSid: payload.contentSid,
        contentVariables: payload.contentVariables as any,
      });

      if (result.ok) {
        return res.json({ ok: true });
      }
      return res.status(result.status || 502).json({ ok: false, status: result.status, statusText: result.statusText, response: result.responseText });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to send WhatsApp" });
    }
  });

  // Critical Spares Routes
  
  // Get all critical spares
  app.get("/api/spares", async (_req, res) => {
    try {
      const spares = await storage.getCriticalSpares();
      res.json(spares);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch critical spares" });
    }
  });

  // Get single critical spare
  app.get("/api/spares/:id", async (req, res) => {
    try {
      const spare = await storage.getCriticalSpare(req.params.id);
      if (!spare) {
        return res.status(404).json({ message: "Critical spare not found" });
      }
      res.json(spare);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch critical spare" });
    }
  });

  // Update critical spare
  app.patch("/api/spares/:id", async (req, res) => {
    try {
      const validatedData = updateSpareSchema.parse(req.body);
      const spare = await storage.updateCriticalSpare(req.params.id, validatedData);
      if (!spare) {
        return res.status(404).json({ message: "Critical spare not found" });
      }
      res.json(spare);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update critical spare" });
    }
  });

  // Simulate spare wear
  app.post("/api/spares/simulate", async (_req, res) => {
    try {
      const updatedSpares = await storage.simulateSpareWear();
      
      // Send WhatsApp alerts for critical spares
      for (const spare of updatedSpares) {
        const remainingLife = Math.max(0, 100 - (spare.wearPercentage || 0));
        const isLowStock = (spare.quantityInHand || 0) < (spare.reorderLevel || 2);
        
        if ((remainingLife < 20 || isLowStock)) {
          let message = '';
          if (remainingLife < 20) {
            message = `🚨 CRITICAL: ${spare.itemDescription} (${spare.itemCode}) has ${remainingLife.toFixed(1)}% life remaining`;
          } else {
            message = `📦 LOW STOCK: ${spare.itemDescription} has ${spare.quantityInHand} units left`;
          }
          
          const alertSent = await sendWhatsAppAlert(
            spare.itemCode, 
            spare.itemDescription, 
            remainingLife,
            spare.replacementCostInr
          );
        }
      }
      
      res.json(updatedSpares);
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate spare wear" });
    }
  });

  // Load spares from CSV
  app.post("/api/spares/load-csv", async (_req, res) => {
    try {
      const spares = await storage.loadSparesFromCSV();
      res.json({ message: `Loaded ${spares.length} critical spares from CSV`, spares });
    } catch (error) {
      res.status(500).json({ message: "Failed to load spares from CSV" });
    }
  });

  // Maintenance Logs Routes

  // Get maintenance logs
  app.get("/api/maintenance-logs", async (req, res) => {
    try {
      const spareId = req.query.spareId as string | undefined;
      const logs = await storage.getMaintenanceLogs(spareId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance logs" });
    }
  });

  // Create maintenance log
  app.post("/api/maintenance-logs", async (req, res) => {
    try {
      const validatedData = insertMaintenanceLogSchema.parse(req.body);
      const log = await storage.createMaintenanceLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create maintenance log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
