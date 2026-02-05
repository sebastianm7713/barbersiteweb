import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log for debugging
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2">Se produjo un error</h2>
          <p className="text-sm text-muted-foreground mb-4">Algo falló al renderizar esta sección. Puedes recargar la página o volver al inicio.</p>

          {err && (
            <div className="mb-4 bg-gray-50 border p-3 rounded">
              <div className="font-medium mb-1">Error:</div>
              <div className="text-xs text-red-600 mb-2">{err.message}</div>
              {err.stack && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Ver stack</summary>
                  <pre className="whitespace-pre-wrap break-words mt-2 text-[12px]">{err.stack}</pre>
                </details>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => {
                    const payload = `Error: ${err.message}\n\nStack:\n${err.stack || ''}`;
                    navigator.clipboard?.writeText(payload).then(() => {
                      // eslint-disable-next-line no-console
                      console.log('Error copiado al portapapeles');
                    });
                  }}
                >Copiar error</button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#D4AF37] text-black rounded" onClick={() => window.location.reload()}>Recargar</button>
            <button className="px-4 py-2 border rounded" onClick={() => window.location.assign('/')}>Ir a Landing</button>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
