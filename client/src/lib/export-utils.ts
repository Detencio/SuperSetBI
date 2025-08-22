import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

// Types for export configuration
export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'currency' | 'number' | 'date' | 'percentage' | 'text';
}

export interface ExportConfig {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: any[];
  summary?: { label: string; value: string | number }[];
}

// Format value based on column format
const formatValue = (value: any, format?: string): string => {
  if (value == null) return '';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(Number(value));
      
    case 'number':
      return new Intl.NumberFormat('es-MX').format(Number(value));
      
    case 'percentage':
      return new Intl.NumberFormat('es-MX', {
        style: 'percent',
        minimumFractionDigits: 2,
      }).format(Number(value) / 100);
      
    case 'date':
      return new Date(value).toLocaleDateString('es-MX');
      
    default:
      return String(value);
  }
};

// PDF Export Functions
export const exportToPDF = (config: ExportConfig) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  
  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(config.title, pageWidth / 2, 20, { align: 'center' });
  
  // Add subtitle if provided
  let yPosition = 30;
  if (config.subtitle) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(config.subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }
  
  // Add generation date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Prepare table data
  const headers = config.columns.map(col => col.header);
  const rows = config.data.map(item => 
    config.columns.map(col => formatValue(item[col.key], col.format))
  );
  
  // Add table
  autoTable(pdf, {
    head: [headers],
    body: rows,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
    columnStyles: config.columns.reduce((styles, col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
      if (col.format === 'currency' || col.format === 'number') {
        styles[index] = { ...styles[index], halign: 'right' };
      }
      return styles;
    }, {} as any),
  });
  
  // Add summary if provided
  if (config.summary && config.summary.length > 0) {
    const finalY = (pdf as any).lastAutoTable.finalY || yPosition + 50;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumen:', 20, finalY + 20);
    
    let summaryY = finalY + 30;
    config.summary.forEach(item => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${item.label}:`, 20, summaryY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(item.value), pageWidth - 20, summaryY, { align: 'right' });
      summaryY += 8;
    });
  }
  
  // Add footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Página ${i} de ${totalPages} - Superset BI`,
      pageWidth / 2,
      pdf.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  pdf.save(`${config.filename}.pdf`);
};

// Excel Export Functions
export const exportToExcel = (config: ExportConfig) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Prepare data with headers
  const headers = config.columns.map(col => col.header);
  const data = config.data.map(item => 
    config.columns.map(col => {
      const value = item[col.key];
      // Keep raw values for Excel to maintain data types
      return col.format === 'date' && value ? new Date(value) : value;
    })
  );
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Set column widths
  const colWidths = config.columns.map(col => ({
    wch: col.width ? col.width / 4 : 15 // Convert mm to character width approximation
  }));
  ws['!cols'] = colWidths;
  
  // Style headers
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '3B82F6' } }, // Blue background
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };
  }
  
  // Format data cells
  for (let row = 1; row <= data.length; row++) {
    for (let col = 0; col < config.columns.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) continue;
      
      const column = config.columns[col];
      let cellStyle: any = {
        border: {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } },
        },
      };
      
      // Apply specific formatting based on column type
      switch (column.format) {
        case 'currency':
          ws[cellAddress].t = 'n'; // Number type
          ws[cellAddress].z = '"$"#,##0.00'; // Currency format
          cellStyle.alignment = { horizontal: 'right' };
          break;
          
        case 'number':
          ws[cellAddress].t = 'n';
          ws[cellAddress].z = '#,##0.00';
          cellStyle.alignment = { horizontal: 'right' };
          break;
          
        case 'percentage':
          ws[cellAddress].t = 'n';
          ws[cellAddress].z = '0.00%';
          cellStyle.alignment = { horizontal: 'right' };
          break;
          
        case 'date':
          ws[cellAddress].t = 'd';
          ws[cellAddress].z = 'dd/mm/yyyy';
          cellStyle.alignment = { horizontal: 'center' };
          break;
          
        default:
          cellStyle.alignment = { horizontal: 'left' };
      }
      
      // Apply alternating row colors
      if (row % 2 === 0) {
        cellStyle.fill = { fgColor: { rgb: 'F8FAFC' } };
      }
      
      ws[cellAddress].s = cellStyle;
    }
  }
  
  // Add summary sheet if provided
  if (config.summary && config.summary.length > 0) {
    const summaryData = [
      ['Resumen', ''],
      ...config.summary.map(item => [item.label, item.value]),
      ['', ''],
      ['Generado el:', new Date().toLocaleDateString('es-MX')],
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style summary sheet
    summaryWs['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center' },
    };
    
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
  }
  
  // Add main sheet
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  
  // Generate Excel file and save
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${config.filename}.xlsx`);
};

// Multi-sheet Excel export
export const exportToExcelMultiSheet = (configs: ExportConfig[]) => {
  const wb = XLSX.utils.book_new();
  
  configs.forEach(config => {
    const headers = config.columns.map(col => col.header);
    const data = config.data.map(item => 
      config.columns.map(col => {
        const value = item[col.key];
        return col.format === 'date' && value ? new Date(value) : value;
      })
    );
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Apply styling similar to single sheet export
    const colWidths = config.columns.map(col => ({
      wch: col.width ? col.width / 4 : 15
    }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, config.title.substring(0, 31)); // Excel sheet name limit
  });
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `superset-export-${Date.now()}.xlsx`);
};

// Preset export configurations for different data types
export const getInventoryExportConfig = (products: any[]): ExportConfig => ({
  title: 'Reporte de Inventario',
  subtitle: 'Control de stock y análisis de productos',
  filename: `inventario-${new Date().toISOString().split('T')[0]}`,
  columns: [
    { key: 'name', header: 'Producto', width: 40 },
    { key: 'sku', header: 'SKU', width: 20 },
    { key: 'category', header: 'Categoría', width: 25 },
    { key: 'currentStock', header: 'Stock Actual', width: 20, format: 'number' },
    { key: 'minStock', header: 'Stock Mínimo', width: 20, format: 'number' },
    { key: 'maxStock', header: 'Stock Máximo', width: 20, format: 'number' },
    { key: 'unitCost', header: 'Costo Unitario', width: 25, format: 'currency' },
    { key: 'salePrice', header: 'Precio Venta', width: 25, format: 'currency' },
    { key: 'stockValue', header: 'Valor Stock', width: 25, format: 'currency' },
    { key: 'status', header: 'Estado', width: 20 },
  ],
  data: products.map(product => ({
    ...product,
    stockValue: product.currentStock * product.unitCost,
    status: product.currentStock <= product.minStock ? 'Bajo Stock' :
            product.currentStock >= product.maxStock ? 'Exceso Stock' : 'Normal'
  })),
  summary: [
    { label: 'Total Productos', value: products.length },
    { label: 'Valor Total Inventario', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0)) },
    { label: 'Productos Bajo Stock', value: products.filter(p => p.currentStock <= p.minStock).length },
  ],
});

export const getSalesExportConfig = (sales: any[]): ExportConfig => ({
  title: 'Reporte de Ventas',
  subtitle: 'Análisis de transacciones y rendimiento',
  filename: `ventas-${new Date().toISOString().split('T')[0]}`,
  columns: [
    { key: 'date', header: 'Fecha', width: 25, format: 'date' },
    { key: 'productName', header: 'Producto', width: 40 },
    { key: 'quantity', header: 'Cantidad', width: 20, format: 'number' },
    { key: 'unitPrice', header: 'Precio Unit.', width: 25, format: 'currency' },
    { key: 'total', header: 'Total', width: 25, format: 'currency' },
    { key: 'customer', header: 'Cliente', width: 30 },
    { key: 'salesperson', header: 'Vendedor', width: 25 },
  ],
  data: sales,
  summary: [
    { label: 'Total Ventas', value: sales.length },
    { label: 'Ingresos Totales', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sales.reduce((sum, s) => sum + s.total, 0)) },
    { label: 'Venta Promedio', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sales.reduce((sum, s) => sum + s.total, 0) / sales.length) },
  ],
});

export const getCollectionsExportConfig = (collections: any[]): ExportConfig => ({
  title: 'Reporte de Cobranza',
  subtitle: 'Estado de cuentas por cobrar y pagos',
  filename: `cobranza-${new Date().toISOString().split('T')[0]}`,
  columns: [
    { key: 'invoiceNumber', header: 'Factura', width: 20 },
    { key: 'customerName', header: 'Cliente', width: 35 },
    { key: 'issueDate', header: 'Fecha Emisión', width: 25, format: 'date' },
    { key: 'dueDate', header: 'Fecha Vencimiento', width: 25, format: 'date' },
    { key: 'amount', header: 'Monto', width: 25, format: 'currency' },
    { key: 'paidAmount', header: 'Pagado', width: 25, format: 'currency' },
    { key: 'remainingAmount', header: 'Pendiente', width: 25, format: 'currency' },
    { key: 'status', header: 'Estado', width: 20 },
    { key: 'overdueDays', header: 'Días Vencido', width: 20, format: 'number' },
  ],
  data: collections,
  summary: [
    { label: 'Total Facturas', value: collections.length },
    { label: 'Monto Total', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(collections.reduce((sum, c) => sum + c.amount, 0)) },
    { label: 'Total Cobrado', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(collections.reduce((sum, c) => sum + c.paidAmount, 0)) },
    { label: 'Pendiente de Cobro', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(collections.reduce((sum, c) => sum + c.remainingAmount, 0)) },
  ],
});