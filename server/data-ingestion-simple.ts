import type { Express } from "express";
import { z } from "zod";
import multer from 'multer';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import {
  insertProductSchema,
  insertEnhancedSaleSchema,
  insertAccountReceivableSchema,
  type InsertProduct,
  type InsertEnhancedSale,
  type InsertAccountReceivable,
} from "@shared/schema";
import { storage } from "./storage";

// Configure multer for file uploads
const upload = multer({
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

// Simple CSV parser
function parseCSV(buffer: Buffer): Promise<any[]> {
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

// Simple Excel parser
function parseExcel(buffer: Buffer): any[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error}`);
  }
}

// Function to parse Chilean numbers (1.000,22)
function parseChileanNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  let cleanString = String(value).trim();
  
  // If contains dot and comma, Chilean format (1.000,22)
  if (cleanString.includes('.') && cleanString.includes(',')) {
    // Remove dots (thousands separator) and replace comma with decimal point
    cleanString = cleanString.replace(/\./g, '').replace(',', '.');
  }
  // If only contains comma, could be Chilean decimal (22,50)
  else if (cleanString.includes(',') && !cleanString.includes('.')) {
    // If more than 3 digits after comma, it's thousands separator
    const parts = cleanString.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // It's decimal: replace comma with point
      cleanString = cleanString.replace(',', '.');
    } else {
      // It's thousands separator: remove commas
      cleanString = cleanString.replace(/,/g, '');
    }
  }
  // If contains only dot and more than 2 decimals, it's thousands separator
  else if (cleanString.includes('.')) {
    const parts = cleanString.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
      // It's thousands separator: remove dots
      cleanString = cleanString.replace(/\./g, '');
    }
  }
  
  return parseFloat(cleanString) || 0;
}

// Product validation
function validateProduct(record: any): InsertProduct | null {
  try {
    const transformed = {
      sku: record.sku || record.SKU || `PROD-${Date.now()}`,
      name: record.name || record.nombre || record.producto || record.product_name || 'Producto sin nombre',
      categoryId: record.categoryId || record.category_id || record.categoria || null,
      supplierId: record.supplierId || record.supplier_id || record.proveedor || null,
      warehouseId: record.warehouseId || record.warehouse_id || record.almacen || null,
      price: parseChileanNumber(record.price || record.precio_venta || record.selling_price || 0) + '',
      costPrice: parseChileanNumber(record.costPrice || record.cost_price || record.precio_costo || 0) + '',
      stock: parseInt(record.stock || record.stock_actual || record.cantidad || record.current_stock || 0),
      minStock: parseInt(record.minStock || record.min_stock || record.stock_minimo || 10),
      maxStock: parseInt(record.maxStock || record.max_stock || record.stock_maximo || 1000),
      reorderPoint: parseInt(record.reorderPoint || record.reorder_point || record.punto_reorden || 15),
      location: record.location || record.ubicacion || '',
      unitMeasure: record.unitMeasure || record.unit_measure || record.unidad_medida || record.unidad || 'unidad',
      description: record.description || record.descripcion || '',
      isActive: record.isActive !== 'false' && record.is_active !== 'false' && record.estado !== 'inactive'
    };

    return insertProductSchema.parse(transformed);
  } catch (error) {
    console.error('Product validation error:', error, 'Record:', record);
    return null;
  }
}

export function registerDataIngestionRoutes(app: Express) {
  // Simple product import endpoint
  // Import products endpoint (frontend expects /api/import/products)
  app.post("/api/import/products", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      let records: any[] = [];
      
      // Parse file based on type
      if (req.file.mimetype === 'text/csv') {
        records = await parseCSV(req.file.buffer);
      } else if (req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet')) {
        records = parseExcel(req.file.buffer);
      } else if (req.file.mimetype === 'application/json') {
        const jsonData = JSON.parse(req.file.buffer.toString());
        records = Array.isArray(jsonData) ? jsonData : jsonData.records || [];
      }

      const results = {
        total: records.length,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const validProduct = validateProduct(records[i]);
        if (validProduct) {
          try {
            // Set company ID for the product
            const productWithCompany = { ...validProduct, companyId: 'demo-company-123' };
            await storage.createProduct(productWithCompany);
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: ${error}`);
          }
        } else {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Invalid product data`);
        }
      }

      res.json({
        success: true,
        imported: results.successful,
        message: `Se importaron ${results.successful} registros de products.`,
        results
      });

    } catch (error) {
      console.error("Product import error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "Import failed" 
      });
    }
  });

  app.post("/api/data-ingestion/products", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let records: any[] = [];
      
      // Parse file based on type
      if (req.file.mimetype === 'text/csv') {
        records = await parseCSV(req.file.buffer);
      } else if (req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet')) {
        records = parseExcel(req.file.buffer);
      } else if (req.file.mimetype === 'application/json') {
        const jsonData = JSON.parse(req.file.buffer.toString());
        records = Array.isArray(jsonData) ? jsonData : jsonData.records || [];
      }

      const results = {
        total: records.length,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const validProduct = validateProduct(records[i]);
        if (validProduct) {
          try {
            await storage.createProduct(validProduct);
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: ${error}`);
          }
        } else {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Invalid product data`);
        }
      }

      res.json({
        success: true,
        message: `Processed ${results.total} records. ${results.successful} successful, ${results.failed} failed.`,
        results
      });

    } catch (error) {
      console.error("Product import error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : "Import failed" 
      });
    }
  });

  // Template download endpoints
  app.get("/api/data-ingestion/templates/products", (req, res) => {
    const format = req.query.format as 'csv' | 'excel' || 'csv';
    
    if (format === 'csv') {
      const csvContent = [
        'sku,name,description,category,supplier,cost_price,selling_price,current_stock,minimum_stock,maximum_stock,reorder_point,location,unit_of_measure',
        'PROD001,Producto Ejemplo,Descripción del producto,Categoría A,Proveedor XYZ,10.50,15.75,100,20,500,30,A1-B2,unidad'
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products_template.csv"');
      res.send(csvContent);
    } else {
      // Generate Excel template
      const headers = ['sku', 'name', 'description', 'category', 'supplier', 'cost_price', 'selling_price', 'current_stock', 'minimum_stock', 'maximum_stock', 'reorder_point', 'location', 'unit_of_measure'];
      const sampleData = ['PROD001', 'Producto Ejemplo', 'Descripción del producto', 'Categoría A', 'Proveedor XYZ', '10.50', '15.75', '100', '20', '500', '30', 'A1-B2', 'unidad'];
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="products_template.xlsx"');
      res.send(buffer);
    }
  });

  // Simple validation endpoint
  app.post("/api/data-ingestion/validate", upload.single('file'), async (req, res) => {
    try {
      const { dataType } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let records: any[] = [];
      
      // Parse file based on type
      if (req.file.mimetype === 'text/csv') {
        records = await parseCSV(req.file.buffer);
      } else if (req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet')) {
        records = parseExcel(req.file.buffer);
      } else if (req.file.mimetype === 'application/json') {
        const jsonData = JSON.parse(req.file.buffer.toString());
        records = Array.isArray(jsonData) ? jsonData : jsonData.records || [];
      }

      const validation = {
        total: records.length,
        valid: 0,
        invalid: 0,
        errors: [] as string[]
      };

      // Simple validation for products
      if (dataType === 'inventory' || dataType === 'products') {
        records.forEach((record, index) => {
          const validProduct = validateProduct(record);
          if (validProduct) {
            validation.valid++;
          } else {
            validation.invalid++;
            validation.errors.push(`Row ${index + 1}: Invalid product data`);
          }
        });
      }

      res.json({
        validation,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        recordCount: records.length
      });

    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Validation failed" });
    }
  });
}