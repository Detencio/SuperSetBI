import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Settings,
  Calendar,
  Filter,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  exportToPDF, 
  exportToExcel, 
  exportToExcelMultiSheet,
  type ExportConfig 
} from "@/lib/export-utils";

export interface ExportButtonProps {
  data: any[];
  config: ExportConfig;
  title?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showAdvancedOptions?: boolean;
  allowColumnSelection?: boolean;
  allowDateRange?: boolean;
  multiSheetConfigs?: ExportConfig[];
}

export default function ExportButton({
  data,
  config,
  title = "Exportar",
  disabled = false,
  variant = "default",
  size = "default",
  showAdvancedOptions = false,
  allowColumnSelection = false,
  allowDateRange = false,
  multiSheetConfigs
}: ExportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    config.columns.map(col => col.key)
  );
  const [customFilename, setCustomFilename] = useState(config.filename);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();

  const handleQuickExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      const exportConfig = {
        ...config,
        data: filterDataByDateRange(data)
      };

      if (format === 'pdf') {
        exportToPDF(exportConfig);
      } else {
        exportToExcel(exportConfig);
      }
      
      toast({
        title: "Export successful",
        description: `File exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExport = async () => {
    setIsExporting(true);
    try {
      // Filter data based on date range
      const filteredData = filterDataByDateRange(data);
      
      // Filter columns based on selection
      const filteredColumns = config.columns.filter(col => 
        selectedColumns.includes(col.key)
      );
      
      const exportConfig: ExportConfig = {
        ...config,
        filename: customFilename || config.filename,
        columns: filteredColumns,
        data: filteredData
      };

      if (exportFormat === 'pdf') {
        exportToPDF(exportConfig);
      } else {
        exportToExcel(exportConfig);
      }
      
      toast({
        title: "Export successful",
        description: `File exported as ${exportFormat.toUpperCase()} successfully`,
      });
      
      setShowDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleMultiSheetExport = async () => {
    if (!multiSheetConfigs) return;
    
    setIsExporting(true);
    try {
      exportToExcelMultiSheet(multiSheetConfigs);
      
      toast({
        title: "Multi-sheet export successful",
        description: "Excel file with multiple sheets exported successfully",
      });
    } catch (error) {
      console.error('Multi-sheet export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the multi-sheet file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filterDataByDateRange = (originalData: any[]) => {
    if (!allowDateRange || !dateRange.startDate || !dateRange.endDate) {
      return originalData;
    }
    
    return originalData.filter(item => {
      const itemDate = new Date(item.date || item.createdAt || item.issueDate);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      
      return itemDate >= start && itemDate <= end;
    });
  };

  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns([...selectedColumns, columnKey]);
    } else {
      setSelectedColumns(selectedColumns.filter(key => key !== columnKey));
    }
  };

  const getExportStats = () => {
    const filteredData = filterDataByDateRange(data);
    return {
      totalRecords: filteredData.length,
      selectedColumns: selectedColumns.length,
      dateFiltered: allowDateRange && dateRange.startDate && dateRange.endDate
    };
  };

  if (disabled) {
    return (
      <Button disabled variant={variant} size={size}>
        <Download className="h-4 w-4 mr-2" />
        {title}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            disabled={isExporting}
            data-testid="export-button"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : title}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => handleQuickExport('pdf')}
            data-testid="export-pdf-quick"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleQuickExport('excel')}
            data-testid="export-excel-quick"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </DropdownMenuItem>
          
          {multiSheetConfigs && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleMultiSheetExport}
                data-testid="export-multisheet"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Multi-Sheet Excel
              </DropdownMenuItem>
            </>
          )}
          
          {showAdvancedOptions && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDialog(true)}
                data-testid="export-advanced"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced Options
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Advanced Export Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Export Options
            </DialogTitle>
            <DialogDescription>
              Customize your export with advanced filtering and formatting options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Export Format Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
                <SelectTrigger data-testid="select-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel Spreadsheet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename" className="text-sm font-medium">Filename</Label>
              <Input
                id="filename"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Enter custom filename"
                data-testid="input-filename"
              />
            </div>

            {/* Date Range Filter */}
            {allowDateRange && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Label className="text-sm font-medium">Date Range Filter</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Column Selection */}
            {allowColumnSelection && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Label className="text-sm font-medium">Select Columns to Export</Label>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border rounded">
                  {config.columns.map((column) => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={selectedColumns.includes(column.key)}
                        onCheckedChange={(checked) => 
                          handleColumnToggle(column.key, checked === true)
                        }
                        data-testid={`checkbox-column-${column.key}`}
                      />
                      <Label htmlFor={column.key} className="text-sm">
                        {column.header}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedColumns(config.columns.map(col => col.key))}
                    data-testid="button-select-all-columns"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedColumns([])}
                    data-testid="button-deselect-all-columns"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            )}

            {/* Export Statistics */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Export Preview</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {getExportStats().totalRecords} records
                </Badge>
                <Badge variant="outline">
                  {getExportStats().selectedColumns} columns
                </Badge>
                {getExportStats().dateFiltered && (
                  <Badge variant="secondary">Date filtered</Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-testid="button-cancel-export"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdvancedExport}
              disabled={isExporting || selectedColumns.length === 0}
              data-testid="button-confirm-export"
            >
              {isExporting ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}