"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Download, Plus, ArrowRight, Search } from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
};

export default function InchargeDashboard() {
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

  // Stats calculation
  const total = equipmentData.length;
  // FIX: Make the filter case-insensitive to correctly count items
  const damaged = equipmentData.filter(
    (e) => e.condition?.toLowerCase() === "damaged"
  ).length;
  const working = equipmentData.filter(
    (e) => e.condition?.toLowerCase() === "working"
  ).length;

  return (
    <DashboardLayout
      userRole="incharge"
      title="Dashboard Overview"
      subtitle="Monitor performance, equipment, and inventory across all departments"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <span>↗</span> {total > 0 ? "Active" : "No Data"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Working</p>
                <p className="text-3xl font-bold text-gray-900">{working}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <span>↗</span> {working > 0 ? "Operational" : "No Data"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Damaged</p>
                <p className="text-3xl font-bold text-gray-900">{damaged}</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span>↘</span> {damaged > 0 ? "Attention Needed" : "No Data"}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Stock Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Equipment Stock Preview
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing up to 10 most recent items.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lab Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      Loading...
                    </td>
                  </tr>
                ) : equipmentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      No equipment found.
                    </td>
                  </tr>
                ) : (
                  equipmentData.slice(0, 10).map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.serialNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.purchaseDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.labLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.condition?.toLowerCase() === "working"
                              ? "bg-green-100 text-green-800"
                              : item.condition?.toLowerCase() === "damaged"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/incharge/equipment/viewAll">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowRight className="w-4 h-4" />
              View All Equipment
            </Button>
          </Link>
          <Link href="/incharge/statistics">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              View Statistics
            </Button>
          </Link>
          <Link href="/incharge/equipment/add">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

