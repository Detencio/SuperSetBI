import multer from 'multer';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Readable } from 'stream';
import { z } from 'zod';
import {
  insertProductSchema,
  insertEnhancedSaleSchema,
  insertSaleItemSchema,
  insertAccountReceivableSchema,
  insertCustomerSchema,
  insertPaymentSchema,
  bulkProductsSchema,
  bulkSalesSchema,
  bulkCollectionsSchema,
  type InsertProduct,
  type InsertEnhancedSale,
  type InsertSaleItem,
  type InsertAccountReceivable,
  type InsertCustomer,
  type InsertPayment,
} from '@shared/schema';

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
    }
  },
});

export interface ValidationResult {
  isValid: boolean;
  validRecords: any[];
  invalidRecords: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface ImportResult {
  success: boolean;
  importId?: string;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

// Data validation functions
export function validateProducts(records: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    validRecords: [],
    invalidRecords: [],
    summary: { total: records.length, valid: 0, invalid: 0 }
  };

  records.forEach((record, index) => {
    try {
      // Transform CSV fields to schema fields
      const transformedRecord = {
        sku: record.sku || record.SKU,
        name: record.name || record.producto || record.product_name,
        categoryId: record.categoryId || record.category_id || record.categoria,
        supplierId: record.supplierId || record.supplier_id || record.proveedor,
        warehouseId: record.warehouseId || record.warehouse_id || record.almacen,
        price: parseFloat(record.price || record.precio_venta || record.selling_price || 0),
        costPrice: parseFloat(record.costPrice || record.cost_price || record.precio_costo || 0),
        stock: parseInt(record.stock || record.cantidad || record.current_stock || 0),
        minStock: parseInt(record.minStock || record.min_stock || record.stock_minimo || 10),
        maxStock: parseInt(record.maxStock || record.max_stock || record.stock_maximo || 1000),
        reorderPoint: parseInt(record.reorderPoint || record.reorder_point || record.punto_reorden || 15),
        location: record.location || record.ubicacion || '',
        unitMeasure: record.unitMeasure || record.unit_measure || record.unidad || 'unidad',
        description: record.description || record.descripcion || '',
        isActive: record.isActive !== 'false' && record.is_active !== 'false'
      };

      const validatedRecord = insertProductSchema.parse(transformedRecord);
      result.validRecords.push(validatedRecord);
      result.summary.valid++;
    } catch (error) {
      result.isValid = false;
      result.invalidRecords.push({
        row: index + 1,
        data: record,
        errors: error instanceof z.ZodError ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`) : [String(error)]
      });
      result.summary.invalid++;
    }
  });

  return result;
}

export function validateSales(records: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    validRecords: [],
    invalidRecords: [],
    summary: { total: records.length, valid: 0, invalid: 0 }
  };

  records.forEach((record, index) => {
    try {
      const transformedRecord = {
        invoiceNumber: record.invoiceNumber || record.invoice_number || record.numero_factura,
        customerId: record.customerId || record.customer_id || record.cliente_id,
        salespersonId: record.salespersonId || record.salesperson_id || record.vendedor_id,
        saleDate: record.saleDate || record.sale_date || record.fecha_venta || new Date().toISOString(),
        dueDate: record.dueDate || record.due_date || record.fecha_vencimiento,
        subtotal: parseFloat(record.subtotal || record.sub_total || 0),
        taxAmount: parseFloat(record.taxAmount || record.tax_amount || record.impuestos || 0),
        discountAmount: parseFloat(record.discountAmount || record.discount_amount || record.descuento || 0),
        totalAmount: parseFloat(record.totalAmount || record.total_amount || record.total || 0),
        paymentStatus: record.paymentStatus || record.payment_status || record.estado_pago || 'pending',
        paymentMethod: record.paymentMethod || record.payment_method || record.metodo_pago,
        channel: record.channel || record.canal || 'store',
        currency: record.currency || record.moneda || 'USD',
        notes: record.notes || record.notas || ''
      };

      const validatedRecord = insertEnhancedSaleSchema.parse(transformedRecord);
      result.validRecords.push(validatedRecord);
      result.summary.valid++;
    } catch (error) {
      result.isValid = false;
      result.invalidRecords.push({
        row: index + 1,
        data: record,
        errors: error instanceof z.ZodError ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`) : [String(error)]
      });
      result.summary.invalid++;
    }
  });

  return result;
}

