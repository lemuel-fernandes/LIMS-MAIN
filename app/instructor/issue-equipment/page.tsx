"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useEffect } from "react";

export default function IssueEquipmentPage() {
  const [studentData, setStudentData] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  const [formData, setFormData] = useState({
    class: "",
    batch: "",
    team: "",
    experiment: "",
    equipmentList: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<{
    [key: string]: boolean;
  }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch students from DB
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudentData(data);
        setStudentsError("");
      } catch (err: any) {
        setStudentsError(err.message || "Error fetching students");
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleAttendanceChange = (studentId: string, checked: boolean) => {
    setStudentAttendance((prev) => ({ ...prev, [studentId]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = studentData.map((student) => student._id);
      setSelectedStudents(allIds);
      const allAttendance = studentData.reduce((acc, student) => {
        acc[student._id] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setStudentAttendance(allAttendance);
    } else {
      setSelectedStudents([]);
      setStudentAttendance({});
    }
  };

  const handleIssueEquipment = async () => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess(false);
    const issuanceData = {
      ...formData,
      selectedStudents,
      attendance: studentAttendance,
      issueDate: new Date().toISOString(),
      issueId: `#${Math.floor(Math.random() * 10000)}`,
    };
    try {
      const res = await fetch("/api/issuance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issuanceData),
      });
      if (!res.ok) throw new Error("Failed to issue equipment");
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Error issuing equipment");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <DashboardLayout
      userRole="instructor"
      title="Issue Equipment"
      subtitle="Issue laboratory equipment to students for experiments"
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

          <div className="text-sm text-gray-600">
            New Issue - #{Math.floor(Math.random() * 10000)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selection Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selection Criteria
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class*
                </label>
                <Select
                  value={formData.class}
                  onValueChange={(value) => handleInputChange("class", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18tech">18 TECH</SelectItem>
                    <SelectItem value="19tech">19 TECH</SelectItem>
                    <SelectItem value="20tech">20 TECH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch*
                </label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleInputChange("batch", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g1">G-1</SelectItem>
                    <SelectItem value="g2">G-2</SelectItem>
                    <SelectItem value="g3">G-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team*
                </label>
                <Select
                  value={formData.team}
                  onValueChange={(value) => handleInputChange("team", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">Team 1</SelectItem>
                    <SelectItem value="team2">Team 2</SelectItem>
                    <SelectItem value="team3">Team 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Experiment*
                </label>
                <Select
                  value={formData.experiment}
                  onValueChange={(value) =>
                    handleInputChange("experiment", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exp1">
                      Experiment 1 - Basic Circuits
                    </SelectItem>
                    <SelectItem value="exp2">
                      Experiment 2 - Ohm's Law
                    </SelectItem>
                    <SelectItem value="exp3">
                      Experiment 3 - Series Circuits
                    </SelectItem>
                    <SelectItem value="exp4">
                      Experiment 4 - Parallel Circuits
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Issued
                </label>
                <Textarea
                  value={formData.equipmentList}
                  onChange={(e) =>
                    handleInputChange("equipmentList", e.target.value)
                  }
                  placeholder="10 Wires, 2 Bulbs, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Student Selection
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStudents.length} of {studentData.length} students
                      selected
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Class: 18TECH G-1-3
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Today</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <Checkbox
                          checked={
                            selectedStudents.length === studentData.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Register No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class-Batch-Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipment No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentData.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) =>
                              handleStudentSelect(
                                student.id,
                                checked as boolean
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.regNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.issueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.classBatch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.equipmentNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={studentAttendance[student.id] || false}
                            onCheckedChange={(checked) =>
                              handleAttendanceChange(
                                student.id,
                                checked as boolean
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Selected: {selectedStudents.length} students | Present:{" "}
                    {Object.values(studentAttendance).filter(Boolean).length}{" "}
                    students
                  </div>
                  <Button
                    onClick={handleIssueEquipment}
                    disabled={
                      selectedStudents.length === 0 ||
                      !formData.experiment ||
                      submitLoading
                    }
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    {submitLoading ? "Issuing..." : "Issue Equipment"}
                  </Button>
                  {submitError && (
                    <span className="text-red-500 ml-4">{submitError}</span>
                  )}
                  {submitSuccess && (
                    <span className="text-green-600 ml-4">
                      Equipment issued!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Issuance Summary</h4>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Students Selected: {selectedStudents.length}</p>
              <p>
                Present Students:{" "}
                {Object.values(studentAttendance).filter(Boolean).length}
              </p>
              <p>Experiment: {formData.experiment || "Not selected"}</p>
              <p>Equipment: {formData.equipmentList || "Not specified"}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
