"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ArrowLeft, Calendar, MapPin, Package, Wrench } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Mock data - in real app this would come from API
const getEquipmentById = (id: string) => {
  const equipment = {
    1: {
      id: 1,
      name: "Microscope",
      serial: "12132",
      purchaseDate: "16/07/2021",
      location: "3rd block 1st Floor",
      quantity: 12,
      condition: "Working",
      category: "Optical",
      lastMaintenance: "15/06/2021",
      nextMaintenance: "15/12/2021",
      supplier: "Scientific Equipment Co.",
      cost: "$2,500",
      warranty: "2 years",
      description:
        "High-resolution optical microscope with 1000x magnification capability. Suitable for biological and material science applications.",
      specifications: {
        Magnification: "40x - 1000x",
        "Objective Lenses": "4x, 10x, 40x, 100x",
        Illumination: "LED",
        Stage: "Mechanical stage with coaxial controls",
      },
      maintenanceHistory: [
        {
          date: "15/06/2021",
          type: "Routine Cleaning",
          technician: "John Doe",
          notes: "Cleaned lenses and calibrated",
        },
        { date: "15/03/2021", type: "Repair", technician: "Jane Smith", notes: "Replaced LED bulb" },
        {
          date: "15/12/2020",
          type: "Annual Service",
          technician: "Mike Johnson",
          notes: "Full service and calibration",
        },
      ],
    },
  }
  return equipment[id as keyof typeof equipment]
}

export default function EquipmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const equipment = getEquipmentById(params.id as string)

  if (!equipment) {
    return (
      <DashboardLayout userRole="incharge" title="Equipment Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-gray-500">Equipment not found</p>
          <Link href="/incharge/equipment">
            <Button className="mt-4">Back to Equipment List</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole="incharge"
      title={equipment.name}
      subtitle={`Serial: ${equipment.serial} | Category: ${equipment.category}`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link href="/incharge/equipment">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Equipment List
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/incharge/equipment/${equipment.id}/edit`}>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4" />
                Edit Equipment
              </Button>
            </Link>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Equipment Name</label>
                  <p className="text-sm text-gray-900 mt-1">{equipment.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Serial Number</label>
                  <p className="text-sm text-gray-900 mt-1">{equipment.serial}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm text-gray-900 mt-1">{equipment.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Condition</label>
                  <Badge variant={equipment.condition === "Working" ? "default" : "destructive"} className="mt-1">
                    {equipment.condition}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm text-gray-900 mt-1">{equipment.quantity} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900 mt-1">{equipment.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-700">{equipment.description}</p>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
              <div className="space-y-3">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-500">{key}</span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance History</h3>
              <div className="space-y-4">
                {equipment.maintenanceHistory.map((record, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{record.type}</span>
                      <span className="text-sm text-gray-500">{record.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Technician: {record.technician}</p>
                    <p className="text-sm text-gray-700">{record.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Purchase Date</p>
                    <p className="text-sm text-gray-600">{equipment.purchaseDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{equipment.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Supplier</p>
                    <p className="text-sm text-gray-600">{equipment.supplier}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Maintenance</p>
                    <p className="text-sm text-gray-600">{equipment.lastMaintenance}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Purchase Cost</span>
                  <span className="text-sm text-gray-900">{equipment.cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Warranty</span>
                  <span className="text-sm text-gray-900">{equipment.warranty}</span>
                </div>
              </div>
            </div>

            {/* Maintenance Schedule */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Maintenance Due</p>
                  <p className="text-sm text-orange-600 font-medium">{equipment.nextMaintenance}</p>
                </div>
                <Button size="sm" className="w-full">
                  Schedule Maintenance
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
