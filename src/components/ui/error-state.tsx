import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
    title?: string;
    message?: string;
    retry?: () => void;
}

export function ErrorState({
    title = "Algo salió mal",
    message = "Ocurrió un error inesperado al cargar los datos.",
    retry
}: ErrorStateProps) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-4">
                <Alert variant="destuctive" className="border-destructive/50 bg-destructive/5 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </Alert>

                {retry && (
                    <Button onClick={retry} variant="outline" className="w-full">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Intentar de nuevo
                    </Button>
                )}
            </div>
        </div>
    );
}
