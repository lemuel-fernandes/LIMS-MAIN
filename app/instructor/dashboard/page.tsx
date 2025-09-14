"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookUp, CheckCircle, AlertTriangle, FlaskConical, Beaker, Users, Package, Clock, ArrowRight } from "lucide-react";

// --- Type Definitions ---
type Equipment = { _id: string; name: string; serialNo: string; quantity: string; condition: string; status?: string; };
type Student = { _id: string; regNo: string; name: string; class: string; department: string; };
type Issuance = { _id: string; issuanceDate: string; status: "Active" | "Returned"; experimentName: string; studentDetails: { name: string; regNo: string; }; };
type Experiment = { _id: string; name: string; requiredEquipment: { name: string; quantity: number; }[]; };

// --- API Helper Functions ---
const fetchStudentByRegNo = async (regNo: string): Promise<Student | null> => {
    if (!regNo) return null;
    try {
        const response = await fetch(`/api/students/${encodeURIComponent(regNo)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch student:", error);
        return null;
    }
};

const fetchExperiments = async (department: string, year: string): Promise<Experiment[]> => {
    if (!department || !year) return [];
    try {
        const response = await fetch(`/api/experiments?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch experiments:", error);
        return [];
    }
};

export default function InstructorDashboard() {
  // --- State for Dashboard Overview ---
  const [stats, setStats] = useState({ equipment: 0, students: 0, activeIssuances: 0 });
  const [recentIssuances, setRecentIssuances] = useState<Issuance[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State for Issuance Dialog ---
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issuanceType, setIssuanceType] = useState<'standard' | 'custom'>('standard');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [fetchedStudent, setFetchedStudent] = useState<Student | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  const [equipmentCheck, setEquipmentCheck] = useState({ available: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [customEquipmentSearch, setCustomEquipmentSearch] = useState("");
  const [customSelectedIds, setCustomSelectedIds] = useState<Set<string>>(new Set());

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [equipRes, studentRes, issuanceRes] = await Promise.all([
        fetch("/incharge/equipment/api"),
        fetch("/api/students"),
        fetch("/api/issuances"),
      ]);
      
      const equipment = await equipRes.json();
      const students = await studentRes.json();
      const issuances = await issuanceRes.json();

      setEquipmentData(Array.isArray(equipment) ? equipment : []);
      setRecentIssuances(Array.isArray(issuances) ? issuances.slice(0, 5) : []);

      setStats({
        equipment: Array.isArray(equipment) ? equipment.length : 0,
        students: Array.isArray(students) ? students.length : 0,
        activeIssuances: Array.isArray(issuances) ? issuances.filter((i: Issuance) => i.status === 'Active').length : 0,
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  // --- Event Handlers for Issuance Dialog ---
  const handleFetchStudent = async () => {
      if (!studentRegNo) return;
      setStudentLoading(true);
      setFetchedStudent(null);
      setExperiments([]);
      setSelectedExperimentId('');
      setFormMessage({ type: '', text: '' });

      const student = await fetchStudentByRegNo(studentRegNo);
      setFetchedStudent(student);
      setStudentLoading(false);

      if (student && student.department && student.class) {
        // Only fetch experiments if we are in standard mode
        if(issuanceType === 'standard') {
            setExperimentsLoading(true);
            const fetchedExperiments = await fetchExperiments(student.department, student.class);
            setExperiments(fetchedExperiments);
            setExperimentsLoading(false);
        }
      } else {
        setFormMessage({ type: 'error', text: 'Student not found or missing required details.' });
      }
  };

  useEffect(() => {
    if (issuanceType === 'standard' && selectedExperimentId) {
        const experiment = experiments.find(e => e._id === selectedExperimentId);
        if (!experiment) return;
        const availableItems = equipmentData.filter(e => e.condition?.toLowerCase() === 'working' && e.status !== 'Issued');
        let allMet = true;
        let message = "All required equipment is available.";
        for (const req of experiment.requiredEquipment) {
            const count = availableItems.filter(e => e.name === req.name).reduce((sum, item) => sum + Number(item.quantity || 1), 0);
            if (count < req.quantity) {
                allMet = false;
                message = `Unavailable: Only ${count}/${req.quantity} of ${req.name} found.`;
                break;
            }
        }
        setEquipmentCheck({ available: allMet, message });
    } else {
        setEquipmentCheck({ available: false, message: '' });
    }
  }, [selectedExperimentId, equipmentData, experiments, issuanceType]);

  const handleIssuanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage({ type: "", text: "" });

    let payload: any;
    if (issuanceType === 'standard') {
        payload = { studentRegNo: fetchedStudent?.regNo, experimentId: selectedExperimentId };
    } else {
        if (customSelectedIds.size === 0) {
            setFormMessage({ type: 'error', text: 'Please select at least one piece of equipment.' });
            setSubmitting(false);
            return;
        }
        payload = { studentRegNo: fetchedStudent?.regNo, equipmentIds: Array.from(customSelectedIds) };
    }

    try {
        const response = await fetch('/api/issuances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setFormMessage({ type: 'success', text: result.message });
        await fetchDashboardData();
        setTimeout(() => handleDialogChange(false), 2000);
    } catch (error: any) {
        setFormMessage({ type: 'error', text: error.message });
    } finally {
        setSubmitting(false);
    }
  };
  
  const handleDialogChange = (isOpen: boolean) => {
    setIssueOpen(isOpen);
    if (!isOpen) {
        setIssuanceType('standard');
        setStudentRegNo('');
        setFetchedStudent(null);
        setExperiments([]);
        setSelectedExperimentId('');
        setEquipmentCheck({ available: false, message: '' });
        setFormMessage({ type: '', text: '' });
        setCustomSelectedIds(new Set());
        setCustomEquipmentSearch("");
    }
  };

  const toggleCustomEquipment = (id: string) => {
    setCustomSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const availableEquipmentForCustom = equipmentData
    .filter(e => e.condition?.toLowerCase() === 'working' && e.status !== 'Issued')
    .filter(e => 
        (e.name || '').toLowerCase().includes(customEquipmentSearch.toLowerCase()) || 
        (e.serialNo || '').toLowerCase().includes(customEquipmentSearch.toLowerCase())
    );

  // CORRECTED: More robust logic for disabling the submit button
  const isSubmitDisabled = submitting || !fetchedStudent ||
    (issuanceType === 'standard' && !equipmentCheck.available) ||
    (issuanceType === 'custom' && customSelectedIds.size === 0);

  return (
    <DashboardLayout
      userRole="instructor"
      title="Instructor Dashboard"
      subtitle="An overview of lab activities and equipment status."
    >
      <div className="space-y-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardContent className="p-6 flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Total Equipment</p><p className="text-3xl font-bold text-gray-900">{stats.equipment}</p></div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Enrolled Students</p><p className="text-3xl font-bold text-gray-900">{stats.students}</p></div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-500">Active Issuances</p><p className="text-3xl font-bold text-gray-900">{stats.activeIssuances}</p></div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div>
                </CardContent>
            </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Dialog open={issueOpen} onOpenChange={handleDialogChange}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-green-600 hover:bg-green-700"><BookUp className="w-4 h-4 mr-2" /> Issue Equipment</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>New Equipment Issuance</DialogTitle></DialogHeader>
                                <div className="flex border border-gray-200 rounded-md p-1 bg-gray-100"><Button onClick={() => setIssuanceType('standard')} variant={issuanceType === 'standard' ? 'default' : 'ghost'} className="flex-1"><FlaskConical className="w-4 h-4 mr-2"/> Standard</Button><Button onClick={() => setIssuanceType('custom')} variant={issuanceType === 'custom' ? 'default' : 'ghost'} className="flex-1"><Beaker className="w-4 h-4 mr-2"/> Custom</Button></div>
                                <form onSubmit={handleIssuanceSubmit} className="space-y-4 pt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Student Register Number</label>
                                        <Input placeholder="e.g., CS101" value={studentRegNo} onChange={e => setStudentRegNo(e.target.value)} onBlur={handleFetchStudent} disabled={studentLoading}/>
                                        {studentLoading && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                                    </div>
                                    {fetchedStudent && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"><p><strong>Name:</strong> {fetchedStudent.name}</p><p><strong>Dept:</strong> {fetchedStudent.department} | <strong>Year:</strong> {fetchedStudent.class}</p></div>
                                    )}
                                    {issuanceType === 'standard' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Experiment</label>
                                                <select value={selectedExperimentId} onChange={e => setSelectedExperimentId(e.target.value)} className="w-full border rounded p-2 bg-gray-50" disabled={!fetchedStudent || experimentsLoading || experiments.length === 0}>
                                                    <option value="" disabled>{experimentsLoading ? "Loading..." : !fetchedStudent ? "Enter student first" : experiments.length === 0 ? "No experiments found" : "Select an experiment..."}</option>
                                                    {experiments.map(exp => <option key={exp._id} value={exp._id}>{exp.name}</option>)}
                                                </select>
                                            </div>
                                            {selectedExperimentId && (
                                                <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${equipmentCheck.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><p>{equipmentCheck.message}</p></div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                           <label className="block text-sm font-medium text-gray-700">2. Select Equipment</label>
                                           <Input placeholder="Search available equipment..." value={customEquipmentSearch} onChange={e => setCustomEquipmentSearch(e.target.value)} />
                                           <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                                            {availableEquipmentForCustom.map(item => (
                                                <div key={item._id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${customSelectedIds.has(item._id) ? 'bg-blue-100' : 'hover:bg-gray-50'}`} onClick={() => toggleCustomEquipment(item._id)}>
                                                    <div><p className="font-medium">{item.name}</p><p className="text-xs text-gray-500">{item.serialNo}</p></div>
                                                    {customSelectedIds.has(item._id) && <CheckCircle className="w-5 h-5 text-blue-600" />}
                                                </div>
                                            ))}
                                            {availableEquipmentForCustom.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No available equipment matches.</p>}
                                           </div>
                                           <p className="text-sm text-gray-600">{customSelectedIds.size} item(s) selected.</p>
                                        </div>
                                    )}
                                    {formMessage.text && (<div className={`text-sm p-2 rounded-md text-center ${formMessage.type === 'error' ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>{formMessage.text}</div>)}
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmitDisabled} className="bg-blue-600 hover:bg-blue-700 w-full">
                                            {submitting ? 'Recording...' : 'Confirm and Issue'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Link href="/instructor/issuances">
                            <Button variant="outline" className="w-full">
                                View All Issuances <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <p className="text-sm text-gray-500">Loading activity...</p> : recentIssuances.length > 0 ? (
                            <div className="space-y-4">
                                {recentIssuances.map(issuance => (
                                    <div key={issuance._id} className="flex items-center justify-between pb-2 border-b last:border-b-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${issuance.status === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                            <div>
                                                <p className="font-medium">{issuance.studentDetails?.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">{issuance.experimentName}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">{new Date(issuance.issuanceDate).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent issuances found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

