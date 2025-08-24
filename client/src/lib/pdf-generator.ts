import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from './currency-utils';

interface CustomPDFConfig {
  title: string;
  subtitle: string;
  includeDate: boolean;
  includeCompanyLogo: boolean;
  colorTheme: string;
  layout: string;
  sections: any;
  charts: any;
  filters: any;
}

interface ReportData {
  products: any[];
  kpis: any;
  alerts: any[];
}

const getThemeColors = (theme: string) => {
  const themes = {
    professional: {
      primary: [59, 130, 246] as [number, number, number],
      secondary: [219, 234, 254] as [number, number, number],
      accent: [30, 64, 175] as [number, number, number],
      text: [30, 30, 50] as [number, number, number]
    },
    elegant: {
      primary: [107, 114, 128] as [number, number, number],
      secondary: [243, 244, 246] as [number, number, number],
      accent: [55, 65, 81] as [number, number, number],
      text: [17, 24, 39] as [number, number, number]
    },
    modern: {
      primary: [139, 92, 246] as [number, number, number],
      secondary: [233, 213, 255] as [number, number, number],
      accent: [124, 58, 237] as [number, number, number],
      text: [30, 30, 50] as [number, number, number]
    },
    corporate: {
      primary: [5, 150, 105] as [number, number, number],
      secondary: [220, 252, 231] as [number, number, number],
      accent: [4, 120, 87] as [number, number, number],
      text: [6, 78, 59] as [number, number, number]
    }
  };
  
  return themes[theme as keyof typeof themes] || themes.professional;
};

export const generateCustomPDF = async (config: CustomPDFConfig, data: ReportData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const colors = getThemeColors(config.colorTheme);
  
  let yPosition = 20;

  // Header personalizado según configuración
  if (config.includeCompanyLogo || config.includeDate) {
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
  }

  // Título personalizado
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, 20, 25);

  // Subtítulo
  if (config.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(config.subtitle, 20, 32);
  }

  // Fecha (si está habilitada)
  if (config.includeDate) {
    doc.setFontSize(10);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, pageWidth - 20, 25, { align: 'right' });
  }

  yPosition = 50;

  // Resumen Ejecutivo (si está habilitado)
  if (config.sections.executiveSummary) {
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition + 5.5);
    
    yPosition += 15;
    
    // KPIs principales
    const totalProducts = data.products.length;
    const totalValue = data.kpis?.totalStockValue || 0;
    const lowStockCount = data.products.filter(p => p.stock <= (p.minStock || 10)).length;
    const turnoverRate = data.kpis?.inventoryTurnover || 0;

    const summaryData = [
      ['Total de Productos', totalProducts.toString()],
      ['Valor Total del Inventario', formatCurrency(totalValue, 'USD')],
      ['Productos con Stock Bajo', lowStockCount.toString()],
      ['Rotación de Inventario', `${turnoverRate.toFixed(1)}x/año`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.primary,
        textColor: [255, 255, 255]
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Alertas (si está habilitado)
  if (config.sections.alertsSection && data.alerts.length > 0) {
    doc.setFillColor(239, 68, 68);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ALERTAS CRÍTICAS', 20, yPosition + 5.5);
    
    yPosition += 15;

    const alertsData = data.alerts.slice(0, 10).map(alert => [
      alert.productName || 'N/A',
      alert.type || 'General',
      alert.message || alert.description || 'Sin descripción'
    ]);

    if (alertsData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Producto', 'Tipo', 'Descripción']],
        body: alertsData,
        theme: 'grid',
        headStyles: { 
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255]
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // Análisis detallado (si está habilitado)
  if (config.sections.detailedAnalysis) {
    // Verificar si necesitamos nueva página
    if (yPosition > pageWidth - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS DETALLADO DE PRODUCTOS', 20, yPosition + 5.5);
    
    yPosition += 15;

    // Top 15 productos por valor
    const topProducts = data.products
      .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
      .slice(0, 15)
      .map(product => [
        product.name || 'N/A',
        product.category || 'Sin categoría',
        product.stock?.toString() || '0',
        formatCurrency(product.price || 0, 'USD'),
        formatCurrency((product.price || 0) * (product.stock || 0), 'USD')
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Producto', 'Categoría', 'Stock', 'Precio', 'Valor Total']],
      body: topProducts,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.accent,
        textColor: [255, 255, 255]
      },
      styles: { 
        fontSize: 7,
        cellPadding: 2
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Recomendaciones (si está habilitado)
  if (config.sections.recommendationsSection) {
    // Verificar si necesitamos nueva página
    if (yPosition > pageWidth - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(5, 150, 105);
    doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDACIONES ESTRATÉGICAS', 20, yPosition + 5.5);
    
    yPosition += 15;

    const recommendations = [
      'Implementar reorden automático para productos de alta rotación',
      'Revisar proveedores para productos con stock crítico',
      'Optimizar niveles de stock basado en análisis de demanda',
      'Establecer alertas tempranas para productos estacionales',
      'Considerar liquidación de productos de baja rotación'
    ];

    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPosition);
      yPosition += 6;
    });
  }

  // Pie de página personalizado
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${config.title} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Generar nombre de archivo
  const fileName = `${config.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  
  // Descargar el PDF
  doc.save(fileName);
};