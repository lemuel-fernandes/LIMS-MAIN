"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, Phone, Mail, Calendar } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";

function calculateDaysOverdue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}

export default function OverduePage() {
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverdue = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/issuance?status=Overdue");
        if (!res.ok) throw new Error("Failed to fetch overdue items");
        let data = await res.json();
        // Add daysOverdue calculation if not present
        data = data.map((item: any) => ({
          ...item,
          daysOverdue: calculateDaysOverdue(item.dueDate),
        }));
        setOverdueItems(data);
      } catch (err: any) {
        setError(err.message || "Error fetching overdue items");
      } finally {
        setLoading(false);
      }
    };
    fetchOverdue();
  }, []);

  const handleSendReminder = (studentId: string, method: "email" | "phone") => {
    console.log(`Sending ${method} reminder to student ${studentId}`);
  };

  const handleMarkReturned = (id: string) => {
    console.log("Marking as returned:", id);
  };

  return (
    <DashboardLayout
      userRole="instructor"
      title="Overdue Equipment"
      subtitle="Manage overdue equipment and send reminders to students"
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

          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {loading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : error ? (
              <span className="text-sm text-red-600">{error}</span>
            ) : (
              <span className="text-sm font-medium text-red-600">
                {overdueItems.length} items overdue
              </span>
            )}
          </div>
        </div>

        {/* Overdue Items */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-gray-500">Loading overdue items...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : overdueItems.length === 0 ? (
            <div className="text-gray-500">No overdue items found.</div>
          ) : (
            overdueItems.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-red-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.student}
                      </h3>
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {item.daysOverdue} days overdue
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Batch
                        </p>
                        <p className="text-sm text-gray-900">{item.batch}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Equipment
                        </p>
                        <p className="text-sm text-gray-900">
                          {item.equipment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Experiment
                        </p>
                        <p className="text-sm text-gray-900">
                          #{item.experiment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Due Date
                        </p>
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {item.contact?.phone || "-"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {item.contact?.email || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      onClick={() =>
                        handleSendReminder(item._id || item.id, "email")
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </Button>
                    <Button
                      onClick={() =>
                        handleSendReminder(item._id || item.id, "phone")
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Student
                    </Button>
                    <Button
                      onClick={() => handleMarkReturned(item._id || item.id)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Mark Returned
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bulk Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Mail className="w-4 h-4" />
              Send Reminder to All
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <AlertTriangle className="w-4 h-4" />
              Generate Overdue Report
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Calendar className="w-4 h-4" />
              Schedule Follow-up
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
