import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const machines = pgTable("machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  componentType: text("component_type").notNull(),
  initialLife: real("initial_life").notNull(),
  remainingLife: real("remaining_life").notNull(),
  operatingHours: integer("operating_hours").notNull(),
  loadFactor: real("load_factor").notNull(),
  replacementCost: real("replacement_cost").notNull(), // Cost in INR
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").references(() => machines.id),
  spareId: varchar("spare_id"),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'critical', 'warning', 'info'
  alertType: text("alert_type").notNull(), // 'wear', 'stock', 'maintenance'
  sentViaWhatsapp: integer("sent_via_whatsapp").default(0), // 0 = false, 1 = true
  createdAt: timestamp("created_at").defaultNow(),
});

export const criticalSpares = pgTable("critical_spares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemCode: text("item_code").notNull().unique(),
  itemDescription: text("item_description").notNull(),
  unit: text("unit").notNull(),
  minStock: integer("min_stock").notNull(),
  reorderLevel: integer("reorder_level").notNull(),
  quantityInHand: integer("quantity_in_hand").notNull(),
  machineType: text("machine_type").notNull(),
  
  // Predictive maintenance fields
  operatingHours: integer("operating_hours").default(0),
  loadFactor: real("load_factor").default(1.0),
  wearPercentage: real("wear_percentage").default(0),
  expectedLifeHours: integer("expected_life_hours").default(8760), // 1 year default
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  predictedReplacementDate: timestamp("predicted_replacement_date"),
  replacementCostInr: real("replacement_cost_inr").default(10000),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spareId: varchar("spare_id").references(() => criticalSpares.id),
  maintenanceType: text("maintenance_type").notNull(), // 'replacement', 'repair', 'inspection'
  quantityUsed: integer("quantity_used").default(1),
  cost: real("cost"),
  notes: text("notes"),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
  remainingLife: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  componentType: z.enum(["Ball Screw", "LM Guideway", "Tool Magazine", "Spindle Motor"]),
  initialLife: z.number().min(1).max(100),
  operatingHours: z.number().min(0),
  loadFactor: z.number().min(0).max(1),
  replacementCost: z.number().min(0),
});

export const updateMachineSchema = createInsertSchema(machines).omit({
  id: true,
  initialLife: true,
  remainingLife: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  componentType: z.enum(["Ball Screw", "LM Guideway", "Tool Magazine", "Spindle Motor"]),
  operatingHours: z.number().min(0),
  loadFactor: z.number().min(0).max(1),
  replacementCost: z.number().min(0),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertSpareSchema = createInsertSchema(criticalSpares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSpareSchema = createInsertSchema(criticalSpares).omit({
  id: true,
  itemCode: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertMaintenanceLogSchema = createInsertSchema(maintenanceLogs).omit({
  id: true,
  createdAt: true,
});

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type UpdateMachine = z.infer<typeof updateMachineSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type CriticalSpare = typeof criticalSpares.$inferSelect;
export type InsertSpare = z.infer<typeof insertSpareSchema>;
export type UpdateSpare = z.infer<typeof updateSpareSchema>;
export type MaintenanceLog = typeof maintenanceLogs.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
