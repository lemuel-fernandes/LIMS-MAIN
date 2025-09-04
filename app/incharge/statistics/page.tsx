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
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
};

// Utility to convert equipment data to CSV
function equipmentToCSV(equipmentData: Equipment[]): string {
  if (!equipmentData.length) return "";
  const headers = Object.keys(equipmentData[0]);
  const rows = equipmentData.map((e) =>
    headers.map((h) => `"${(e as any)[h] ?? ""}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv" });
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await fetch("/incharge/equipment/api");
        const data = await res.json();
        setEquipmentData(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  // --- DERIVED DATA FOR CHARTS ---

  // Stats (case-insensitive)
  const total = equipmentData.length;
  const damaged = equipmentData.filter(
    (e) => e.condition?.toLowerCase() === "damaged"
  ).length;
  const working = equipmentData.filter(
    (e) => e.condition?.toLowerCase() === "working"
  ).length;
  const maintenance = equipmentData.filter(
    (e) => e.condition?.toLowerCase() === "maintenance"
  ).length;

  // Department (Lab) Distribution Data
  const departmentCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    const lab = e.labLocation || "Unknown";
    departmentCounts[lab] = (departmentCounts[lab] || 0) + 1;
  });
  const departmentUsageData = Object.entries(departmentCounts).map(
    ([name, count]) => ({ name, count })
  );

  // Acquisition Trend Data (by year)
  const acquisitionCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    try {
      if (e.purchaseDate) {
        const year = new Date(e.purchaseDate).getFullYear().toString();
        acquisitionCounts[year] = (acquisitionCounts[year] || 0) + 1;
      }
    } catch (err) {
      // Ignore invalid dates
    }
  });
  const acquisitionTrendData = Object.entries(acquisitionCounts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Pie chart data by equipment name (top 5 types)
  const typeCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    const name = e.name || "Unknown";
    typeCounts[name] = (typeCounts[name] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const equipmentTypeData = sortedTypes.slice(0, 5).map(([name, value], i) => ({
    name,
    value,
    color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i],
  }));
  if (sortedTypes.length > 5) {
    const others = sortedTypes.slice(5).reduce((sum, [, v]) => sum + v, 0);
    equipmentTypeData.push({ name: "Others", value: others, color: "#6B7280" });
  }

  return (
    <DashboardLayout
      userRole="incharge"
      title="Equipment Statistics"
      subtitle="Detailed analytics and usage reports for all laboratory equipment"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {total > 0 ? `+${total}` : 0} total
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Working Items</p>
                <p className="text-2xl font-bold text-gray-900">{working}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {working > 0 ? `+${working}` : 0} working
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenance}
                </p>
                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {maintenance > 0 ? `+${maintenance}` : 0} items
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Damaged Items</p>
                <p className="text-2xl font-bold text-gray-900">{damaged}</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  {damaged > 0 ? `+${damaged}` : 0} items
                </p>
              </div>
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acquisition Trends */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Equipment Acquisition Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={acquisitionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="New Equipment" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Equipment Distribution by Type */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Equipment Distribution by Type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                >
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Usage */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Department-wise Equipment Count
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="Total Equipment" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Download Reports */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                downloadCSV(
                  equipmentToCSV(equipmentData),
                  "equipment_usage_report.csv"
                )
              }
              disabled={loading || !equipmentData.length}
            >
              <Download className="w-4 h-4" />
              Equipment Usage Report
            </Button>
            <Button
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() =>
                downloadCSV(
                  equipmentToCSV(equipmentData),
                  "maintenance_schedule.csv"
                )
              }
              disabled={loading || !equipmentData.length}
            >
              <Download className="w-4 h-4" />
              Maintenance Schedule
            </Button>
            <Button
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() =>
                downloadCSV(
                  equipmentToCSV(equipmentData),
                  "inventory_summary.csv"
                )
              }
              disabled={loading || !equipmentData.length}
            >
              <Download className="w-4 h-4" />
              Inventory Summary
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

