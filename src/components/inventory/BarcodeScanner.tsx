import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Plus, Search, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('No se pudo acceder a la cámara');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setLastScanned(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg">Escáner de Código de Barras</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5 text-zinc-400" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
          {scanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-green-500 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Camera className="h-12 w-12 mb-2" />
              <p className="text-sm">Cámara desactivada</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!scanning ? (
            <Button
              onClick={startScanning}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Camera className="mr-2 h-4 w-4" />
              Activar Cámara
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Detener
            </Button>
          )}
        </div>

        {/* Manual Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-sm text-zinc-400">O ingresa manualmente:</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Código de barras"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <Button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Last Scanned */}
        {lastScanned && (
          <div className="p-3 bg-green-500/10 rounded-lg">
            <p className="text-xs text-green-500 mb-1">Último escaneado:</p>
            <p className="text-white font-mono">{lastScanned}</p>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-zinc-500 text-center">
          💡 Para escaneo automático, instala una librería de detección de códigos
        </p>
      </CardContent>
    </Card>
  );
}

// Quick add product with barcode
export function QuickAddProduct() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const searchBarcode = async () => {
    if (!barcode.trim()) return;
    
    setLoading(true);
    // Search in products by barcode
    // const { data } = await supabase.from('products').select('*').eq('barcode', barcode).single();
    // setProduct(data);
    
    // Demo
    setTimeout(() => {
      setProduct({
        id: '1',
        name: 'Producto Demo',
        unit: 'unidad',
        current_stock: 10
      });
      setLoading(false);
    }, 500);
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-500" />
          Agregar Producto Rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Escanea o escribe código de barras"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Button
            onClick={searchBarcode}
            disabled={loading || !barcode.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {product && (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <p className="font-medium text-white">{product.name}</p>
            <p className="text-sm text-zinc-400">Stock actual: {product.current_stock} {product.unit}</p>
            <div className="flex gap-2 mt-3">
              <Input
                type="number"
                placeholder="Cantidad"
                defaultValue={0}
                className="w-24 bg-zinc-700 border-zinc-600"
              />
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Agregar al Inventario
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
