"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  DialogDescription,
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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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

// A specific type for the form to handle labs as a single string
type DepartmentForm = Omit<Partial<Department>, 'labs'> & { labs?: string };


export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogOpen, setDialogOpen] = useState(false);
  const initialForm: DepartmentForm = {
    name: "", code: "", head: "", totalEquipment: 0,
    activeIssues: 0, students: 0, labs: "", status: "active",
  };
  const [form, setForm] = useState<DepartmentForm>(initialForm);
  
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const res = await fetch("/instructor/departments/api");
      if (!res.ok) throw new Error("Failed to fetch departments from the server.");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setPageError(e.message || "Could not fetch department data.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (mode: "add" | "edit", dept?: Department) => {
    setDialogMode(mode);
    setDialogError("");
    setSuccess("");
    if (mode === 'edit' && dept) {
      setForm({ ...dept, labs: Array.isArray(dept.labs) ? dept.labs.join(", ") : "" });
    } else {
      setForm(initialForm);
    }
    setDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDialogError("");
    setSuccess("");

    try {
      const isEdit = dialogMode === 'edit';
      const apiUrl = isEdit ? "/instructor/departments/api/update" : "/instructor/departments/api/add";
      
      const payload = {
        ...form,
        labs: form.labs?.split(",").map(lab => lab.trim()).filter(Boolean) || [],
      };
      if (isEdit) {
        (payload as Department)._id = form._id!;
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Failed to ${dialogMode} department`);

      setSuccess(`Department ${isEdit ? 'updated' : 'added'} successfully!`);
      await fetchDepartments();
      setTimeout(() => setDialogOpen(false), 1500);

    } catch (err: any) {
      setDialogError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
      if (!departmentToDelete) return;
      setSubmitting(true);
      setDialogError("");
      try {
          const res = await fetch('/instructor/departments/api/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ _id: departmentToDelete._id }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          await fetchDepartments();
          setDeleteDialogOpen(false);
          setDepartmentToDelete(null);
      } catch (err:any) {
          setDialogError(err.message);
      } finally {
          setSubmitting(false);
      }
  };

  const filteredDepartments = useMemo(
    () => departments.filter((dept) =>
        (dept.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.head || '').toLowerCase().includes(searchTerm.toLowerCase())
      ), [departments, searchTerm]);

  const totalStats = useMemo(() => ({
      departments: departments.length,
      totalEquipment: departments.reduce((sum, dept) => sum + (dept.totalEquipment || 0), 0),
      totalStudents: departments.reduce((sum, dept) => sum + (dept.students || 0), 0),
      activeIssues: departments.reduce((sum, dept) => sum + (dept.activeIssues || 0), 0),
    }), [departments]);

  return (
    <DashboardLayout userRole="instructor" title="Departments" subtitle="Manage departments and their equipment allocation">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage departments and their equipment allocation</p>
          </div>
          <Button onClick={() => handleOpenDialog('add')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Department
          </Button>
        </div>

        {loading && <div className="text-center py-20 text-gray-500">Loading departments...</div>}
        {pageError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{pageError}</AlertDescription></Alert>}

        {!loading && !pageError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Departments</p><p className="text-2xl font-bold text-gray-900">{totalStats.departments}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Equipment</p><p className="text-2xl font-bold text-gray-900">{totalStats.totalEquipment}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Students</p><p className="text-2xl font-bold text-gray-900">{totalStats.totalStudents}</p></div><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Issues</p><p className="text-2xl font-bold text-gray-900">{totalStats.activeIssues}</p></div><div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-orange-600" /></div></div></CardContent></Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <Card key={department._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div><CardTitle className="text-lg">{department.name || "Unnamed Dept"}</CardTitle><p className="text-sm text-gray-600">{department.code}</p></div>
                      <Badge variant={department.status === "active" ? "default" : "secondary"} className={department.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{department.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div><p className="text-sm text-gray-600">Department Head</p><p className="font-medium">{department.head}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-sm text-gray-600">Equipment</p><p className="text-lg font-semibold">{department.totalEquipment || 0}</p></div>
                      <div><p className="text-sm text-gray-600">Students</p><p className="text-lg font-semibold">{department.students || 0}</p></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Labs ({Array.isArray(department.labs) ? department.labs.length : 0})</p>
                      <div className="flex flex-wrap gap-1">
                        {(department.labs || []).slice(0, 2).map((lab: string, index: number) => (<Badge key={index} variant="outline" className="text-xs">{lab}</Badge>))}
                        {Array.isArray(department.labs) && department.labs.length > 2 && (<Badge variant="outline" className="text-xs">+{department.labs.length - 2} more</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div><p className="text-sm text-gray-600">Active Issues</p><p className="text-lg font-semibold text-orange-600">{department.activeIssues || 0}</p></div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleOpenDialog('edit', department)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {setDepartmentToDelete(department); setDeleteDialogOpen(true);}}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <Link href={`/instructor/departments/${department._id}`} className="block">
                      <Button className="w-full mt-2" variant="outline">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredDepartments.length === 0 && (
                <div className="text-center text-gray-500 py-16">
                    <p>No departments found.</p>
                </div>
            )}
          </>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{dialogMode === 'add' ? 'Add New' : 'Edit'} Department</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Input name="name" placeholder="Department Name" value={form.name || ''} onChange={handleFormChange} required />
                    <Input name="code" placeholder="Code" value={form.code || ''} onChange={handleFormChange} required />
                    <Input name="head" placeholder="Head of Department" value={form.head || ''} onChange={handleFormChange} required />
                    <Input name="totalEquipment" type="number" placeholder="Total Equipment" value={String(form.totalEquipment || "")} onChange={handleFormChange} min={0} />
                    <Input name="activeIssues" type="number" placeholder="Active Issues" value={String(form.activeIssues || "")} onChange={handleFormChange} min={0} />
                    <Input name="students" type="number" placeholder="Students" value={String(form.students || "")} onChange={handleFormChange} min={0} />
                    <Input name="labs" placeholder="Labs (comma separated)" value={form.labs || ''} onChange={handleFormChange} required />
                    <select name="status" value={form.status} onChange={handleFormChange} className="w-full border rounded p-2 bg-gray-50"><option value="active">Active</option><option value="maintenance">Maintenance</option></select>
                    {dialogError && <div className="text-red-600 text-sm">{dialogError}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>This action will permanently delete the <strong>{departmentToDelete?.name}</strong> department and cannot be undone.</DialogDescription>
                </DialogHeader>
                {dialogError && <p className="text-red-600 text-sm">{dialogError}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? 'Deleting...' : 'Yes, delete department'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

