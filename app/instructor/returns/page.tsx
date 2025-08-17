"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useEffect } from "react";

function isOverdue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  return now > due;
}

export default function ReturnsPage() {
  const [pendingReturns, setPendingReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/issuance?status=Issued,Overdue");
        if (!res.ok) throw new Error("Failed to fetch pending returns");
        let data = await res.json();
        // Add isOverdue property
        data = data.map((item: any) => ({
          ...item,
          isOverdue: isOverdue(item.dueDate),
        }));
        setPendingReturns(data);
      } catch (err: any) {
        setError(err.message || "Error fetching pending returns");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleProcessReturn = (id: string) => {
    setSelectedReturn(id);
    setReturnCondition("");
    setNotes("");
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleSubmitReturn = async () => {
    if (!returnCondition) return;
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const res = await fetch("/api/issuance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReturn,
          status: returnCondition === "good" ? "Returned" : "Damaged",
          returnCondition,
          notes,
          returnDate: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to process return");
      setSubmitSuccess(true);
      // Remove from pending list
      setPendingReturns((prev) => prev.filter((r) => r._id !== selectedReturn));
      setSelectedReturn(null);
      setReturnCondition("");
      setNotes("");
    } catch (err: any) {
      setSubmitError(err.message || "Error processing return");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredReturns = pendingReturns.filter(
    (item) =>
      item.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.experiment + "").includes(searchTerm)
  );

  return (
    <DashboardLayout
      userRole="instructor"
      title="Process Returns"
      subtitle="Manage equipment returns and update inventory status"
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Returns List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pending Returns
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredReturns.length} items awaiting return
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-12 text-center text-gray-500">
                    Loading pending returns...
                  </div>
                ) : error ? (
                  <div className="p-12 text-center text-red-500">{error}</div>
                ) : filteredReturns.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending returns found</p>
                  </div>
                ) : (
                  filteredReturns.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.student}
                            </h4>
                            {item.isOverdue && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Batch: {item.batch}</p>
                            <p>Equipment: {item.equipment}</p>
                            <p>Experiment: #{item.experiment}</p>
                            <p>Due: {item.dueDate}</p>
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            handleProcessReturn(item._id || item.id)
                          }
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Process Return
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Return Processing Form */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Process Return
              </h3>

              {selectedReturn ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Processing return for:{" "}
                      {
                        pendingReturns.find((r) => r._id === selectedReturn)
                          ?.student
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Condition*
                    </label>
                    <Select
                      value={returnCondition}
                      onValueChange={setReturnCondition}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good Condition</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="missing">Missing Items</SelectItem>
                        <SelectItem value="needs-cleaning">
                          Needs Cleaning
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about the return..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <Button
                      onClick={handleSubmitReturn}
                      disabled={!returnCondition || submitLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {submitLoading ? "Processing..." : "Complete Return"}
                    </Button>
                    <Button
                      onClick={() => setSelectedReturn(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    {submitError && (
                      <span className="text-red-500 ml-2">{submitError}</span>
                    )}
                    {submitSuccess && (
                      <span className="text-green-600 ml-2">
                        Return processed!
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Select an item from the list to process its return
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
