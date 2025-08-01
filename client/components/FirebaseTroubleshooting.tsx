import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { runFirebaseDiagnostics, type FirebaseDiagnostic } from '@/utils/firebaseDiagnostics';
import { checkFirebaseConnection, resetFirebaseCheck } from '@/utils/firebaseCheck';

export const FirebaseTroubleshooting: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseAvailable, setFirebaseAvailable] = useState<boolean | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      // Reset Firebase check cache
      resetFirebaseCheck();
      
      // Run diagnostics
      const results = await runFirebaseDiagnostics();
      setDiagnostics(results);
      
      // Check current Firebase status
      const available = await checkFirebaseConnection();
      setFirebaseAvailable(available);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Firebase Status & Diagnostics
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Check Firebase connectivity and troubleshoot common issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            {getStatusIcon(firebaseAvailable ? 'success' : 'error')}
            <span className="font-medium">
              Firebase Status: {firebaseAvailable ? 'Available' : 'Unavailable'}
            </span>
            {getStatusBadge(firebaseAvailable ? 'success' : 'error')}
          </AlertDescription>
        </Alert>

        {/* Diagnostics Results */}
        <div className="space-y-3">
          <h4 className="font-medium">Diagnostic Results:</h4>
          {diagnostics.map((diagnostic, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-3">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{diagnostic.message}</span>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                  {diagnostic.details && (
                    <p className="text-sm text-muted-foreground">{diagnostic.details}</p>
                  )}
                  {diagnostic.code && (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      Error: {diagnostic.code}
                    </code>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Solutions */}
        {diagnostics.some(d => d.status === 'error') && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Troubleshooting Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="font-medium">1. Check Firebase Console</p>
                  <p className="text-muted-foreground">
                    Verify your project exists and Authentication is enabled
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Firebase Console
                  </Button>
                </div>
                
                <div>
                  <p className="font-medium">2. Project Configuration</p>
                  <p className="text-muted-foreground">
                    Current project ID: <code>uride-cab-service</code>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Make sure this project exists and you have access to it
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">3. Enable Authentication</p>
                  <p className="text-muted-foreground">
                    Go to Authentication → Sign-in method and enable Email/Password
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">4. Local Development</p>
                  <p className="text-muted-foreground">
                    For now, the app will use local storage fallback authentication
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Working Fallback Notice */}
        {!firebaseAvailable && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Don't worry!</strong> The app is using local storage as a fallback.
              All features will work normally for development and testing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
