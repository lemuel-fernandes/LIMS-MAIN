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
import { ArrowLeft, Users, Calendar, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function IssueEquipmentPage() {
  // State for students
  const [studentData, setStudentData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  // State for experiments and equipment
  const [experiments, setExperiments] = useState([]);
  const [experimentEquipment, setExperimentEquipment] = useState([]);
  const [experimentsLoading, setExperimentsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    class: "",
    batch: "",
    team: "",
    experiment: "",
    equipmentList: "",
    notes: "",
  });

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({});
  
  // Submit state
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate unique issue ID
  const [issueId] = useState(`#ISS${Date.now().toString().slice(-6)}`);

  // Fetch students from database
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudentData(data);
        setStudentsError("");
      } catch (err) {
        setStudentsError(err.message || "Error fetching students");
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch experiments and their equipment
  useEffect(() => {
    const fetchExperiments = async () => {
      setExperimentsLoading(true);
      try {
        const res = await fetch("/api/experiments");
        if (!res.ok) throw new Error("Failed to fetch experiments");
        const data = await res.json();
        setExperiments(data);
      } catch (err) {
        console.error("Error fetching experiments:", err);
      } finally {
        setExperimentsLoading(false);
      }
    };
    fetchExperiments();
  }, []);

  // Filter students based on class, batch, and team selection
  useEffect(() => {
    let filtered = studentData;
    
    if (formData.class) {
      filtered = filtered.filter(student => student.class === formData.class);
    }
    
    if (formData.batch) {
      filtered = filtered.filter(student => student.batch === formData.batch);
    }
    
    if (formData.team) {
      filtered = filtered.filter(student => student.team === formData.team);
    }
    
    setFilteredStudents(filtered);
    
    // Reset selections when filters change
    setSelectedStudents([]);
    setStudentAttendance({});
  }, [formData.class, formData.batch, formData.team, studentData]);

  // Fetch equipment when experiment is selected
  useEffect(() => {
    const fetchExperimentEquipment = async () => {
      if (!formData.experiment) {
        setExperimentEquipment([]);
        setSelectedEquipment([]);
        return;
      }

      try {
        const res = await fetch(`/api/experiments/${formData.experiment}/equipment`);
        if (!res.ok) throw new Error("Failed to fetch equipment");
        const data = await res.json();
        setExperimentEquipment(data);
        setSelectedEquipment([]);
      } catch (err) {
        console.error("Error fetching experiment equipment:", err);
        setExperimentEquipment([]);
      }
    };

    fetchExperimentEquipment();
  }, [formData.experiment]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Reset dependent fields when parent changes
    if (field === "class") {
      setFormData(prev => ({ ...prev, batch: "", team: "" }));
    } else if (field === "batch") {
      setFormData(prev => ({ ...prev, team: "" }));
    }
  };

  const handleStudentSelect = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleAttendanceChange = (studentId, checked) => {
    setStudentAttendance((prev) => ({ ...prev, [studentId]: checked }));
  };

  const handleEquipmentSelect = (equipmentId, checked) => {
    if (checked) {
      setSelectedEquipment([...selectedEquipment, equipmentId]);
    } else {
      setSelectedEquipment(selectedEquipment.filter((id) => id !== equipmentId));
    }
  };

  const handleSelectAllStudents = (checked) => {
    if (checked) {
      const allIds = filteredStudents.map((student) => student._id);
      setSelectedStudents(allIds);
      const allAttendance = filteredStudents.reduce((acc, student) => {
        acc[student._id] = true;
        return acc;
      }, {});
      setStudentAttendance(allAttendance);
    } else {
      setSelectedStudents([]);
      setStudentAttendance({});
    }
  };

  const handleSelectAllEquipment = (checked) => {
    if (checked) {
      const allIds = experimentEquipment.map((equipment) => equipment._id);
      setSelectedEquipment(allIds);
    } else {
      setSelectedEquipment([]);
    }
  };

  const handleIssueEquipment = async () => {
    // Validation
    if (!formData.class || !formData.batch || !formData.experiment) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    if (selectedStudents.length === 0) {
      setSubmitError("Please select at least one student");
      return;
    }

    if (selectedEquipment.length === 0) {
      setSubmitError("Please select at least one equipment item");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const issuanceData = {
      issueId,
      class: formData.class,
      batch: formData.batch,
      team: formData.team,
      experiment: formData.experiment,
      selectedStudents,
      selectedEquipment,
      attendance: studentAttendance,
      notes: formData.notes,
      issueDate: new Date().toISOString(),
      status: "issued",
      issuedBy: "instructor", // Get from auth context
    };

    try {
      const res = await fetch("/api/equipment-issuance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issuanceData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to issue equipment");
      }

      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          class: "",
          batch: "",
          team: "",
          experiment: "",
          equipmentList: "",
          notes: "",
        });
        setSelectedStudents([]);
        setSelectedEquipment([]);
        setStudentAttendance({});
        setSubmitSuccess(false);
      }, 3000);

    } catch (err) {
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
            New Issue - {issueId}
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
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1BTPHY-H">1BTPHY H</SelectItem>
                    <SelectItem value="1BTPHY-I">1BTPHY I</SelectItem>
                    <SelectItem value="1BTPHY-J">1BTPHY J</SelectItem>
                    <SelectItem value="1BTPHY-K">1BTPHY K</SelectItem>
                    <SelectItem value="1BTPHY-L">1BTPHY L</SelectItem>
                    <SelectItem value="1BTPHY-M">1BTPHY M</SelectItem>
                    <SelectItem value="1BTPHY-N">1BTPHY N</SelectItem>
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
                  disabled={!formData.class}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.class && (
                      <>
                        <SelectItem value={`${formData.class.split('-')[1]}-1`}>
                          {formData.class.split('-')[1]}-1
                        </SelectItem>
                        <SelectItem value={`${formData.class.split('-')[1]}-2`}>
                          {formData.class.split('-')[1]}-2
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team
                </label>
                <Select
                  value={formData.team}
                  onValueChange={(value) => handleInputChange("team", value)}
                  disabled={!formData.batch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">Team 1</SelectItem>
                    <SelectItem value="team2">Team 2</SelectItem>
                    <SelectItem value="team3">Team 3</SelectItem>
                    <SelectItem value="team4">Team 4</SelectItem>
                    <SelectItem value="team5">Team 5</SelectItem>
                    <SelectItem value="team6">Team 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Experiment*
                </label>
                <Select
                  value={formData.experiment}
                  onValueChange={(value) => handleInputChange("experiment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Experiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {experimentsLoading ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      experiments.map((exp) => (
                        <SelectItem key={exp._id} value={exp._id}>
                          {exp.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment Selection */}
              {experimentEquipment.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Equipment*
                  </label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                      <Checkbox
                        checked={selectedEquipment.length === experimentEquipment.length}
                        onCheckedChange={handleSelectAllEquipment}
                      />
                      <span className="text-sm font-medium">Select All</span>
                    </div>
                    {experimentEquipment.map((equipment) => (
                      <div key={equipment._id} className="flex items-center gap-2 py-1">
                        <Checkbox
                          checked={selectedEquipment.includes(equipment._id)}
                          onCheckedChange={(checked) =>
                            handleEquipmentSelect(equipment._id, checked)
                          }
                        />
                        <span className="text-sm">
                          {equipment.name} ({equipment.quantity} available)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special instructions or notes..."
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
                      {selectedStudents.length} of {filteredStudents.length} students selected
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.class && formData.batch 
                          ? `${formData.class} ${formData.batch}${formData.team ? ` ${formData.team}` : ''}`
                          : 'No selection'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {studentsError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">{studentsError}</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <Checkbox
                          checked={
                            filteredStudents.length > 0 && 
                            selectedStudents.length === filteredStudents.length
                          }
                          onCheckedChange={handleSelectAllStudents}
                          disabled={filteredStudents.length === 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Register No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          Loading students...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          {formData.class || formData.batch 
                            ? "No students found for the selected criteria" 
                            : "Please select class and batch to view students"
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selectedStudents.includes(student._id)}
                              onCheckedChange={(checked) =>
                                handleStudentSelect(student._id, checked)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.registerNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.class}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.batch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.team || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox
                              checked={studentAttendance[student._id] || false}
                              onCheckedChange={(checked) =>
                                handleAttendanceChange(student._id, checked)
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Selected: {selectedStudents.length} students | Present:{" "}
                    {Object.values(studentAttendance).filter(Boolean).length} students
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {submitError && (
                      <span className="text-red-500 text-sm">{submitError}</span>
                    )}
                    {submitSuccess && (
                      <span className="text-green-600 text-sm">
                        Equipment issued successfully!
                      </span>
                    )}
                    
                    <Button
                      onClick={handleIssueEquipment}
                      disabled={
                        selectedStudents.length === 0 ||
                        selectedEquipment.length === 0 ||
                        !formData.experiment ||
                        !formData.class ||
                        !formData.batch ||
                        submitLoading
                      }
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      {submitLoading ? "Issuing..." : "Issue Equipment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {(selectedStudents.length > 0 || selectedEquipment.length > 0) && (
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
              <p>Equipment Items: {selectedEquipment.length}</p>
              <p>Experiment: {experiments.find(exp => exp._id === formData.experiment)?.name || "Not selected"}</p>
              {formData.notes && <p>Notes: {formData.notes}</p>}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
