import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import type { CriticalSpare, InsertSpare } from '@shared/schema';

interface CSVRow {
  'S.No': string;
  'Item Code': string;
  'Item Description': string;
  'Unit': string;
  'Min Stock': string;
  'Reorder Level': string;
  'Existing Stock': string;
  'Status': string;
  'Remarks': string;
}

export async function loadCriticalSparesFromCSV(): Promise<InsertSpare[]> {
  const csvPath = path.join(process.cwd(), 'server', 'data', 'critical_spares_dataset.csv');
  const spares: InsertSpare[] = [];

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found, skipping critical spares import');
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        try {
          const spare: InsertSpare = {
            itemCode: row['Item Code'],
            itemDescription: row['Item Description'],
            unit: row['Unit'],
            minStock: parseInt(row['Min Stock']) || 1,
            reorderLevel: parseInt(row['Reorder Level']) || 2,
            quantityInHand: parseInt(row['Existing Stock']) || 0,
            machineType: row['Status'] || 'CNC',
            operatingHours: Math.floor(Math.random() * 5000), // Simulate operating hours
            loadFactor: 0.8 + (Math.random() * 0.4), // Random load factor between 0.8-1.2
            wearPercentage: Math.random() * 100, // Random wear 0-100%
            expectedLifeHours: getExpectedLifeHours(row['Item Description']),
            replacementCostInr: getReplacementCost(row['Item Description']),
          };

          // Calculate predicted replacement date based on wear
          if (spare.wearPercentage && spare.expectedLifeHours && spare.operatingHours) {
            const remainingHours = spare.expectedLifeHours * (1 - spare.wearPercentage / 100);
            const hoursPerDay = 8; // Assume 8 hours operation per day
            const daysToReplacement = Math.max(1, remainingHours / hoursPerDay);
            spare.predictedReplacementDate = new Date(Date.now() + daysToReplacement * 24 * 60 * 60 * 1000);
          }

          spares.push(spare);
        } catch (error) {
          console.error('Error parsing CSV row:', error);
        }
      })
      .on('end', () => {
        console.log(`Loaded ${spares.length} critical spares from CSV`);
        resolve(spares);
      })
      .on('error', reject);
  });
}

function getExpectedLifeHours(description: string): number {
  const desc = description.toLowerCase();
  
  if (desc.includes('bearing')) return 8760; // 1 year for bearings
  if (desc.includes('gear')) return 17520; // 2 years for gears
  if (desc.includes('belt') || desc.includes('coupling')) return 4380; // 6 months for belts
  if (desc.includes('sensor') || desc.includes('switch')) return 26280; // 3 years for electronics
  if (desc.includes('seal') || desc.includes('wiper')) return 2190; // 3 months for seals
  if (desc.includes('motor') || desc.includes('pump')) return 35040; // 4 years for motors
  
  return 8760; // Default 1 year
}

function getReplacementCost(description: string): number {
  const desc = description.toLowerCase();
  
  if (desc.includes('bearing')) return 5000 + Math.random() * 10000; // ₹5k-15k
  if (desc.includes('gear')) return 15000 + Math.random() * 25000; // ₹15k-40k
  if (desc.includes('motor') || desc.includes('pump')) return 25000 + Math.random() * 50000; // ₹25k-75k
  if (desc.includes('sensor') || desc.includes('switch')) return 3000 + Math.random() * 7000; // ₹3k-10k
  if (desc.includes('seal') || desc.includes('belt')) return 1000 + Math.random() * 4000; // ₹1k-5k
  
  return 5000 + Math.random() * 10000; // Default ₹5k-15k
}