export function validateReceivables(records: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    validRecords: [],
    invalidRecords: [],
    summary: { total: records.length, valid: 0, invalid: 0 }
  };

  records.forEach((record, index) => {
    try {
      const transformedRecord = {
        customerId: record.customerId || record.customer_id || record.cliente_id,
        invoiceId: record.invoiceId || record.invoice_id || record.factura_id,
        invoiceDate: record.invoiceDate || record.invoice_date || record.fecha_factura,
        dueDate: record.dueDate || record.due_date || record.fecha_vencimiento,
        originalAmount: parseFloat(record.originalAmount || record.original_amount || record.monto_original || 0),
        outstandingAmount: parseFloat(record.outstandingAmount || record.outstanding_amount || record.monto_pendiente || 0),
        currency: record.currency || record.moneda || 'USD',
        agingDays: parseInt(record.agingDays || record.aging_days || record.dias_vencimiento || 0),
        status: record.status || record.estado || 'current',
        priority: record.priority || record.prioridad || 'low',
        collectionAgent: record.collectionAgent || record.collection_agent || record.agente_cobro,
        lastContactDate: record.lastContactDate || record.last_contact_date || record.ultimo_contacto,
        nextContactDate: record.nextContactDate || record.next_contact_date || record.proximo_contacto
      };

      const validatedRecord = insertAccountReceivableSchema.parse(transformedRecord);
      result.validRecords.push(validatedRecord);
      result.summary.valid++;
    } catch (error) {
      result.isValid = false;
      result.invalidRecords.push({
        row: index + 1,
        data: record,
        errors: error instanceof z.ZodError ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`) : [String(error)]
      });
      result.summary.invalid++;
    }
  });

  return result;
}

// File parsing functions
export function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

export function parseExcel(buffer: Buffer, sheetName?: string): any[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error}`);
  }
}

export function parseJSON(buffer: Buffer): any {
  try {
    return JSON.parse(buffer.toString());
  } catch (error) {
    throw new Error(`Error parsing JSON file: ${error}`);
  }
}

// Template generation functions
export function generateProductTemplate(format: 'csv' | 'excel'): string | Buffer {
  const headers = [
    'sku', 'name', 'description', 'category', 'supplier', 
    'cost_price', 'selling_price', 'current_stock', 'minimum_stock', 
    'maximum_stock', 'reorder_point', 'lead_time_days', 'location', 
    'unit_of_measure', 'status'
  ];
  
  const sampleData = [
    ['PROD001', 'Producto Ejemplo', 'Descripción del producto', 'Categoría A', 'Proveedor XYZ', 
     '10.50', '15.75', '100', '20', '500', '30', '7', 'A1-B2', 'unidad', 'active']
  ];

  if (format === 'csv') {
    return [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
  } else {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export function generateSalesTemplate(format: 'csv' | 'excel'): string | Buffer {
  const headers = [
    'invoice_number', 'customer_id', 'customer_name', 'sale_date', 
    'due_date', 'subtotal', 'tax_amount', 'discount_amount', 
    'total_amount', 'payment_status', 'payment_method', 'channel', 'currency'
  ];
  
  const sampleData = [
    ['INV-001', 'CUST001', 'Cliente Ejemplo', '2024-01-15', '2024-02-15', 
     '100.00', '19.00', '0.00', '119.00', 'pending', 'credit', 'store', 'USD']
  ];

  if (format === 'csv') {
    return [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
  } else {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export function generateReceivablesTemplate(format: 'csv' | 'excel'): string | Buffer {
  const headers = [
    'customer_id', 'customer_name', 'invoice_id', 'invoice_date', 
    'due_date', 'original_amount', 'outstanding_amount', 'currency', 
    'status', 'priority', 'collection_agent', 'last_contact_date'
  ];
  
  const sampleData = [
    ['CUST001', 'Cliente Ejemplo', 'INV-001', '2024-01-15', '2024-02-15', 
     '1000.00', '750.00', 'USD', 'overdue_30', 'high', 'Agent Smith', '2024-01-20']
  ];

  if (format === 'csv') {
    return [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
  } else {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Receivables');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

// Data transformation utilities
export function calculateAgingDays(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function determineCollectionStatus(agingDays: number): string {
  if (agingDays <= 0) return 'current';
  if (agingDays <= 30) return 'overdue_30';
  if (agingDays <= 60) return 'overdue_60';
  if (agingDays <= 90) return 'overdue_90';
  return 'overdue_120+';
}

export function calculatePriority(amount: number, agingDays: number): string {
  if (agingDays > 90 && amount > 5000) return 'critical';
  if (agingDays > 60 && amount > 2000) return 'high';
  if (agingDays > 30 || amount > 1000) return 'medium';
  return 'low';
}

// Batch processing utility
export function processBatches<T>(items: T[], batchSize: number = 100): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

export { multer };