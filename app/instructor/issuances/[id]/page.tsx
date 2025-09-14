"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle, Clock, User, Package, Calendar } from "lucide-react";
import Link from "next/link";

// --- Type Definitions ---
type EquipmentDetail = {
  _id: string;
  name: string;
  serialNo: string;
};

type StudentDetail = {
  regNo: string;
  name: string;
  department: string;
};

type IssuanceDetail = {
  _id: string;
  issuanceDate: string;
  returnDate?: string;
  status: "Active" | "Returned";
  experimentName: string;
  studentDetails: StudentDetail;
  equipmentDetails: EquipmentDetail[];
};


export default function IssuanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [issuance, setIssuance] = useState<IssuanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  const fetchIssuance = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/issuances/${id}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch issuance record");
      }
      const data = await res.json();
      setIssuance(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIssuance();
  }, [fetchIssuance]);

  const handleReturn = async () => {
    setIsReturning(true);
    setError("");
    try {
        const res = await fetch('/api/issuances/return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issuanceId: id }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        // Success! Re-fetch the data to show the updated "Returned" status
        await fetchIssuance();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsReturning(false);
    }
  };


  if (loading) {
    return (
      <DashboardLayout userRole="instructor" title="Loading Issuance..." subtitle="Fetching record details...">
        <div className="text-center py-20 text-gray-500"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (error || !issuance) {
    return (
      <DashboardLayout userRole="instructor" title="Error" subtitle="Could not load issuance record.">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load record</AlertTitle>
          <AlertDescription>{error || "The requested issuance record could not be found."}</AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link href="/instructor/issuances">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to All Issuances</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="instructor"
      title={`Issuance: ${issuance.experimentName}`}
      subtitle={`Record for ${issuance.studentDetails.name} (${issuance.studentDetails.regNo})`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Link href="/instructor/issuances">
                <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to All Issuances
                </Button>
            </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{issuance.experimentName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Student: {issuance.studentDetails.name}</p>
                </div>
                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                    <Badge className={`${issuance.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {issuance.status}
                    </Badge>
                    {issuance.status === 'Active' && (
                        <Button onClick={handleReturn} disabled={isReturning} className="bg-green-600 hover:bg-green-700">
                           {isReturning ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CheckCircle className="w-4 h-4 mr-2"/>}
                           {isReturning ? 'Processing...' : 'Process Return'}
                        </Button>
                    )}
                </div>
            </div>

            {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Issued On</p><p className="font-medium text-gray-800">{new Date(issuance.issuanceDate).toLocaleString()}</p></div></div>
                <div className="flex items-center gap-3"><User className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Student Reg. No.</p><p className="font-medium text-gray-800">{issuance.studentDetails.regNo}</p></div></div>
                <div className="flex items-center gap-3"><Package className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Department</p><p className="font-medium text-gray-800">{issuance.studentDetails.department}</p></div></div>
                {issuance.returnDate && (<div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500 text-sm">Returned On</p><p className="font-medium text-gray-800">{new Date(issuance.returnDate).toLocaleString()}</p></div></div>)}
            </div>
            
            <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Issued Equipment</h4>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {issuance.equipmentDetails.map((item) => (
                            <tr key={item._id}>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{item.serialNo}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

