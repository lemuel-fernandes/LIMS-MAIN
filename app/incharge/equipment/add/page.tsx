"use client";

import type React from "react";

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
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEquipmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    serialNo: "",
    purchaseDate: "",
    labLocation: "",
    quantity: "",
    condition: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/incharge/equipment/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/incharge/dashboard");
      } else {
        alert("Failed to add equipment. Please try again.");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout
      userRole="incharge"
      title="Add Equipment"
      subtitle="Enter equipment details to add to inventory"
    >
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Enter Equipment Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name*
              </label>
              <Input
                type="text"
                placeholder="Enter Equipment Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial No*
              </label>
              <Input
                type="text"
                placeholder="Enter Serial No"
                value={formData.serialNo}
                onChange={(e) => handleInputChange("serialNo", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date*
              </label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  handleInputChange("purchaseDate", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Location*
              </label>
              <Input
                type="text"
                placeholder="Enter Lab Location"
                value={formData.labLocation}
                onChange={(e) =>
                  handleInputChange("labLocation", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Quantity*
              </label>
              <Input
                type="number"
                placeholder="Enter Quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition*
              </label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save and Update Equipment Stock
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
