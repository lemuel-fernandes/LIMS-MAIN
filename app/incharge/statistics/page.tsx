"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
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
} from "recharts";
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
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
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
};

export default function StatisticsPage() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      const res = await fetch("/incharge/equipment/api");
      const data = await res.json();
      setEquipmentData(data);
      setLoading(false);
    };
    fetchEquipment();
  }, []);

  // Stats
  const total = equipmentData.length;
  const damaged = equipmentData.filter((e) => e.condition === "damaged").length;
  const working = equipmentData.filter((e) => e.condition === "working").length;
  const maintenance = equipmentData.filter(
    (e) => e.condition === "maintenance"
  ).length;

  // Pie chart data by equipment name (top 4 types)
  const typeCounts: Record<string, number> = {};
  equipmentData.forEach((e) => {
    typeCounts[e.name] = (typeCounts[e.name] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const equipmentTypeData = sortedTypes.slice(0, 4).map(([name, value], i) => ({
    name,
    value,
    color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][i] || "#8884d8",
  }));
  if (sortedTypes.length > 4) {
    const others = sortedTypes.slice(4).reduce((sum, [, v]) => sum + v, 0);
    equipmentTypeData.push({ name: "Others", value: others, color: "#8884d8" });
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
                <p className="text-sm text-gray-600">Active Usage</p>
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
                <p className="text-sm text-gray-600">Maintenance Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenance}
                </p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {maintenance > 0 ? `+${maintenance}` : 0} due
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
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  {damaged > 0 ? `-${damaged}` : 0} damaged
                </p>
              </div>
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Trends */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Equipment Usage Trends
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadCSV(
                    equipmentToCSV(equipmentData),
                    "equipment_distribution.csv"
                  )
                }
                disabled={loading || !equipmentData.length}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            {/* Placeholder for usage trends, as no time-series data in DB */}
            <div className="text-center text-gray-500 py-16">
              No usage trend data available.
            </div>
          </div>

          {/* Equipment Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Equipment Distribution
              </h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Usage */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Department-wise Usage
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
          <div className="text-center text-gray-500 py-16">
            No department usage data available.
          </div>
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
