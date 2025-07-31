import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, X } from "lucide-react";

export default function DriverAccessButton() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Close button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-3 h-3" />
        </Button>

        {/* Main driver button */}
        <Link to="/driver">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-full w-16 h-16 p-0"
          >
            <Car className="w-8 h-8" />
          </Button>
        </Link>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Driver Portal
          <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      </div>
    </div>
  );
}
