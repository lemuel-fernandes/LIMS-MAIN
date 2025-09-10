"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Mail,
  Building,
  Calendar,
} from "lucide-react";

type UserProfile = {
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  avatarUrl: string;
};

// A helper function to safely format dates
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        return "Invalid Date";
    }
};

// A simple loading skeleton component
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-6 mb-8">
      <div className="w-32 h-32 rounded-full bg-gray-300"></div>
      <div className="space-y-3">
        <div className="h-6 w-48 bg-gray-300 rounded"></div>
        <div className="h-4 w-64 bg-gray-300 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-12 bg-gray-300 rounded"></div>
      <div className="h-12 bg-gray-300 rounded"></div>
      <div className="h-12 bg-gray-300 rounded"></div>
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        setError("No user email found in session. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/incharge/profile/api?email=${encodeURIComponent(userEmail)}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <DashboardLayout
      userRole="incharge"
      title="User Profile"
      subtitle="Manage your personal information and application settings"
    >
      <div className="max-w-4xl mx-auto">
        {loading && <ProfileSkeleton />}
        {error && (
          <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
            <p>Error: {error}</p>
          </div>
        )}
        {!loading && !error && userProfile && (
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <img
                src={userProfile.avatarUrl}
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-100 object-cover"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {userProfile.name}
                </h2>
                <p className="text-md text-gray-500">{userProfile.email}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">
                      {userProfile.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-800">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium text-gray-800">
                      {userProfile.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Join Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(userProfile.joinDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <p>Change Password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <p>Notification Settings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="border-t pt-6 text-center">
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => {
                  localStorage.removeItem("userEmail");
                  window.location.href = "/login"; // Adjust path if needed
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
