"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ArrowLeft,
  Users,
  Package,
  TrendingUp,
  MapPin,
  Edit,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock department data
const departmentData = {
  id: 1,
  name: "Computer Science",
  code: "CS",
  head: "Dr. Sarah Johnson",
  email: "sarah.johnson@university.edu",
  phone: "+1 (555) 123-4567",
  totalEquipment: 245,
  activeIssues: 32,
  students: 180,
  labs: [
    {
      id: 1,
      name: "CS Lab 1",
      location: "Block A, Floor 2",
      capacity: 40,
      equipment: 85,
    },
    {
      id: 2,
      name: "CS Lab 2",
      location: "Block A, Floor 3",
      capacity: 35,
      equipment: 78,
    },
    {
      id: 3,
      name: "Network Lab",
      location: "Block B, Floor 1",
      capacity: 30,
      equipment: 82,
    },
  ],
  status: "active",
  established: "2010",
  description:
    "The Computer Science department focuses on cutting-edge research and education in software engineering, artificial intelligence, and computer systems.",
};

// Mock equipment data for this department
const departmentEquipment = [
  {
    id: 1,
    name: "Dell OptiPlex 7090",
    serialNo: "DL001",
    location: "CS Lab 1",
    condition: "Working",
    lastMaintenance: "2024-01-15",
  },
  {
    id: 2,
    name: "HP ProDesk 600",
    serialNo: "HP002",
    location: "CS Lab 1",
    condition: "Working",
    lastMaintenance: "2024-01-10",
  },
  {
    id: 3,
    name: "Cisco Switch 2960",
    serialNo: "CS003",
    location: "Network Lab",
    condition: "Maintenance",
    lastMaintenance: "2024-01-05",
  },
  {
    id: 4,
    name: "Projector Epson EB-X41",
    serialNo: "EP004",
    location: "CS Lab 2",
    condition: "Working",
    lastMaintenance: "2024-01-20",
  },
  {
    id: 5,
    name: "Router TP-Link AC1750",
    serialNo: "TP005",
    location: "Network Lab",
    condition: "Working",
    lastMaintenance: "2024-01-12",
  },
];

export default function DepartmentDetailsPage() {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filteredEquipment = departmentEquipment.filter(
    (equipment) =>
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="instructor" title={departmentData.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/instructor/departments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {departmentData.name}
              </h1>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {departmentData.status}
              </Badge>
            </div>
            <p className="text-gray-600">
              {departmentData.code} • Established {departmentData.established}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Department
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentData.totalEquipment}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentData.activeIssues}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentData.students}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Labs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentData.labs.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="labs">Labs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Department Head</p>
                    <p className="font-medium">{departmentData.head}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{departmentData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{departmentData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm text-gray-700">
                      {departmentData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Equipment returned
                        </p>
                        <p className="text-xs text-gray-600">
                          Dell OptiPlex returned by John Doe
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New equipment issued
                        </p>
                        <p className="text-xs text-gray-600">
                          HP ProDesk issued to Jane Smith
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Maintenance scheduled
                        </p>
                        <p className="text-xs text-gray-600">
                          Cisco Switch maintenance due
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Department Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Equipment Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Serial No
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Location
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Condition
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Last Maintenance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.map((equipment) => (
                        <tr
                          key={equipment.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {equipment.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {equipment.serialNo}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {equipment.location}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                equipment.condition === "Working"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                equipment.condition === "Working"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {equipment.condition}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {equipment.lastMaintenance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentData.labs.map((lab) => (
                <Card key={lab.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{lab.name}</CardTitle>
                    <p className="text-sm text-gray-600">{lab.location}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="text-lg font-semibold">{lab.capacity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Equipment</p>
                        <p className="text-lg font-semibold">{lab.equipment}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      View Lab Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Equipment usage chart would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Maintenance schedule chart would be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
