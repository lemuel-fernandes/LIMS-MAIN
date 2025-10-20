"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, AlertCircle, RefreshCw, Undo, CheckCircle, User, BookText, Beaker, Eye, Package, Calendar, Users , Clock} from "lucide-react";
import Link from "next/link";

// --- Type Definitions ---
type Equipment = { _id: string; name: string; serialNo: string; };
type Student = { regNo: string; name: string; department: string; };
type Issuance = {
  _id: string;
  issuanceDate: string;
  returnDate?: string;
  status: "Active" | "Returned";
  experimentName: string;
  studentDetails: Student;
  equipmentDetails: Equipment[];
};

const IssuancesPage = () => {
  const [issuances, setIssuances] = useState<Issuance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  
  // --- NEW: State for the details dialog ---
  const [selectedIssuance, setSelectedIssuance] = useState<Issuance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchIssuances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/issuances');
      if (!response.ok) throw new Error('Failed to fetch issuance records.');
      const data = await response.json();
      setIssuances(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssuances();
  }, [fetchIssuances]);

  const handleReturn = async (issuanceId: string) => {
    setReturningId(issuanceId);
    try {
      const response = await fetch('/api/issuances', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuanceId }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to process return.');
      }
      // On success, close the detail dialog if it's open and refresh the list
      setDetailOpen(false);
      await fetchIssuances();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReturningId(null);
    }
  };

  const handleViewDetails = (issuance: Issuance) => {
    setSelectedIssuance(issuance);
    setDetailOpen(true);
  };

  return (
    <DashboardLayout
      userRole="instructor"
      title="Issuance Records"
      subtitle="View and manage all active and returned equipment issuances."
    >
      <div className="mb-4 text-right">
        <Button onClick={fetchIssuances} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-8 h-8 mr-2 animate-spin" />
          <span>Loading issuance records...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {issuances.map((issuance) => (
            <div key={issuance._id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{issuance.experimentName}</h3>
                  <p className="text-sm text-gray-500">
                    Issued to: {issuance.studentDetails?.name || 'N/A'} on {new Date(issuance.issuanceDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={issuance.status === 'Active' ? 'default' : 'secondary'} className={issuance.status === 'Active' ? 'bg-blue-600' : ''}>
                  {issuance.status === 'Active' ? <Beaker className="w-3 h-3 mr-1.5"/> : <CheckCircle className="w-3 h-3 mr-1.5"/>}
                  {issuance.status}
                </Badge>
              </div>
              
              <div className="border-t mt-4 pt-4 flex justify-end items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(issuance)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                {issuance.status === 'Active' && (
                  <Button
                    onClick={() => handleReturn(issuance._id)}
                    disabled={returningId === issuance._id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Undo className={`w-4 h-4 mr-2 ${returningId === issuance._id ? 'animate-spin' : ''}`} />
                    {returningId === issuance._id ? 'Processing...' : 'Mark as Returned'}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {issuances.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <Beaker className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">No issuance records found.</p>
              <p className="text-sm">When you issue equipment from the dashboard, it will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* --- NEW: Dialog for displaying issuance details --- */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          {selectedIssuance && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedIssuance.experimentName}</DialogTitle>
                <p className="text-sm text-gray-500 pt-1">
                  Record for {selectedIssuance.studentDetails.name} ({selectedIssuance.studentDetails.regNo})
                </p>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Issued On</p><p className="font-medium text-gray-800">{new Date(selectedIssuance.issuanceDate).toLocaleString()}</p></div></div>
                    <div className="flex items-center gap-3"><Users className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Student Reg. No.</p><p className="font-medium text-gray-800">{selectedIssuance.studentDetails.regNo}</p></div></div>
                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Department</p><p className="font-medium text-gray-800">{selectedIssuance.studentDetails.department}</p></div></div>
                    {selectedIssuance.returnDate && (<div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Returned On</p><p className="font-medium text-gray-800">{new Date(selectedIssuance.returnDate).toLocaleString()}</p></div></div>)}
                </div>
                
                <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Issued Equipment</h4>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment Name</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {selectedIssuance.equipmentDetails.map((item) => (
                                <tr key={item._id}><td className="px-4 py-3 text-sm text-gray-900">{item.name}</td><td className="px-4 py-3 text-sm text-gray-500">{item.serialNo}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedIssuance.status === 'Active' && (
                    <div className="border-t pt-4">
                        <Button onClick={() => handleReturn(selectedIssuance._id)} disabled={returningId === selectedIssuance._id} className="w-full bg-green-600 hover:bg-green-700">
                           {returningId === selectedIssuance._id ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CheckCircle className="w-4 h-4 mr-2"/>}
                           {returningId === selectedIssuance._id ? 'Processing Return...' : 'Process Return'}
                        </Button>
                    </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default IssuancesPage;

