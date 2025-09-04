"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";

type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
};

const ViewAllEquipmentPage = () => {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [filteredData, setFilteredData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("all");

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await fetch("/incharge/equipment/api");
        const data: Equipment[] = await res.json();
        setEquipmentData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  useEffect(() => {
    let results = equipmentData;

    if (searchTerm) {
      results = results.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.serialNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.labLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCondition !== "all") {
      results = results.filter(
        (item) => item.condition?.toLowerCase() === selectedCondition
      );
    }

    setFilteredData(results);
  }, [searchTerm, selectedCondition, equipmentData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCondition("all");
  };

  const isFiltered = searchTerm !== "" || selectedCondition !== "all";

  return (
    <DashboardLayout
      userRole="incharge"
      title="All Equipment Stock"
      subtitle="Search, view, and manage all equipment across departments"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:flex-grow items-center">
            <div className="relative w-full sm:w-auto md:flex-grow md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search equipment..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="maintenance">Needs Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
          <Link href="/incharge/equipment/add" className="w-full md:w-auto flex-shrink-0">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full">
              <Plus className="w-4 h-4" />
              Add New Equipment
            </Button>
          </Link>
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
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Loading equipment...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No equipment matches your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.serialNo || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.labLocation || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.condition?.toLowerCase() === "working"
                            ? "bg-green-100 text-green-800"
                            : item.condition?.toLowerCase() === "damaged"
                            ? "bg-red-100 text-red-800"
                            : item.condition?.toLowerCase() === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.condition || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAllEquipmentPage;

