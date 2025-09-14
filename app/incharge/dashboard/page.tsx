"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// UPDATED: Added the missing icons
import { Download, Plus, ArrowRight, FlaskConical, CheckCircle, AlertTriangle } from "lucide-react";

// --- Type Definition ---
type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
  status?: "Available" | "Issued" | "Under Maintenance";
};

export default function InchargeDashboard() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await fetch("/incharge/equipment/api");
        if (!res.ok) {
          throw new Error("Failed to fetch equipment data.");
        }
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

  // Stats calculation (case-insensitive)
  const total = equipmentData.length;
  const damaged = equipmentData.filter((e) => e.condition?.toLowerCase() === "damaged").length;
  const working = equipmentData.filter((e) => e.condition?.toLowerCase() === "working").length;

  return (
    <DashboardLayout
      userRole="incharge"
      title="Dashboard Overview"
      subtitle="Monitor performance, equipment, and inventory across all departments"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Equipment</p><p className="text-3xl font-bold text-gray-900">{total}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><FlaskConical className="w-6 h-6 text-blue-500" /></div></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Working</p><p className="text-3xl font-bold text-gray-900">{working}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-500" /></div></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Damaged</p><p className="text-3xl font-bold text-gray-900">{damaged}</p></div><div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-500" /></div></div></div>
        </div>

        {/* Equipment Stock Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Equipment Stock Preview</h3>
            <p className="text-sm text-gray-600 mt-1">Showing up to 10 most recent items.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                ) : equipmentData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">No equipment found.</td></tr>
                ) : (
                  equipmentData.slice(0, 10).map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.labLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ item.condition?.toLowerCase() === "working" ? "bg-green-100 text-green-800" : item.condition?.toLowerCase() === "damaged" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{item.condition}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ item.status === "Available" ? "bg-green-100 text-green-800" : item.status === "Issued" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{item.status || 'N/A'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* --- Action Buttons (Issuance button has been removed) --- */}
        <div className="flex justify-end gap-4">
            <Link href="/incharge/equipment/viewAll">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent"><ArrowRight className="w-4 h-4" /> View All Equipment</Button>
            </Link>
            <Link href="/incharge/statistics">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent"><Download className="w-4 h-4" /> View Statistics</Button>
            </Link>
            <Link href="/incharge/equipment/add">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Equipment</Button>
            </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

