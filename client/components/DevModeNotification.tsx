import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { checkFirebaseConnection } from "@/utils/firebaseCheck";
import { FirebaseTroubleshooting } from "./FirebaseTroubleshooting";

export const DevModeNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isFirebaseDown, setIsFirebaseDown] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const available = await checkFirebaseConnection();
      if (!available) {
        setIsFirebaseDown(true);
        setShowNotification(true);
      }
    };

    // Only check in development
    if (process.env.NODE_ENV === "development") {
      checkConnection();
    }
  }, []);

  if (!showNotification || !isFirebaseDown) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <AlertTitle className="text-orange-800">
              Development Mode
            </AlertTitle>
            <AlertDescription className="text-orange-700 text-sm mt-1">
              Firebase is unavailable. Using local fallback authentication for
              development. Demo accounts are available for testing.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotification(false)}
            className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};
