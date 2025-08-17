"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function EditEquipmentPage() {
  const params = useParams()
  const router = useRouter()

  // Mock data - in real app this would come from API
  const [formData, setFormData] = useState({
    name: "Microscope",
    serial: "12132",
    purchaseDate: "2021-07-16",
    location: "3rd block 1st Floor",
    quantity: "12",
    condition: "working",
    category: "optical",
    supplier: "Scientific Equipment Co.",
    cost: "2500",
    warranty: "2 years",
    description:
      "High-resolution optical microscope with 1000x magnification capability. Suitable for biological and material science applications.",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Equipment updated:", formData)
    router.push(`/incharge/equipment/${params.id}`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout userRole="incharge" title="Edit Equipment" subtitle="Update equipment details and specifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={`/incharge/equipment/${params.id}`}>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Equipment Details
            </Button>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name*</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number*</label>
                <Input
                  type="text"
                  value={formData.serial}
                  onChange={(e) => handleInputChange("serial", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optical">Optical</SelectItem>
                    <SelectItem value="glassware">Glassware</SelectItem>
                    <SelectItem value="heating">Heating</SelectItem>
                    <SelectItem value="measurement">Measurement</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition*</label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date*</label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lab Location*</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity*</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <Input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Cost</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="Enter cost in USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Period</label>
                <Input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange("warranty", e.target.value)}
                  placeholder="e.g., 2 years"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                placeholder="Enter equipment description and specifications"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href={`/incharge/equipment/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Equipment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
