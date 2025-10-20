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
import * as xlsx from "xlsx";

// --- Type Definitions ---
type Equipment = { _id: string; name: string; serialNo: string; purchaseDate: string; labLocation: string; quantity: string; condition: string; status?: string; remarks?: string; };
type Issuance = { _id: string; issuanceDate: string; returnDate?: string; status: "Active" | "Returned"; experimentName: string; studentDetails: { regNo: string; name: string; department: string; class: string; }; equipmentDetails: Equipment[]; };


// --- Helper Functions for File Export ---
const exportToExcel = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }
  const worksheet = xlsx.utils.json_to_sheet(data);
  const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, ...data.map(row => (row[key] || "").toString().length)) + 2
  }));
  worksheet["!cols"] = colWidths;
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Report");
  xlsx.writeFile(workbook, `${filename}.xlsx`);
};

const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateUsageReportText = (equipmentData: Equipment[], issuanceData: Issuance[]): string => {
    let report = "LIMS - Equipment Usage & Analysis Report\n";
    report += `Generated on: ${new Date().toLocaleString()}\n`;
    report += "========================================\n\n";
    report += "--- MOST USED EQUIPMENT ---\n";
    const usageCounts: Record<string, number> = {};
    issuanceData.forEach(issuance => {
        (issuance.equipmentDetails || []).forEach(eq => {
            usageCounts[eq.name] = (usageCounts[eq.name] || 0) + 1;
        });
    });
    const sortedUsage = Object.entries(usageCounts).sort((a, b) => b[1] - a[1]);
    if (sortedUsage.length > 0) {
        sortedUsage.slice(0, 10).forEach(([name, count], index) => {
            report += `${index + 1}. ${name}: Issued ${count} time(s)\n`;
        });
    } else { report += "No issuance data to analyze.\n"; }
    report += "\n";
    report += "--- ISSUANCES BY STUDENT YEAR ---\n";
    const yearCounts: Record<string, number> = {};
    issuanceData.forEach(issuance => {
        const year = issuance.studentDetails?.class || "Unknown";
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    const sortedYears = Object.entries(yearCounts).sort((a, b) => b[1] - a[1]);
    if (sortedYears.length > 0) {
        sortedYears.forEach(([year, count]) => {
            report += `Year ${year}: ${count} total issuance(s)\n`;
        });
    } else { report += "No issuance data to analyze.\n"; }
    report += "\n";
    report += "--- MOST FREQUENTLY DAMAGED EQUIPMENT ---\n";
    const damageCounts: Record<string, number> = {};
    equipmentData.forEach(eq => {
        if (eq.condition?.toLowerCase() === 'damaged') {
            damageCounts[eq.name] = (damageCounts[eq.name] || 0) + 1;
        }
    });
    const sortedDamage = Object.entries(damageCounts).sort((a, b) => b[1] - a[1]);
    if (sortedDamage.length > 0) {
        sortedDamage.forEach(([name, count]) => {
            report += `- ${name}: ${count} unit(s) currently in a damaged state\n`;
        });
    } else { report += "No damaged equipment found.\n"; }
    report += "\n--- END OF REPORT ---";
    return report;
};


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
          fetch("/incharge/equipment/api"),
          fetch("/api/issuances")
        ]);
        if (!equipmentRes.ok || !issuancesRes.ok) throw new Error("Failed to fetch all necessary data.");
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

  const handleDownloadReport = (reportType: 'usage' | 'maintenance' | 'inventory' | 'issuances') => {
    if (reportType === 'usage') {
        const reportText = generateUsageReportText(equipmentData, issuanceData);
        downloadText(reportText, "Equipment_Usage_Analysis.txt");
    }
    else if (reportType === 'issuances') {
        const dataForExport = issuanceData.flatMap(issuance => 
            (issuance.equipmentDetails || []).map(equipment => ({
                "Issuance ID": issuance._id, "Status": issuance.status, "Experiment": issuance.experimentName,
                "Student Name": issuance.studentDetails?.name || 'N/A', "Register No": issuance.studentDetails?.regNo || 'N/A',
                "Department": issuance.studentDetails?.department || 'N/A', "Equipment": equipment.name, "Serial No": equipment.serialNo,
                "Issue Date": new Date(issuance.issuanceDate).toLocaleString(), "Return Date": issuance.returnDate ? new Date(issuance.returnDate).toLocaleString() : 'Active',
            }))
        );
        exportToExcel(dataForExport, "Issuance_History_Report");
    } else {
        let dataToExport: any[] = [];
        let filename = "Equipment_Report";
        
        if (reportType === 'maintenance') {
          filename = "Maintenance_Schedule";
          const maintenanceItems = equipmentData.filter(e => e.condition?.toLowerCase() === 'damaged' || e.condition?.toLowerCase() === 'maintenance');
          dataToExport = maintenanceItems.map(item => ({ "Name": item.name, "Serial No": item.serialNo, "Lab": item.labLocation, "Condition": item.condition, "Remarks": item.remarks || "" }));
        } else if (reportType === 'inventory') {
          filename = "Inventory_Summary";
          dataToExport = equipmentData.map(item => ({ "Name": item.name, "Serial No": item.serialNo, "Quantity": item.quantity, "Lab": item.labLocation, "Status": item.status, "Condition": item.condition }));
        }
        exportToExcel(dataToExport, filename);
    }
  };

  const totalEquipment = equipmentData.length;
  const damaged = equipmentData.filter((e) => e.condition?.toLowerCase() === "damaged").length;
  const working = equipmentData.filter((e) => e.condition?.toLowerCase() === "working").length;
  const maintenance = equipmentData.filter((e) => e.condition?.toLowerCase() === "maintenance").length;
  const totalIssuances = issuanceData.length;
  const activeIssuances = issuanceData.filter(i => i.status === 'Active').length;
  const returnedIssuances = issuanceData.filter(i => i.status === 'Returned').length;
  const departmentIssuanceChart = Object.entries(issuanceData.reduce((acc, i) => { const dept = i.studentDetails?.department || "Unknown"; acc[dept] = (acc[dept] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([name, count]) => ({ name, count }));
  const topEquipment = Object.entries(equipmentData.reduce((acc, e) => { const name = e.name || "Unknown"; acc[name] = (acc[name] || 0) + 1; return acc; }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const pieChartData = topEquipment.map(([name, value], i) => ({ name, value, color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i]}));
  if (Object.keys(equipmentData.reduce((acc, e) => {const name = e.name || "Unknown"; acc[name] = (acc[name] || 0) + 1; return acc;}, {} as Record<string, number>)).length > 5) {
      pieChartData.push({name: "Others", value: equipmentData.length - topEquipment.reduce((sum, [,v]) => sum + v, 0), color: "#6B7280"});
  }

  return (
    <DashboardLayout userRole="instructor" title="System Statistics" subtitle="Detailed analytics for all laboratory assets and activities.">
      <div className="space-y-6">
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        <h3 className="text-xl font-semibold text-gray-900">Equipment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Items</p><p className="text-2xl font-bold text-gray-900">{totalEquipment}</p></div><Activity className="w-8 h-8 text-blue-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Working</p><p className="text-2xl font-bold text-gray-900">{working}</p></div><TrendingUp className="w-8 h-8 text-green-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Maintenance</p><p className="text-2xl font-bold text-gray-900">{maintenance}</p></div><Activity className="w-8 h-8 text-orange-500" /></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Damaged</p><p className="text-2xl font-bold text-gray-900">{damaged}</p></div><TrendingDown className="w-8 h-8 text-red-500" /></div></div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900">Issuance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Issuances</p><p className="text-2xl font-bold text-gray-900">{totalIssuances}</p></div><ClipboardList className="w-8 h-8 text-purple-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Currently Active</p><p className="text-2xl font-bold text-gray-900">{activeIssuances}</p></div><Activity className="w-8 h-8 text-blue-500"/></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed Returns</p><p className="text-2xl font-bold text-gray-900">{returnedIssuances}</p></div><CheckCircle className="w-8 h-8 text-green-500"/></div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Equipment Types</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name">{pieChartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><h3 className="text-lg font-semibold text-gray-900 mb-4">Issuances by Department</h3><ResponsiveContainer width="100%" height={300}><BarChart data={departmentIssuanceChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#8B5CF6" name="Total Issuances" /></BarChart></ResponsiveContainer></div>
        </div>
        
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

