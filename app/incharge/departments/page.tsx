"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Users,
  Package,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { useEffect, useMemo } from "react";

type Department = {
  _id: string;
  name: string;
  code: string;
  head: string;
  totalEquipment: number;
  activeIssues: number;
  students: number;
  labs: string[];
  status: string;
};

export default function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  const initialForm = {
    name: "",
    code: "",
    head: "",
    totalEquipment: 0,
    activeIssues: 0,
    students: 0,
    labs: "",
    status: "active",
  };
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (["totalEquipment", "activeIssues", "students"].includes(name)) {
        // Only allow non-negative integers
        const num = value === "" ? "" : Math.max(0, Number(value));
        return { ...prev, [name]: num };
      }
      return { ...prev, [name]: value };
    });
  };

  // Reset form and error on dialog open
  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setForm(initialForm);
      setError("");
      setSuccess("");
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    // Validation
    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.head.trim() ||
      !form.labs.trim()
    ) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }
    if (
      [form.totalEquipment, form.activeIssues, form.students].some(
        (n) => isNaN(Number(n as any)) || Number(n) < 0
      )
    ) {
      setError("Numeric fields must be non-negative numbers.");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/incharge/departments/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          code: form.code.trim(),
          head: form.head.trim(),
          labs: form.labs
            .split(",")
            .map((lab) => lab.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to add department");
      setForm(initialForm);
      setSuccess("Department added successfully!");
      // Refresh department list
      setLoading(true);
      const refreshed = await fetch("/incharge/departments/api");
      setDepartments(await refreshed.json());
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    async function fetchDepartments() {
      setLoading(true);
      try {
        const res = await fetch("/incharge/departments/api");
        const data = await res.json();
        setDepartments(data);
      } catch (e) {
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (dept) =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.head.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [departments, searchTerm]
  );

  const totalStats = useMemo(
    () => ({
      departments: departments.length,
      totalEquipment: departments.reduce(
        (sum, dept) => sum + dept.totalEquipment,
        0
      ),
      totalStudents: departments.reduce((sum, dept) => sum + dept.students, 0),
      activeIssues: departments.reduce(
        (sum, dept) => sum + dept.activeIssues,
        0
      ),
    }),
    [departments]
  );

  if (loading) {
    return (
      <DashboardLayout userRole="incharge" title="Departments">
        <div className="flex justify-center items-center h-96">
          <span>Loading departments...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="incharge" title="Departments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">
              Manage departments and their equipment allocation
            </p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <Input
                  name="name"
                  placeholder="Department Name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="code"
                  placeholder="Code"
                  value={form.code}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="head"
                  placeholder="Head of Department"
                  value={form.head}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  name="totalEquipment"
                  type="number"
                  placeholder="Total Equipment"
                  value={form.totalEquipment === 0 ? "" : form.totalEquipment}
                  onChange={handleFormChange}
                  min={0}
                  required
                />
                <Input
                  name="activeIssues"
                  type="number"
                  placeholder="Active Issues"
                  value={form.activeIssues === 0 ? "" : form.activeIssues}
                  onChange={handleFormChange}
                  min={0}
                  required
                />
                <Input
                  name="students"
                  type="number"
                  placeholder="Students"
                  value={form.students === 0 ? "" : form.students}
                  onChange={handleFormChange}
                  min={0}
                  required
                />
                <Input
                  name="labs"
                  placeholder="Labs (comma separated)"
                  value={form.labs}
                  onChange={handleFormChange}
                  required
                />
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full border rounded p-2"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && (
                  <div className="text-green-600 text-sm">{success}</div>
                )}
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {submitting ? "Adding..." : "Add Department"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.departments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Equipment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.totalEquipment}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalStats.totalStudents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
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
                    {totalStats.activeIssues}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department: Department) => (
            <Card
              key={department._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <p className="text-sm text-gray-600">{department.code}</p>
                  </div>
                  <Badge
                    variant={
                      department.status === "active" ? "default" : "secondary"
                    }
                    className={
                      department.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {department.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Department Head</p>
                  <p className="font-medium">{department.head}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Equipment</p>
                    <p className="text-lg font-semibold">
                      {department.totalEquipment}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-lg font-semibold">
                      {department.students}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Labs ({department.labs.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {department.labs
                      .slice(0, 2)
                      .map((lab: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {lab}
                        </Badge>
                      ))}
                    {department.labs.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{department.labs.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Active Issues</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {department.activeIssues}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Link href={`/incharge/departments/${department._id}`}>
                  <Button
                    className="w-full mt-2 bg-transparent"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
