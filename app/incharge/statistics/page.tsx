"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Activity, ClipboardList, CheckCircle } from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
  status?: string;
  remarks?: string;
};

type Issuance = {
  _id: string;
  issuanceDate: string;
  returnDate?: string;
  status: "Active" | "Returned";
  experimentName: string;
  studentDetails: {
    regNo: string;
    name: string;
    department: string;
  };
};

// A flexible CSV conversion utility
function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) return "";
  
  const csvHeaders = headers.join(',');
  
  const rows = data.map(row => 
    headers.map(key => {
      let value = row[key];
      if (value === null || value === undefined) {
        value = "";
      }
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',')
  );
  
  return [csvHeaders, ...rows].join('\r\n');
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export default function StatisticsPage() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [issuanceData, setIssuanceData] = useState<Issuance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [equipmentRes, issuancesRes] = await Promise.all([
          fetch("/incharge/equipment/api"),
          fetch("/api/issuances")
        ]);
        
        const equipment = await equipmentRes.json();
        const issuances = await issuancesRes.json();
        
        setEquipmentData(equipment);
        setIssuanceData(issuances);
      } catch (error) {
        console.error("Failed to fetch statistics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Centralized download handler with specific logic for each report
  const handleDownloadReport = (reportType: 'usage' | 'maintenance' | 'inventory' | 'issuances') => {
    let dataToExport: any[] = [];
    let filename = "report.csv";
    let headers: string[] = [];

    if (reportType === 'usage') {
      filename = "equipment_usage_report.csv";
      dataToExport = equipmentData;
      headers = Object.keys(equipmentData[0] || {});
    } 
    else if (reportType === 'maintenance') {
      filename = "maintenance_schedule.csv";
      dataToExport = equipmentData.filter(e => 
        e.condition?.toLowerCase() === 'damaged' || e.condition?.toLowerCase() === 'maintenance'
      );
      headers = ["name", "serialNo", "labLocation", "condition", "remarks"];
    } 
    else if (reportType === 'inventory') {
      filename = "inventory_summary.csv";
      dataToExport = equipmentData;
      headers = ["name", "serialNo", "quantity", "labLocation", "status", "condition"];
    }
    else if (reportType === 'issuances') {
      filename = "issuance_history_report.csv";
      dataToExport = issuanceData.map(issuance => ({
        issuanceId: issuance._id,
        status: issuance.status,
        experimentName: issuance.experimentName,
        studentName: issuance.studentDetails?.name || 'N/A',
        studentRegNo: issuance.studentDetails?.regNo || 'N/A',
        studentDept: issuance.studentDetails?.department || 'N/A',
        issuanceDate: new Date(issuance.issuanceDate).toLocaleString(),
        returnDate: issuance.returnDate ? new Date(issuance.returnDate).toLocaleString() : 'Active',
      }));
      headers = ["issuanceId", "status", "experimentName", "studentName", "studentRegNo", "studentDept", "issuanceDate", "returnDate"];
    }

    if (dataToExport.length === 0) {
      alert(`No data available for the "${reportType}" report.`);
      return;
    }

    const csvData = convertToCSV(dataToExport, headers);
    downloadCSV(csvData, filename);
  };

  // --- DERIVED DATA FOR CHARTS ---
  const total = equipmentData.length;
  const damaged = equipmentData.filter((e) => e.condition?.toLowerCase() === "damaged").length;
  const working = equipmentData.filter((e) => e.condition?.toLowerCase() === "working").length;
  const maintenance = equipmentData.filter((e) => e.condition?.toLowerCase() === "maintenance").length;
  const totalIssuances = issuanceData.length;
  const activeIssuances = issuanceData.filter(i => i.status === 'Active').length;
  const returnedIssuances = issuanceData.filter(i => i.status === 'Returned').length;

  const departmentCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    const lab = e.labLocation || "Unknown";
    departmentCounts[lab] = (departmentCounts[lab] || 0) + 1;
  });
  const departmentUsageData = Object.entries(departmentCounts).map(([name, count]) => ({ name, count }));

  const departmentIssuanceCounts: Record<string, number> = {};
  issuanceData.forEach((i) => {
    const dept = i.studentDetails?.department || "Unknown";
    departmentIssuanceCounts[dept] = (departmentIssuanceCounts[dept] || 0) + 1;
  });
  const departmentIssuanceData = Object.entries(departmentIssuanceCounts).map(([name, count]) => ({ name, count }));

  const acquisitionCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    try {
      if (e.purchaseDate) {
        const year = new Date(e.purchaseDate).getFullYear().toString();
        acquisitionCounts[year] = (acquisitionCounts[year] || 0) + 1;
      }
    } catch (err) { /* Ignore invalid dates */ }
  });
  const acquisitionTrendData = Object.entries(acquisitionCounts).map(([year, count]) => ({ year, count })).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const typeCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    const name = e.name || "Unknown";
    typeCounts[name] = (typeCounts[name] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const equipmentTypeData = sortedTypes.slice(0, 5).map(([name, value], i) => ({ name, value, color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i]}));
  if (sortedTypes.length > 5) {
    const others = sortedTypes.slice(5).reduce((sum, [, v]) => sum + v, 0);
    equipmentTypeData.push({ name: "Others", value: others, color: "#6B7280" });
  }

  return (
    <DashboardLayout
      userRole="incharge"
      title="Equipment & Issuance Statistics"
      subtitle="Detailed analytics and usage reports for all laboratory assets and activities."
    >
      <div className="space-y-6">
        {/* Equipment Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Equipment</p><p className="text-2xl font-bold text-gray-900">{total}</p></div><Activity className="w-8 h-8 text-blue-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Working</p><p className="text-2xl font-bold text-gray-900">{working}</p></div><TrendingUp className="w-8 h-8 text-green-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Maintenance</p><p className="text-2xl font-bold text-gray-900">{maintenance}</p></div><Activity className="w-8 h-8 text-orange-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Damaged</p><p className="text-2xl font-bold text-gray-900">{damaged}</p></div><TrendingDown className="w-8 h-8 text-red-500" /></div></div>
        </div>
        
        {/* Issuance Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Issuances</p><p className="text-2xl font-bold text-gray-900">{totalIssuances}</p></div><ClipboardList className="w-8 h-8 text-purple-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Currently Active</p><p className="text-2xl font-bold text-gray-900">{activeIssuances}</p></div><Activity className="w-8 h-8 text-blue-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed Returns</p><p className="text-2xl font-bold text-gray-900">{returnedIssuances}</p></div><CheckCircle className="w-8 h-8 text-green-500"/></div></div>
        </div>

        {/* Equipment Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Acquisition Trends</h3><ResponsiveContainer width="100%" height={300}><BarChart data={acquisitionTrendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#3B82F6" name="New Equipment" /></BarChart></ResponsiveContainer></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Distribution by Type</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={equipmentTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name"><Cell key="cell-0" fill="#3B82F6" /><Cell key="cell-1" fill="#10B981" /><Cell key="cell-2" fill="#F59E0B" /><Cell key="cell-3" fill="#EF4444" /><Cell key="cell-4" fill="#8B5CF6" /><Cell key="cell-5" fill="#6B7280" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </div>
        
        {/* Department Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment by Department</h3><ResponsiveContainer width="100%" height={300}><BarChart data={departmentUsageData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#10B981" name="Total Equipment" /></BarChart></ResponsiveContainer></div>
            <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Issuances by Department</h3><ResponsiveContainer width="100%" height={300}><BarChart data={departmentIssuanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" fill="#8B5CF6" name="Total Issuances" /></BarChart></ResponsiveContainer></div>
        </div>

        {/* Download Reports section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => handleDownloadReport('usage')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Usage Report</Button>
            <Button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => handleDownloadReport('maintenance')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Maintenance Schedule</Button>
            <Button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleDownloadReport('inventory')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Inventory Summary</Button>
            <Button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700" onClick={() => handleDownloadReport('issuances')} disabled={loading || !issuanceData.length}><Download className="w-4 h-4" />Issuance History</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

