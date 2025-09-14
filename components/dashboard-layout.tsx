"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  BarChart2,
  User,
  LogOut,
  ClipboardList,
  Search,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Type definitions for the statistics fetched in the header
type EquipmentStat = { _id: string };
type IssuanceStat = { status: "Active" | "Returned" };

// --- Role-Specific Navigation ---
// Navigation items visible to all roles
const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: Users },
  { href: "/statistics", label: "Statistics", icon: BarChart2 },
];

// Navigation items visible ONLY to the instructor
const instructorNavItems = [
    { href: "/issuances", label: "Issuances", icon: ClipboardList },
];

// Bottom navigation items visible to all roles
const bottomNavItems = [
  { href: "/profile", label: "Profile", icon: User },
];

// Helper component for sidebar navigation links
const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  // Use startsWith for better active state matching
  const isActive = pathname.startsWith(href);

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 ${
          isActive ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </div>
    </Link>
  );
};

// The main Dashboard Layout component
export const DashboardLayout = ({
  userRole,
  title,
  subtitle,
  children,
}: {
  userRole: "incharge" | "instructor";
  title: string;
  subtitle: string;
  children: ReactNode;
}) => {
  const [stats, setStats] = useState({ totalEquipment: 0, activeIssuances: 0 });

  // Generate the final navigation list based on the user's role
  const navItems = [
      ...baseNavItems.map(item => ({...item, href: `/${userRole}${item.href}`})),
      ...(userRole === 'instructor' ? instructorNavItems.map(item => ({...item, href: `/${userRole}${item.href}`})) : [])
  ];
   const roleBottomNavItems = bottomNavItems.map(item => ({...item, href: `/${userRole}${item.href}`}));


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipmentRes, issuancesRes] = await Promise.all([
          fetch('/incharge/equipment/api'), // Equipment count is global
          fetch('/api/issuances')
        ]);
        if (equipmentRes.ok && issuancesRes.ok) {
          const equipmentData: EquipmentStat[] = await equipmentRes.json();
          const issuancesData: IssuanceStat[] = await issuancesRes.json();
          const activeIssuances = issuancesData.filter(issuance => issuance.status === 'Active').length;
          setStats({
            totalEquipment: equipmentData.length,
            activeIssuances: activeIssuances
          });
        }
      } catch (error) {
        console.error("Failed to fetch layout stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      {/* --- DESKTOP SIDEBAR (Static Position) --- */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-[280px] border-r bg-white z-20">
        <div className="grid h-full max-h-screen grid-rows-[auto_1fr_auto]">
          {/* Header */}
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href={`/${userRole}/dashboard`}>
              <FlaskConical className="h-6 w-6 text-blue-600" />
              <span>LIMS</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink key={item.label} {...item} />
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
             <nav className="grid items-start text-sm font-medium">
                {roleBottomNavItems.map((item) => (
                    <NavLink key={item.label} {...item} />
                ))}
                 <a href="/login" onClick={() => localStorage.clear()} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100">
                    <LogOut className="h-4 w-4" />
                    Logout
                 </a>
             </nav>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT & HEADER --- */}
      <div className="flex flex-col lg:ml-[280px]">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-white px-6 sticky top-0 z-10">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-base font-medium">
                <Link href={`/${userRole}/dashboard`} className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 text-lg font-semibold text-white">
                  <FlaskConical className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">LIMS</span>
                </Link>
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-4 px-2.5 text-gray-700 hover:text-gray-900">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-gray-100 pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>

          <div className="hidden md:flex items-center gap-6 ml-auto">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600" title="Total Equipment">
                  <FlaskConical className="h-4 w-4 text-gray-500" />
                  <span>{stats.totalEquipment} Items</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600" title="Active Issuances">
                  <ClipboardList className="h-4 w-4 text-gray-500" />
                  <span>{stats.activeIssuances} Issued</span>
              </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href={`/${userRole}/profile`}>Profile</Link></DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/login" onClick={() => localStorage.clear()}>Logout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 md:p-10">
            <div className="mx-auto grid w-full max-w-6xl gap-2">
                <div className="py-8">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-gray-600 mt-1">{subtitle}</p>
                </div>
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

