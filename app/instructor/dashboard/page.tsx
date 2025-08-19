"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Search, Plus, Eye, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function InstructorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [issuanceData, setIssuanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssuances = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/issuance");
        if (!res.ok) throw new Error("Failed to fetch issuance data");
        const data = await res.json();
        setIssuanceData(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchIssuances();
  }, []);

  const handleReturn = (id: number) => {
    console.log("Processing return for issuance:", id);
  };

  const filteredData = issuanceData.filter((item) => {
    const matchesSearch =
      item.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.experiment + "").includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || item.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats calculations
  const totalIssued = issuanceData.length;
  const returned = issuanceData.filter(
    (i) => i.status?.toLowerCase() === "returned"
  ).length;
  const overdue = issuanceData.filter(
    (i) => i.status?.toLowerCase() === "overdue"
  ).length;
  const damaged = issuanceData.filter(
    (i) => i.status?.toLowerCase() === "damaged"
  ).length;
  const returnRate = totalIssued
    ? Math.round((returned / totalIssued) * 100)
    : 0;
  const damageRate = totalIssued
    ? Math.round((damaged / totalIssued) * 100)
    : 0;

  return (
    <DashboardLayout
      userRole="instructor"
      title="Dashboard Overview"
      subtitle="Monitor equipment issuance and manage student returns"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Issued</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalIssued}
                </p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <span>↗</span> Active this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Returned</p>
                <p className="text-3xl font-bold text-gray-900">{returned}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <span>↗</span> {returnRate}% return rate
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900">{overdue}</p>
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Needs attention
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Damaged</p>
                <p className="text-3xl font-bold text-gray-900">{damaged}</p>
                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                  <span>↘</span> {damageRate}% damage rate
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Issuance List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Equipment Issuance List
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  Active Usage & Returns
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search student, batch, or experiment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="issued">Issued</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.student}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.batch}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{item.experiment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === "Returned"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Issued"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Link href={`/instructor/issuance/${item.id}`}>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        {(item.status === "Issued" ||
                          item.status === "Overdue") && (
                          <button
                            onClick={() => handleReturn(item.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Process Return"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {filteredData.length} of {issuanceData.length} entries
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm border rounded">‹</button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm border rounded">2</button>
                <button className="px-3 py-1 text-sm border rounded">3</button>
                <button className="px-3 py-1 text-sm border rounded">›</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/instructor/issue-equipment">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 h-12">
              <Plus className="w-5 h-5" />
              Issue New Equipment
            </Button>
          </Link>

          <Link href="/instructor/returns">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12 bg-transparent"
            >
              <RotateCcw className="w-5 h-5" />
              Process Returns
            </Button>
          </Link>

          <Link href="/instructor/overdue">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <AlertTriangle className="w-5 h-5" />
              View Overdue Items
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : issuanceData.length === 0 ? (
              <div className="text-gray-500">No recent activity.</div>
            ) : (
              issuanceData
                .slice()
                .sort((a, b) => {
                  // Sort by most recent (assuming a.date is ISO or yyyy-mm-dd)
                  return (
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                })
                .slice(0, 6)
                .map((item, idx) => {
                  let color = "bg-blue-500";
                  let msg = `New equipment issued to ${item.student}`;
                  if (item.status?.toLowerCase() === "returned") {
                    color = "bg-green-500";
                    msg = `${item.student} returned equipment for Experiment #${item.experiment}`;
                  } else if (item.status?.toLowerCase() === "overdue") {
                    color = "bg-red-500";
                    msg = `Equipment overdue from ${item.student}`;
                  } else if (item.status?.toLowerCase() === "damaged") {
                    color = "bg-orange-500";
                    msg = `Damaged equipment reported by ${item.student}`;
                  }
                  return (
                    <div
                      key={item._id || idx}
                      className={`flex items-center justify-between py-2 ${
                        idx < 5 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${color}`}></div>
                        <span className="text-sm text-gray-900">{msg}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.date || "-"}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
