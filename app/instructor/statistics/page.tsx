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
import { Download, TrendingUp, TrendingDown, Activity, ClipboardList, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Type Definitions ---
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

// --- Helper Functions for CSV Export ---
function convertToCSV(data: any[], headers: string[]): string {
  if (!data || data.length === 0) return "";
  const csvHeaders = headers.join(',');
  const rows = data.map(row => 
    headers.map(key => {
      let value = row[key];
      if (value === null || value === undefined) value = "";
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',')
  );
  return [csvHeaders, ...rows].join('\r\n');
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function StatisticsPage() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [issuanceData, setIssuanceData] = useState<Issuance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [equipmentRes, issuancesRes] = await Promise.all([
          fetch("/incharge/equipment/api"), // Assuming a common equipment API
          fetch("/api/issuances")
        ]);
        if (!equipmentRes.ok || !issuancesRes.ok) {
            throw new Error("Failed to fetch all necessary data.");
        }
        setEquipmentData(await equipmentRes.json());
        setIssuanceData(await issuancesRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- Download Handler with Specific Logic ---
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
        issuanceDate: new Date(issuance.issuanceDate).toLocaleString(),
        returnDate: issuance.returnDate ? new Date(issuance.returnDate).toLocaleString() : 'Active',
      }));
      headers = ["issuanceId", "status", "experimentName", "studentName", "studentRegNo", "issuanceDate", "returnDate"];
    }

    if (dataToExport.length === 0) {
      alert(`No data available to generate the "${reportType}" report.`);
      return;
    }
    const csvData = convertToCSV(dataToExport, headers);
    downloadCSV(csvData, filename);
  };

  // --- DERIVED DATA FOR CHARTS ---
  const totalEquipment = equipmentData.length;
  const damaged = equipmentData.filter((e) => e.condition?.toLowerCase() === "damaged").length;
  const working = equipmentData.filter((e) => e.condition?.toLowerCase() === "working").length;
  const maintenance = equipmentData.filter((e) => e.condition?.toLowerCase() === "maintenance").length;

  const totalIssuances = issuanceData.length;
  const activeIssuances = issuanceData.filter(i => i.status === 'Active').length;
  const returnedIssuances = issuanceData.filter(i => i.status === 'Returned').length;
  
  const departmentIssuanceData = issuanceData.reduce((acc, i) => {
    const dept = i.studentDetails?.department || "Unknown";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const departmentIssuanceChart = Object.entries(departmentIssuanceData).map(([name, count]) => ({ name, count }));

  const equipmentTypeData = equipmentData.reduce((acc, e) => {
    const name = e.name || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topEquipment = Object.entries(equipmentTypeData).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const pieChartData = topEquipment.map(([name, value], i) => ({ name, value, color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i]}));

  return (
    <DashboardLayout
      userRole="instructor"
      title="System Statistics"
      subtitle="Detailed analytics for all laboratory assets and activities."
    >
      <div className="space-y-6">
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        {/* Equipment Stats */}
        <h3 className="text-xl font-semibold text-gray-900">Equipment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Items</p><p className="text-2xl font-bold text-gray-900">{totalEquipment}</p></div><Activity className="w-8 h-8 text-blue-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Working</p><p className="text-2xl font-bold text-gray-900">{working}</p></div><TrendingUp className="w-8 h-8 text-green-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Maintenance</p><p className="text-2xl font-bold text-gray-900">{maintenance}</p></div><Activity className="w-8 h-8 text-orange-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Damaged</p><p className="text-2xl font-bold text-gray-900">{damaged}</p></div><TrendingDown className="w-8 h-8 text-red-500" /></div></div>
        </div>

        {/* Issuance Stats */}
        <h3 className="text-xl font-semibold text-gray-900">Issuance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Issuances</p><p className="text-2xl font-bold text-gray-900">{totalIssuances}</p></div><ClipboardList className="w-8 h-8 text-purple-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Currently Active</p><p className="text-2xl font-bold text-gray-900">{activeIssuances}</p></div><Activity className="w-8 h-8 text-blue-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed Returns</p><p className="text-2xl font-bold text-gray-900">{returnedIssuances}</p></div><CheckCircle className="w-8 h-8 text-green-500"/></div></div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Equipment Types</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name">{pieChartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Issuances by Department</h3><ResponsiveContainer width="100%" height={300}><BarChart data={departmentIssuanceChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#8B5CF6" name="Total Issuances" /></BarChart></ResponsiveContainer></div>
        </div>
        
        {/* Download Reports */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate & Download Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => handleDownloadReport('usage')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Usage Report</Button>
            <Button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => handleDownloadReport('maintenance')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Maintenance</Button>
            <Button className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleDownloadReport('inventory')} disabled={loading || !equipmentData.length}><Download className="w-4 h-4" />Inventory</Button>
            <Button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700" onClick={() => handleDownloadReport('issuances')} disabled={loading || !issuanceData.length}><Download className="w-4 h-4" />Issuance History</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
