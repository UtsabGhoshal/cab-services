import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localDatabaseService } from "@/services/localDatabase";
import { firebaseDriverService } from "@/services/firebaseDriverService";
import { Database, Server, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DriverDataStatusProps {
  onlyWhenVisible?: boolean;
}

export function DriverDataStatus({ onlyWhenVisible = true }: DriverDataStatusProps) {
  const [localDriverCount, setLocalDriverCount] = useState(0);
  const [firebaseStatus, setFirebaseStatus] = useState<"connected" | "error" | "checking">("checking");
  const [isVisible, setIsVisible] = useState(!onlyWhenVisible);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const checkDataStatus = async () => {
    try {
      // Check local database
      const localDrivers = await localDatabaseService.getAllDrivers();
      setLocalDriverCount(localDrivers.length);

      // Check Firebase connectivity
      try {
        await firebaseDriverService.getAllDrivers();
        setFirebaseStatus("connected");
      } catch (error) {
        setFirebaseStatus("error");
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error checking driver data status:", error);
    }
  };

  useEffect(() => {
    checkDataStatus();
    
    // Check periodically if component is visible
    if (isVisible) {
      const interval = setInterval(checkDataStatus, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Show toggle button in development mode
  if (onlyWhenVisible && !isVisible && import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm"
        >
          <Database className="w-4 h-4 mr-2" />
          DB Status
        </Button>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Driver Data Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={checkDataStatus}
                size="sm"
                variant="ghost"
                className="p-1 h-6 w-6"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              {onlyWhenVisible && (
                <Button
                  onClick={() => setIsVisible(false)}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                >
                  <XCircle className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Local Database Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Local Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={localDriverCount > 0 ? "default" : "secondary"}>
                {localDriverCount} drivers
              </Badge>
              {localDriverCount > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
          </div>

          {/* Firebase Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-orange-600" />
              <span className="text-sm">Firebase</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={
                  firebaseStatus === "connected" ? "default" : 
                  firebaseStatus === "error" ? "destructive" : "secondary"
                }
              >
                {firebaseStatus === "connected" ? "Connected" : 
                 firebaseStatus === "error" ? "Offline" : "Checking..."}
              </Badge>
              {firebaseStatus === "connected" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : firebaseStatus === "error" ? (
                <XCircle className="w-4 h-4 text-red-600" />
              ) : (
                <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Storage Info */}
          <div className="pt-2 border-t text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Last updated:</span>
              <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>
            {localDriverCount > 0 && (
              <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 font-medium">Driver data is being stored</span>
                </div>
              </div>
            )}
            {localDriverCount === 0 && firebaseStatus === "error" && (
              <div className="mt-1 p-2 bg-yellow-50 rounded border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">No drivers stored yet</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
