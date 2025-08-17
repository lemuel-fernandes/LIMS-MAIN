"use client";

import {
  FlaskRoundIcon as Flask,
  Home,
  Building2,
  Settings,
  BarChart3,
  User,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "./auth-guard";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userRole: "incharge" | "instructor";
}

export function Sidebar({ userRole }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const inchargeItems = [
    { icon: Home, label: "Dashboard", href: "/incharge/dashboard" },
    { icon: Building2, label: "Departments", href: "/incharge/departments" },
    { icon: BarChart3, label: "Statistics", href: "/incharge/statistics" },
    { icon: User, label: "Profile", href: "/incharge/profile" },
  ];

  const instructorItems = [
    { icon: Home, label: "Dashboard", href: "/instructor/dashboard" },
    { icon: Building2, label: "Departments", href: "/instructor/departments" },
    { icon: Settings, label: "Settings", href: "/instructor/settings" },
  ];

  const menuItems = userRole === "incharge" ? inchargeItems : instructorItems;

  return (
    <div className="w-64 bg-white shadow-sm border-r flex flex-col h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Flask className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">LIMS</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 bg-white rounded-full"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-6 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {user?.designation || "User"}
            </div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
