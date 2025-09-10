"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { Download, Plus, ArrowRight, BookUp, X, CheckCircle, AlertTriangle, User, Users, FlaskConical, Beaker } from "lucide-react";

// --- TYPE DEFINITIONS ---
type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  labLocation: string;
  quantity: string;
  condition: string;
  status?: "Available" | "Issued"; // Added optional status field
};

type StudentDetails = {
    regNo: string;
    name: string;
    class: string;
    team: string;
    department: string;
};

type Experiment = {
    _id: string; 
    name: string;
    department: string;
    year: string;
    requiredEquipment: {
        name: string;
        quantity: number;
        details: string;
    }[];
};

// --- API HELPER FUNCTIONS ---

const fetchStudentByRegNo = async (regNo: string): Promise<StudentDetails | null> => {
    if (!regNo) return null;
    try {
        const response = await fetch(`/api/students/${encodeURIComponent(regNo)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch student details:", error);
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


export default function InchargeDashboard() {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SMART ISSUANCE STATE ---
  const [issueOpen, setIssueOpen] = useState(false);
  const [issuanceType, setIssuanceType] = useState<'standard' | 'custom'>('standard');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [fetchedStudent, setFetchedStudent] = useState<StudentDetails | null>(null);
  
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState('');

  const [equipmentCheck, setEquipmentCheck] = useState<{ available: boolean; message: string }>({ available: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  // Function to fetch or re-fetch equipment data
  const fetchInitialEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/incharge/equipment/api");
      setEquipmentData(await res.json());
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialEquipment();
  }, []);

  // --- SMART ISSUANCE HANDLERS ---

  const handleFetchStudent = async () => {
      if (!studentRegNo) return;
      setStudentLoading(true);
      setFetchedStudent(null);
      setExperiments([]);
      setSelectedExperimentId('');

      const student = await fetchStudentByRegNo(studentRegNo);
      setFetchedStudent(student);
      setStudentLoading(false);

      if (student && student.department && student.class) {
        setFormMessage({ type: '', text: '' });
        setExperimentsLoading(true);
        const fetchedExperiments = await fetchExperiments(student.department, student.class);
        setExperiments(fetchedExperiments);
        setExperimentsLoading(false);
      } else {
        setFormMessage({ type: 'error', text: 'Student not found or missing department/year info.' });
      }
  };

  // Availability check now includes 'status' to ensure equipment is not already issued
  useEffect(() => {
    if (issuanceType === 'standard' && selectedExperimentId) {
        const experiment = experiments.find(e => e._id === selectedExperimentId);
        if (!experiment) return;

        const availableEquipment = equipmentData.filter(e => e.condition?.toLowerCase() === 'working' && e.status !== 'Issued');
        let allRequirementsMet = true;
        let message = "All required equipment is available.";

        for (const req of experiment.requiredEquipment) {
            const availableCount = availableEquipment.filter(e => e.name === req.name).reduce((sum, item) => sum + Number(item.quantity || 1), 0);
            if (availableCount < req.quantity) {
                allRequirementsMet = false;
                message = `Not available: Only ${availableCount}/${req.quantity} of ${req.name} found.`;
                break;
            }
        }
        setEquipmentCheck({ available: allRequirementsMet, message });
    } else {
        setEquipmentCheck({ available: false, message: '' });
    }
  }, [selectedExperimentId, equipmentData, experiments, issuanceType]);
  
  // handleIssuanceSubmit now calls the new /api/issuances endpoint
  const handleIssuanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
        const response = await fetch('/api/issuances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentRegNo: fetchedStudent?.regNo,
                experimentId: selectedExperimentId,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'An unknown error occurred.');
        }

        setFormMessage({ type: 'success', text: result.message });
        fetchInitialEquipment(); // Re-fetch equipment data to show updated statuses
        
        setTimeout(() => {
            handleDialogChange(false); // Close dialog on success
        }, 2000);

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
    }
  };

  const selectedExperiment = experiments.find(e => e._id === selectedExperimentId);
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
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-3xl font-bold text-gray-900">{total}</p><p className="text-sm text-green-600 flex items-center gap-1 mt-1"><span>↗</span> {total > 0 ? "Active" : "No Data"}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><div className="w-6 h-6 bg-green-500 rounded"></div></div></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Working</p><p className="text-3xl font-bold text-gray-900">{working}</p><p className="text-sm text-green-600 flex items-center gap-1 mt-1"><span>↗</span> {working > 0 ? "Operational" : "No Data"}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><div className="w-6 h-6 bg-blue-500 rounded"></div></div></div></div>
          <div className="bg-white rounded-lg p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Damaged</p><p className="text-3xl font-bold text-gray-900">{damaged}</p><p className="text-sm text-red-600 flex items-center gap-1 mt-1"><span>↘</span> {damaged > 0 ? "Attention Needed" : "No Data"}</p></div><div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><div className="w-6 h-6 bg-red-500 rounded"></div></div></div></div>
        </div>

        {/* Equipment Stock Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold text-gray-900">Equipment Stock Preview</h3><p className="text-sm text-gray-600 mt-1">Showing up to 10 most recent items.</p></div></div></div>
          <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab Location</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{loading ? (<tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>) : equipmentData.length === 0 ? (<tr><td colSpan={6} className="text-center py-8">No equipment found.</td></tr>) : (equipmentData.slice(0, 10).map((item) => (<tr key={item._id}><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.serialNo}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.purchaseDate}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.labLocation}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.condition?.toLowerCase() === "working" ? "bg-green-100 text-green-800" : item.condition?.toLowerCase() === "damaged" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{item.condition}</span></td></tr>)))}</tbody></table></div>
        </div>
        
        {/* Action Buttons & Dialog */}
        <div className="flex justify-end gap-4">
            <Link href="/incharge/equipment/viewAll"><Button variant="outline" className="flex items-center gap-2 bg-transparent"><ArrowRight className="w-4 h-4" /> View All Equipment</Button></Link>
            <Link href="/incharge/statistics"><Button variant="outline" className="flex items-center gap-2 bg-transparent"><Download className="w-4 h-4" /> View Statistics</Button></Link>
            <Link href="/incharge/equipment/add"><Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Equipment</Button></Link>
          
          <Dialog open={issueOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2"><BookUp className="w-4 h-4" /> Issue Equipment</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>New Equipment Issuance</DialogTitle></DialogHeader>

                <div className="flex border border-gray-200 rounded-md p-1 bg-gray-100"><Button onClick={() => setIssuanceType('standard')} variant={issuanceType === 'standard' ? 'default' : 'ghost'} className="flex-1"><FlaskConical className="w-4 h-4 mr-2"/> Standard Experiment</Button><Button onClick={() => setIssuanceType('custom')} variant={issuanceType === 'custom' ? 'default' : 'ghost'} className="flex-1"><Beaker className="w-4 h-4 mr-2"/> Custom Issuance</Button></div>

                <form onSubmit={handleIssuanceSubmit} className="space-y-4 pt-4">
                    {issuanceType === 'standard' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">1. Student Register Number</label>
                                <div className="flex gap-2">
                                    <Input placeholder="e.g., CS101" value={studentRegNo} onChange={e => setStudentRegNo(e.target.value)} onBlur={handleFetchStudent} disabled={studentLoading}/>
                                </div>
                                {studentLoading && <p className="text-sm text-gray-500 mt-1">Searching for student...</p>}
                            </div>
                            {fetchedStudent && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"><p><strong>Name:</strong> {fetchedStudent.name}</p><p><strong>Department:</strong> {fetchedStudent.department} | <strong>Year:</strong> {fetchedStudent.class}</p></div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Experiment</label>
                                <select value={selectedExperimentId} onChange={e => setSelectedExperimentId(e.target.value)} className="w-full border rounded p-2 bg-gray-50" disabled={!fetchedStudent || experimentsLoading || experiments.length === 0}>
                                    <option value="" disabled>
                                        {experimentsLoading ? "Loading experiments..." : !fetchedStudent ? "Enter student reg no first" : experiments.length === 0 ? "No experiments found" : "Select an experiment..."}
                                    </option>
                                    {experiments.map(exp => <option key={exp._id} value={exp._id}>{exp.name}</option>)}
                                </select>
                            </div>
                            
                            {selectedExperiment && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-800">Required Equipment:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-md border">
                                        {selectedExperiment.requiredEquipment.map(eq => (
                                            <li key={eq.name}>
                                                <strong>{eq.quantity}x {eq.name}</strong> - <em>{eq.details}</em>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`flex items-center gap-2 p-2 rounded-md text-sm ${equipmentCheck.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {equipmentCheck.available ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                        {equipmentCheck.message}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 text-center p-8 bg-gray-50 rounded-lg"><p className="text-gray-600">Custom issuance form will be built here.</p><p className="text-sm text-gray-500">(Allows for manual selection of multiple students and equipment)</p></div>
                    )}

                    {formMessage.text && (<div className={`text-sm p-2 rounded-md ${formMessage.type === 'error' ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>{formMessage.text}</div>)}
                    <DialogFooter>
                        <Button type="submit" disabled={submitting || (issuanceType === 'standard' && !equipmentCheck.available)} className="bg-blue-600 hover:bg-blue-700 w-full">
                            {submitting ? 'Recording...' : 'Confirm and Issue Equipment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}

