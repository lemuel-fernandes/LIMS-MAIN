"use client";

import type React from "react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

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

// --- Helper Types for File Upload ---
interface UploadSuccessResponse {
  message: string;
  totalRows: number;
}
interface UploadErrorResponse {
  message: string;
}

export default function AddEquipmentPage() {
  const router = useRouter();

  // --- STATE FOR MANUAL FORM (UPDATED) ---
  const [formData, setFormData] = useState({
    name: "",
    serialNo: "",
    purchaseDate: "",
    labLocation: "",
    quantity: "",
    condition: "",
    status: "Available", // ADDED: Status now defaults to "Available"
  });

  // --- STATE FOR FILE UPLOAD ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  // --- HANDLERS FOR MANUAL FORM ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // NOTE: This API endpoint should handle manual single-entry
      const res = await fetch("/incharge/equipment/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // The formData now includes the status
      });
      if (res.ok) {
        alert("Equipment added successfully!");
        router.refresh(); 
        router.push("/incharge/dashboard");
      } else {
        alert("Failed to add equipment. Please try again.");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- HANDLERS FOR FILE UPLOAD ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadMessage("");
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadMessage("Please select a file first.");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setUploadMessage("");
    setIsError(false);

    const fileFormData = new FormData();
    fileFormData.append("file", selectedFile);

    try {
      // The backend API at this endpoint will automatically set status to "Available" for each row
      const response = await fetch("/api/equipments/upload", {
        method: "POST",
        body: fileFormData,
      });

      const result: UploadSuccessResponse | UploadErrorResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(result.message || "An unknown error occurred.");
      }

      setUploadMessage((result as UploadSuccessResponse).message);
      router.refresh(); 
      setIsError(false);
      setSelectedFile(null); // Clear the file input
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadMessage(
        error.message || "Failed to upload file. Please try again.",
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      userRole="incharge"
      title="Add Equipment"
      subtitle="Enter details manually or upload an Excel file"
    >
      <div className="max-w-2xl">
        {/* --- MANUAL ENTRY FORM --- */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Enter Equipment Details Manually
          </h3>
          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* ... Your existing input fields are here ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name*
              </label>
              <Input
                type="text"
                placeholder="Enter Equipment Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial No*
              </label>
              <Input
                type="text"
                placeholder="Enter Serial No"
                value={formData.serialNo}
                onChange={(e) => handleInputChange("serialNo", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date*
              </label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  handleInputChange("purchaseDate", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Location*
              </label>
              <Input
                type="text"
                placeholder="Enter Lab Location"
                value={formData.labLocation}
                onChange={(e) =>
                  handleInputChange("labLocation", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Quantity*
              </label>
              <Input
                type="number"
                placeholder="Enter Quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition*
              </label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleInputChange("condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="maintenance">Needs Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save and Update Equipment Stock
              </Button>
            </div>
          </form>
        </div>

        {/* --- DIVIDER --- */}
        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 flex-shrink text-gray-500 font-semibold">
            OR
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* --- FILE UPLOAD FORM --- */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload from Excel File
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Select an .xlsx or .xls file. Status for all items will be set to "Available".
          </p>
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedFile
                      ? `Selected: ${selectedFile.name}`
                      : "XLSX, XLS files only"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "Uploading..." : "Upload File and Update Stock"}
            </Button>
          </form>
          {uploadMessage && (
            <div
              className={`text-center p-4 mt-4 rounded-md text-sm ${
                isError
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {uploadMessage}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

