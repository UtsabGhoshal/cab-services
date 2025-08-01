import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Users, User, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function UserAvatar() {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link to="/signup">
          <Button
            variant="ghost"
            className="hidden md:flex items-center space-x-2 hover:bg-green-50 text-green-600 hover:text-green-700"
          >
            <User className="w-4 h-4" />
            <span>Sign Up</span>
          </Button>
        </Link>
        <Link to="/login">
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-md border-white/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Users className="w-4 h-4 mr-2" />
            Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <Link to="/dashboard">
        <Button
          variant="ghost"
          className="flex items-center space-x-3 hover:bg-blue-50 p-3 rounded-xl transition-all duration-300 hover:scale-105"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user && user.name ? getInitials(user.name) : ""}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800">
              {user && user.name ? user.name.split(" ")[0] : ""}
            </div>
            <div className="text-xs text-slate-500">View Dashboard</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </Button>
      </Link>

      {/* Dropdown Tooltip */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-fade-in">
          <div className="text-sm font-medium text-slate-800 mb-1">
            {user && user.name ? user.name : ""}
          </div>
          <div className="text-xs text-slate-500 mb-3">
            {user && user.email ? user.email : ""}
          </div>
          <div className="text-xs text-blue-600 font-medium">
            Click to go to Dashboard →
          </div>
        </div>
      )}
    </div>
  );
}
