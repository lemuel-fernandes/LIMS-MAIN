"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Undo, CheckCircle, User, BookText, Beaker, Eye } from "lucide-react";
import Link from "next/link";

// --- TYPE DEFINITIONS ---
type Equipment = {
  _id: string;
  name: string;
  serialNo: string;
};

type Student = {
  regNo: string;
  name: string;
  department: string;
};

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

  const fetchIssuances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/issuances');
      if (!response.ok) {
        throw new Error('Failed to fetch issuance records.');
      }
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
      const response = await fetch('/api/issuances/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuanceId }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to process return.');
      }
      await fetchIssuances();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReturningId(null);
    }
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
                    Issued on: {new Date(issuance.issuanceDate).toLocaleString()}
                  </p>
                </div>
                <Badge variant={issuance.status === 'Active' ? 'default' : 'secondary'} className={issuance.status === 'Active' ? 'bg-blue-600' : ''}>
                  {issuance.status === 'Active' ? <Beaker className="w-3 h-3 mr-1.5"/> : <CheckCircle className="w-3 h-3 mr-1.5"/>}
                  {issuance.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><User className="w-4 h-4"/>Student Details</h4>
                  {issuance.studentDetails ? (
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {issuance.studentDetails.name}</p>
                      <p><strong>Reg No:</strong> {issuance.studentDetails.regNo}</p>
                      <p><strong>Department:</strong> {issuance.studentDetails.department}</p>
                    </div>
                  ) : <p className="text-sm text-gray-500">Student details not found.</p>}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><BookText className="w-4 h-4"/>Issued Equipment</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {issuance.equipmentDetails.map(eq => (
                      <li key={eq._id}>
                        {eq.name} ({eq.serialNo})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-end items-center gap-3">
                <Link href={`/instructor/issuances/${issuance._id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
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
    </DashboardLayout>
  );
};

export default IssuancesPage;

