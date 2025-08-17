"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Users,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IssuanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [issuance, setIssuance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssuance = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/issuance?id=${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch issuance record");
        const data = await res.json();
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setIssuance(null);
        } else if (Array.isArray(data)) {
          setIssuance(data[0]);
        } else {
          setIssuance(data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching issuance");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchIssuance();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout userRole="instructor" title="Loading..." subtitle="">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !issuance) {
    return (
      <DashboardLayout
        userRole="instructor"
        title="Issuance Not Found"
        subtitle=""
      >
        <div className="text-center py-12">
          <p className="text-gray-500">
            {error || "Issuance record not found"}
          </p>
          <Link href="/instructor/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returned":
        return "bg-green-100 text-green-800";
      case "Issued":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Damaged":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Returned":
        return <CheckCircle className="w-4 h-4" />;
      case "Overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout
      userRole="instructor"
      title={`Issuance ${issuance.issueNumber}`}
      subtitle={`${issuance.student} - Experiment #${issuance.experiment}`}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/instructor/dashboard">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Badge
              className={`flex items-center gap-1 ${getStatusColor(
                issuance.status
              )}`}
            >
              {getStatusIcon(issuance.status)}
              {issuance.status}
            </Badge>
            {issuance.status === "Issued" && (
              <Button className="bg-green-600 hover:bg-green-700">
                Process Return
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issuance Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Issuance Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Issue Number
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {issuance.issueNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Student Name
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {issuance.student}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Batch
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{issuance.batch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Experiment
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    #{issuance.experiment}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Issue Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {issuance.issueDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Due Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {issuance.dueDate}
                  </p>
                </div>
                {issuance.returnDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Return Date
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {issuance.returnDate}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Issued By
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {issuance.instructor}
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Equipment Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Equipment Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Condition
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {issuance.equipmentDetails.map((item: any, index: any) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              item.condition === "Good"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.condition}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {issuance.notes && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notes
                </h3>
                <p className="text-sm text-gray-700">{issuance.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Issue Date
                    </p>
                    <p className="text-sm text-gray-600">
                      {issuance.issueDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Student</p>
                    <p className="text-sm text-gray-600">{issuance.student}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Equipment
                    </p>
                    <p className="text-sm text-gray-600">
                      {issuance.equipment}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {issuance.status === "Issued" && (
                  <>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Process Return
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Send Reminder
                    </Button>
                  </>
                )}
                <Button variant="outline" className="w-full bg-transparent">
                  Print Details
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Equipment Issued
                    </p>
                    <p className="text-sm text-gray-600">
                      {issuance.issueDate}
                    </p>
                  </div>
                </div>
                {issuance.returnDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Equipment Returned
                      </p>
                      <p className="text-sm text-gray-600">
                        {issuance.returnDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
