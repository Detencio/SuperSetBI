import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  success: boolean;
  message: string;
  results?: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  };
}

interface DataUploaderProps {
  dataType: 'products' | 'sales' | 'collections';
  title: string;
  description: string;
  className?: string;
}

export function DataUploader({ dataType, title, description, className }: DataUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos CSV, Excel (.xlsx) y JSON",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "El archivo no puede ser mayor a 50MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
      setValidationResult(null);
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('dataType', dataType);

      const response = await fetch('/api/data-ingestion/validate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error validating file');
      }

      const result = await response.json();
      setValidationResult(result);
      
      if (result.validation.invalid > 0) {
        toast({
          title: "Archivo validado con errores",
          description: `${result.validation.invalid} registros tienen errores`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Archivo validado exitosamente",
          description: `${result.validation.valid} registros están listos para importar`,
        });
      }
    } catch (error) {
      toast({
        title: "Error en validación",
        description: "No se pudo validar el archivo",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = `/api/data-ingestion/${dataType}`;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const result = await response.json();
      setUploadResult(result);
      setShowResults(true);
      
      if (result.success) {
        toast({
          title: "Importación completada",
          description: result.message,
        });
      } else {
        toast({
          title: "Error en importación",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error en carga",
        description: "No se pudo procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/data-ingestion/templates/${dataType}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Error downloading template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dataType}_template.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Plantilla descargada",
        description: `Plantilla de ${dataType} descargada en formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error descargando plantilla",
        description: "No se pudo descargar la plantilla",
        variant: "destructive",
      });
    }
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setValidationResult(null);
    setShowResults(false);
    setUploadProgress(0);
  };

  return (
    <Card className={className} data-testid={`uploader-${dataType}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Cargar Archivo</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`file-${dataType}`}>Seleccionar archivo</Label>
                <Input
                  id={`file-${dataType}`}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  data-testid={`input-file-${dataType}`}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos soportados: CSV, Excel (.xlsx), JSON. Máximo 50MB.
                </p>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Archivo seleccionado</AlertTitle>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetUploader}
                        data-testid={`button-reset-${dataType}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult && (
                <Alert className={validationResult.validation.invalid > 0 ? "border-destructive" : "border-green-500"}>
                  {validationResult.validation.invalid > 0 ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>Resultado de validación</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <Badge variant="secondary">Total: {validationResult.validation.total}</Badge>
                        <Badge variant="default">Válidos: {validationResult.validation.valid}</Badge>
                        {validationResult.validation.invalid > 0 && (
                          <Badge variant="destructive">Errores: {validationResult.validation.invalid}</Badge>
                        )}
                      </div>
                      {validationResult.validation.errors.length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Ver errores</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Errores de validación</DialogTitle>
                              <DialogDescription>
                                Lista de errores encontrados en el archivo
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-80">
                              <div className="space-y-2">
                                {validationResult.validation.errors.slice(0, 50).map((error: string, index: number) => (
                                  <div key={index} className="text-sm p-2 bg-destructive/10 rounded">
                                    {error}
                                  </div>
                                ))}
                                {validationResult.validation.errors.length > 50 && (
                                  <div className="text-sm text-muted-foreground p-2">
                                    ... y {validationResult.validation.errors.length - 50} errores más
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando archivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={validateFile}
                  disabled={!selectedFile || validating || uploading}
                  variant="outline"
                  data-testid={`button-validate-${dataType}`}
                >
                  {validating ? "Validando..." : "Validar archivo"}
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={!selectedFile || uploading || (validationResult && validationResult.validation.invalid > 0)}
                  data-testid={`button-upload-${dataType}`}
                >
                  {uploading ? "Cargando..." : "Importar datos"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Descarga las plantillas para preparar tus archivos con el formato correcto.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('csv')}
                  data-testid={`button-template-csv-${dataType}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('excel')}
                  data-testid={`button-template-excel-${dataType}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Excel
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resultado de importación</DialogTitle>
              <DialogDescription>
                Resumen del proceso de importación de datos
              </DialogDescription>
            </DialogHeader>
            {uploadResult && (
              <div className="space-y-4">
                <Alert className={uploadResult.success ? "border-green-500" : "border-destructive"}>
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {uploadResult.success ? "Importación exitosa" : "Error en importación"}
                  </AlertTitle>
                  <AlertDescription>{uploadResult.message}</AlertDescription>
                </Alert>

                {uploadResult.results && (
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <Badge variant="secondary">Total: {uploadResult.results.total}</Badge>
                      <Badge variant="default">Exitosos: {uploadResult.results.successful}</Badge>
                      {uploadResult.results.failed > 0 && (
                        <Badge variant="destructive">Fallos: {uploadResult.results.failed}</Badge>
                      )}
                    </div>

                    {uploadResult.results.errors.length > 0 && (
                      <ScrollArea className="h-60 mt-4">
                        <div className="space-y-2">
                          {uploadResult.results.errors.map((error, index) => (
                            <div key={index} className="text-sm p-2 bg-destructive/10 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={resetUploader}>
                    Cargar otro archivo
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}