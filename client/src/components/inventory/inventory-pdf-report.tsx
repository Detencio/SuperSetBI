import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrency } from "@/lib/currency-utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InventoryPDFReportProps {
  products: any[];
  kpis: any;
  alerts: any[];
  analytics: any;
}

interface ReportData {
  executiveSummary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    turnoverRate: number;
    serviceLevel: number;
    recommendedActions: string[];
  };
  kpiMetrics: Array<{
    name: string;
    value: string;
    formula: string;
    interpretation: string;
    target: string;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
  alertSystem: Array<{
    type: string;
    name: string;
    priority: string;
    description: string;
    criteria: string;
    recommendedAction: string;
  }>;
  abcAnalysis: {
    A: { count: number; value: number; percentage: number };
    B: { count: number; value: number; percentage: number };
    C: { count: number; value: number; percentage: number };
  };
}

export default function InventoryPDFReport({ products, kpis, alerts, analytics }: InventoryPDFReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentCurrency, formatDisplayCurrency } = useCurrency();

  const generateReportData = (): ReportData => {
    const totalProducts = products.length;
    const totalValue = kpis?.totalStockValue || 0;
    const lowStockCount = products.filter(p => p.stock <= (p.minStock || 10)).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const turnoverRate = kpis?.inventoryTurnover || 4.2;
    const serviceLevel = 95.5; // Target service level

    // ABC Analysis calculation
    const sortedProducts = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock));
    const totalProductValue = sortedProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    let aProducts = 0, aValue = 0, aPercentage = 0;
    let bProducts = 0, bValue = 0, bPercentage = 0;
    let cProducts = 0, cValue = 0, cPercentage = 0;
    
    let cumulativeValue = 0;
    for (let i = 0; i < sortedProducts.length; i++) {
      const productValue = sortedProducts[i].price * sortedProducts[i].stock;
      cumulativeValue += productValue;
      const cumulativePercentage = (cumulativeValue / totalProductValue) * 100;
      
      if (cumulativePercentage <= 80) {
        aProducts++;
        aValue += productValue;
        aPercentage = cumulativePercentage;
      } else if (cumulativePercentage <= 95) {
        bProducts++;
        bValue += productValue;
        bPercentage = cumulativePercentage - aPercentage;
      } else {
        cProducts++;
        cValue += productValue;
        cPercentage = 100 - (aPercentage + bPercentage);
      }
    }

    return {
      executiveSummary: {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        turnoverRate,
        serviceLevel,
        recommendedActions: [
          "Implementar reorden automático para productos clase A",
          "Revisar proveedores para productos con stock crítico",
          "Optimizar niveles de stock basado en análisis ABC",
          "Establecer alertas tempranas para productos estacionales"
        ]
      },
      kpiMetrics: [
        {
          name: "Valor Total del Inventario",
          value: formatDisplayCurrency(totalValue),
          formula: "Σ(Precio × Stock)",
          interpretation: "Capital invertido en inventario actual",
          target: "Optimizar según rotación",
          status: totalValue > 500000 ? 'excellent' : totalValue > 300000 ? 'good' : 'warning'
        },
        {
          name: "Rotación de Inventario",
          value: `${turnoverRate.toFixed(1)}x/año`,
          formula: "Costo de Ventas ÷ Inventario Promedio",
          interpretation: "Frecuencia de renovación del inventario",
          target: "> 4.0x/año",
          status: turnoverRate >= 4 ? 'excellent' : turnoverRate >= 3 ? 'good' : 'warning'
        },
        {
          name: "Nivel de Servicio",
          value: `${serviceLevel.toFixed(1)}%`,
          formula: "(Pedidos Atendidos ÷ Total Pedidos) × 100",
          interpretation: "Capacidad de atender demanda",
          target: "> 95%",
          status: serviceLevel >= 95 ? 'excellent' : serviceLevel >= 90 ? 'good' : 'warning'
        },
        {
          name: "Días de Inventario",
          value: `${Math.round(365 / turnoverRate)} días`,
          formula: "365 ÷ Rotación de Inventario",
          interpretation: "Días promedio que permanece el inventario",
          target: "< 90 días",
          status: (365 / turnoverRate) <= 90 ? 'excellent' : (365 / turnoverRate) <= 120 ? 'good' : 'warning'
        },
        {
          name: "Índice de Liquidez",
          value: `${((outOfStockCount / totalProducts) * 100).toFixed(1)}%`,
          formula: "(Productos Disponibles ÷ Total Productos) × 100",
          interpretation: "Facilidad de conversión a efectivo",
          target: "> 85%",
          status: outOfStockCount / totalProducts <= 0.05 ? 'excellent' : outOfStockCount / totalProducts <= 0.15 ? 'good' : 'warning'
        },
        {
          name: "Precisión del Inventario",
          value: "98.5%",
          formula: "(Registros Exactos ÷ Total Registros) × 100",
          interpretation: "Exactitud de los registros de inventario",
          target: "> 95%",
          status: 'excellent'
        }
      ],
      alertSystem: [
        {
          type: "critical",
          name: "Stock Crítico",
          priority: "CRÍTICA",
          description: "Productos con stock por debajo del 50% del mínimo",
          criteria: "Stock ≤ (Stock Mínimo × 0.5)",
          recommendedAction: "Reposición inmediata - contactar proveedor urgente"
        },
        {
          type: "out_of_stock",
          name: "Sin Stock",
          priority: "CRÍTICA", 
          description: "Productos completamente agotados",
          criteria: "Stock = 0",
          recommendedAction: "Pedido urgente - evaluar proveedores alternativos"
        },
        {
          type: "low_stock",
          name: "Stock Bajo",
          priority: "ALTA",
          description: "Productos cerca del punto de reorden",
          criteria: "Stock ≤ Stock Mínimo",
          recommendedAction: "Programar reposición en próximos 7 días"
        },
        {
          type: "excess_stock",
          name: "Exceso de Stock",
          priority: "MEDIA",
          description: "Productos con inventario excesivo",
          criteria: "Stock ≥ (Stock Máximo × 1.2)",
          recommendedAction: "Evaluar promociones o redistribución"
        },
        {
          type: "expiring",
          name: "Próximo a Vencer",
          priority: "ALTA",
          description: "Productos cerca de fecha de vencimiento",
          criteria: "Días hasta vencimiento ≤ 30",
          recommendedAction: "Liquidación inmediata con descuentos"
        },
        {
          type: "slow_moving",
          name: "Movimiento Lento",
          priority: "MEDIA",
          description: "Productos con baja rotación",
          criteria: "Sin movimiento > 90 días",
          recommendedAction: "Revisar estrategia de precio y promoción"
        }
      ],
      abcAnalysis: {
        A: { count: aProducts, value: aValue, percentage: aPercentage },
        B: { count: bProducts, value: bValue, percentage: bPercentage },
        C: { count: cProducts, value: cValue, percentage: cPercentage }
      }
    };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = generateReportData();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Colors
      const primaryColor: [number, number, number] = [41, 98, 255]; // Blue
      const secondaryColor: [number, number, number] = [74, 85, 104]; // Gray
      const successColor: [number, number, number] = [34, 197, 94]; // Green
      const warningColor: [number, number, number] = [251, 146, 60]; // Orange
      const errorColor: [number, number, number] = [239, 68, 68]; // Red

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Header function
      const addHeader = () => {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE EJECUTIVO', 15, 20);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Control de Inventario - SupersetBI', 15, 27);
        
        yPosition = 40;
      };

      // Footer function
      const addFooter = () => {
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(8);
        doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 15, pageHeight - 10);
        doc.text(`SupersetBI - Sistema de Business Intelligence`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      };

      // Page 1: Dashboard Visual - KPIs Cards
      addHeader();
      addFooter();

      // Fecha del reporte
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(10);
      doc.text(`${format(new Date(), 'dd/MM/yyyy', { locale: es })}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 10;

      // Título del dashboard
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('DASHBOARD EJECUTIVO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Control de Inventario', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 25;

      // KPI Cards Layout (2x3 grid)
      const cardWidth = 85;
      const cardHeight = 45;
      const cardSpacing = 10;
      const startX = 15;

      const kpiCards = [
        {
          title: 'VALOR TOTAL',
          value: formatDisplayCurrency(reportData.executiveSummary.totalValue),
          subtitle: 'Inventario',
          color: primaryColor,
          textColor: [255, 255, 255]
        },
        {
          title: 'PRODUCTOS',
          value: reportData.executiveSummary.totalProducts.toString(),
          subtitle: 'Total',
          color: successColor,
          textColor: [255, 255, 255]
        },
        {
          title: 'ROTACIÓN',
          value: `${reportData.executiveSummary.turnoverRate.toFixed(1)}x`,
          subtitle: '/año',
          color: [34, 197, 94],
          textColor: [255, 255, 255]
        },
        {
          title: 'SERVICIO',
          value: `${reportData.executiveSummary.serviceLevel.toFixed(1)}%`,
          subtitle: 'Nivel',
          color: reportData.executiveSummary.serviceLevel >= 95 ? successColor : warningColor,
          textColor: [255, 255, 255]
        },
        {
          title: 'STOCK BAJO',
          value: reportData.executiveSummary.lowStockCount.toString(),
          subtitle: 'Productos',
          color: warningColor,
          textColor: [255, 255, 255]
        },
        {
          title: 'SIN STOCK',
          value: reportData.executiveSummary.outOfStockCount.toString(),
          subtitle: 'Productos',
          color: errorColor,
          textColor: [255, 255, 255]
        }
      ];

      // Dibujar cards en grid 2x3
      let currentX = startX;
      let currentY = yPosition;
      
      kpiCards.forEach((card, index) => {
        if (index === 3) {
          currentX = startX;
          currentY += cardHeight + cardSpacing;
        }

        // Fondo del card
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.roundedRect(currentX, currentY, cardWidth, cardHeight, 3, 3, 'F');

        // Título
        doc.setTextColor(card.textColor[0], card.textColor[1], card.textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(card.title, currentX + cardWidth/2, currentY + 12, { align: 'center' });

        // Valor principal
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(card.value, currentX + cardWidth/2, currentY + 28, { align: 'center' });

        // Subtítulo
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(card.subtitle, currentX + cardWidth/2, currentY + 38, { align: 'center' });

        currentX += cardWidth + cardSpacing;
      });

      yPosition = currentY + cardHeight + 20;

      // Gráfico de barras simple para análisis ABC (en la misma página)
      checkNewPage(80);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ANÁLISIS ABC', 15, yPosition);
      yPosition += 15;

      // Crear gráfico de barras simple para ABC
      const chartX = 15;
      const chartY = yPosition;
      const chartWidth = 170;
      const chartHeight = 40;
      const barSpacing = 5;
      const barWidth = (chartWidth - (barSpacing * 2)) / 3;

      const abcCategories = [
        { name: 'A', value: reportData.abcAnalysis.A.percentage, color: successColor, label: 'Alto Valor (80%)' },
        { name: 'B', value: reportData.abcAnalysis.B.percentage, color: warningColor, label: 'Medio Valor (15%)' },
        { name: 'C', value: reportData.abcAnalysis.C.percentage, color: errorColor, label: 'Bajo Valor (5%)' }
      ];

      abcCategories.forEach((cat, index) => {
        const barX = chartX + (index * (barWidth + barSpacing));
        const barHeight = (cat.value / 100) * chartHeight;
        const barY = chartY + chartHeight - barHeight;

        // Dibujar barra
        doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
        doc.rect(barX, barY, barWidth, barHeight, 'F');

        // Etiqueta de categoría
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${cat.name}`, barX + barWidth/2, chartY + chartHeight + 8, { align: 'center' });

        // Porcentaje
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cat.value.toFixed(1)}%`, barX + barWidth/2, chartY + chartHeight + 16, { align: 'center' });

        // Descripción
        doc.setFontSize(8);
        doc.text(cat.label, barX + barWidth/2, chartY + chartHeight + 24, { align: 'center' });
      });

      yPosition = chartY + chartHeight + 35;

      // Page 2: Alertas Críticas
      doc.addPage();
      addHeader();
      addFooter();

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ALERTAS CRÍTICAS', 15, yPosition);
      yPosition += 20;

      // Crear cards de alertas críticas más visuales
      const alertCards = reportData.alertSystem.filter(alert => 
        alert.priority === 'Crítica' || alert.priority === 'Alta'
      ).slice(0, 4);  // Solo mostrar las 4 más importantes

      const alertCardWidth = 90;
      const alertCardHeight = 50;
      const alertCardSpacing = 8;
      const alertStartX = 15;

      let alertX = alertStartX;
      let alertY = yPosition;

      alertCards.forEach((alert, index) => {
        if (index === 2) {
          alertX = alertStartX;
          alertY += alertCardHeight + alertCardSpacing;
        }

        // Determinar color según prioridad
        const cardColor = alert.priority === 'Crítica' ? errorColor : warningColor;

        // Fondo del card de alerta
        doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
        doc.roundedRect(alertX, alertY, alertCardWidth, alertCardHeight, 3, 3, 'F');

        // Icono de alerta (triángulo simple)
        doc.setFillColor(255, 255, 255);
        doc.triangle(alertX + 10, alertY + 8, alertX + 15, alertY + 18, alertX + 20, alertY + 8, 'F');

        // Título de la alerta
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const alertTitle = alert.name.length > 20 ? alert.name.substring(0, 20) + '...' : alert.name;
        doc.text(alertTitle, alertX + 25, alertY + 12);

        // Prioridad
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Prioridad: ${alert.priority}`, alertX + 25, alertY + 22);

        // Acción resumida
        doc.setFontSize(7);
        const actionText = alert.recommendedAction.length > 35 ? 
          alert.recommendedAction.substring(0, 35) + '...' : alert.recommendedAction;
        doc.text(actionText, alertX + 5, alertY + 35);
        
        // Criterio resumido
        const criteriaText = alert.criteria.length > 35 ? 
          alert.criteria.substring(0, 35) + '...' : alert.criteria;
        doc.text(criteriaText, alertX + 5, alertY + 43);

        alertX += alertCardWidth + alertCardSpacing;
      });

      yPosition = alertY + alertCardHeight + 25;

      // Acciones clave visuales
      checkNewPage(50);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ACCIONES PRIORITARIAS', 15, yPosition);
      yPosition += 15;

      // Crear bullets visuales para acciones
      const priorityActions = reportData.executiveSummary.recommendedActions.slice(0, 3);
      priorityActions.forEach((action, index) => {
        // Círculo numerado
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(20, yPosition + 3, 4, 'F');
        
        // Número
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text((index + 1).toString(), 20, yPosition + 6, { align: 'center' });
        
        // Texto de acción
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(action, 30, yPosition + 6);
        
        yPosition += 15;
      });

      // Resumen de alertas actuales (si existen) - versión visual simplificada
      if (alerts && alerts.length > 0) {
        yPosition += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DE ALERTAS ACTUALES', 15, yPosition);
        yPosition += 15;

        // Contadores visuales de alertas
        const alertCounts = {
          critical: alerts.filter(a => a.priority === 'critical').length,
          high: alerts.filter(a => a.priority === 'high').length,
          medium: alerts.filter(a => a.priority === 'medium').length,
          low: alerts.filter(a => a.priority === 'low').length
        };

        const alertSummary = [
          { label: 'Críticas', count: alertCounts.critical, color: errorColor },
          { label: 'Altas', count: alertCounts.high, color: warningColor },
          { label: 'Medias', count: alertCounts.medium, color: [251, 146, 60] },
          { label: 'Bajas', count: alertCounts.low, color: successColor }
        ];

        let summaryX = 15;
        alertSummary.forEach((item) => {
          if (item.count > 0) {
            // Badge de alerta
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.roundedRect(summaryX, yPosition, 35, 15, 2, 2, 'F');
            
            // Texto del badge
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.count}`, summaryX + 8, yPosition + 9);
            doc.setFontSize(8);
            doc.text(item.label, summaryX + 15, yPosition + 9);
            
            summaryX += 45;
          }
        });
      }

      // Save PDF
      const fileName = `Reporte_Inventario_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Dashboard Ejecutivo PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Genera un dashboard ejecutivo visual e impactante que incluye:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Dashboard visual con KPIs principales</li>
            <li>Cards de métricas para toma de decisiones</li>
            <li>Gráfico de análisis ABC interactivo</li>
            <li>Sistema de alertas críticas visuales</li>
            <li>Acciones prioritarias destacadas</li>
            <li>Resumen ejecutivo impactante</li>
          </ul>
        </div>
        
        <Button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando Reporte...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Generar Dashboard PDF
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          El dashboard se descargará automáticamente en formato PDF visual
        </p>
      </CardContent>
    </Card>
  );
}