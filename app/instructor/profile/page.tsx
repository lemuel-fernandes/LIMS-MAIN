"use client";

import { useEffect, useState, FormEvent } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Mail,
  Building,
  Calendar,
} from "lucide-react";

// --- Type Definitions ---
type NotificationSettings = {
  emailOnNewIssuance: boolean;
  emailOnReturn: boolean;
  emailOnLowStock: boolean;
};

type UserProfile = {
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  avatarUrl: string;
  notificationSettings?: NotificationSettings;
};

// --- Helper Components ---
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-6 mb-8"><div className="w-32 h-32 rounded-full bg-gray-300"></div><div className="space-y-3"><div className="h-6 w-48 bg-gray-300 rounded"></div><div className="h-4 w-64 bg-gray-300 rounded"></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="h-12 bg-gray-300 rounded"></div><div className="h-12 bg-gray-300 rounded"></div><div className="h-12 bg-gray-300 rounded"></div><div className="h-12 bg-gray-300 rounded"></div></div>
  </div>
);

export default function InstructorProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for Dialogs ---
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // State for Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailOnNewIssuance: true, emailOnReturn: true, emailOnLowStock: false,
  });
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setError("No user email found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/instructor/profile/api?email=${encodeURIComponent(userEmail)}`);
        if (!response.ok) throw new Error((await response.json()).message || "Failed to fetch profile");
        const data: UserProfile = await response.json();
        setUserProfile(data);
        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/instructor/profile/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile?.email, currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPasswordMessage({ type: "success", text: result.message });
      setTimeout(() => {
        setPasswordOpen(false);
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        setPasswordMessage({ type: "", text: "" });
      }, 2000);
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    if (!userProfile) return;
    setIsSubmitting(true);
    setNotificationMessage("");
    try {
        const response = await fetch('/instructor/profile/api', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userProfile.email, settings: notificationSettings }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setNotificationMessage("Settings saved successfully!");
        setTimeout(() => {
            setNotificationsOpen(false);
            setNotificationMessage("");
        }, 1500);
    } catch (err: any) {
        setNotificationMessage(err.message || "Failed to save settings.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userRole="instructor" title="User Profile" subtitle="Manage your personal information and application settings">
      <div className="max-w-4xl mx-auto">
        {loading && <ProfileSkeleton />}
        {error && <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg"><p>Error: {error}</p></div>}
        {!loading && !error && userProfile && (
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <img src={userProfile.avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-purple-100 object-cover" />
              <div><h2 className="text-3xl font-bold text-gray-900">{userProfile.name}</h2><p className="text-md text-gray-500">{userProfile.email}</p></div>
            </div>
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3"><User className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500">Full Name</p><p className="font-medium text-gray-800">{userProfile.name}</p></div></div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500">Email Address</p><p className="font-medium text-gray-800">{userProfile.email}</p></div></div>
                <div className="flex items-center gap-3"><Building className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500">Department</p><p className="font-medium text-gray-800">{userProfile.department}</p></div></div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-gray-500">Join Date</p><p className="font-medium text-gray-800">{new Date(userProfile.joinDate).toLocaleDateString()}</p></div></div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <DialogTrigger asChild><div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"><div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-blue-500" /><p>Change Password</p></div><Button variant="outline" size="sm">Change</Button></div></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Change Your Password</DialogTitle><DialogDescription>Enter your current password and a new password below.</DialogDescription></DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
                      <div><label className="text-sm font-medium">Current Password</label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
                      <div><label className="text-sm font-medium">New Password</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                      <div><label className="text-sm font-medium">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
                      {passwordMessage.text && <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{passwordMessage.text}</p>}
                      <DialogFooter><Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Updating..." : "Update Password"}</Button></DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DialogTrigger asChild><div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-blue-500" /><p>Notification Settings</p></div><Button variant="outline" size="sm">Manage</Button></div></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Manage Notifications</DialogTitle><DialogDescription>Choose how you receive updates about lab activities.</DialogDescription></DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between"><Label htmlFor="issuance-email" className="flex flex-col gap-1"><span>New Issuances</span><span className="font-normal text-xs text-gray-500">Get an email when equipment is issued.</span></Label><Switch id="issuance-email" checked={notificationSettings.emailOnNewIssuance} onCheckedChange={(checked) => setNotificationSettings(s => ({...s, emailOnNewIssuance: checked}))} /></div>
                      <div className="flex items-center justify-between"><Label htmlFor="return-email" className="flex flex-col gap-1"><span>Equipment Returns</span><span className="font-normal text-xs text-gray-500">Get an email when equipment is returned.</span></Label><Switch id="return-email" checked={notificationSettings.emailOnReturn} onCheckedChange={(checked) => setNotificationSettings(s => ({...s, emailOnReturn: checked}))} /></div>
                      <div className="flex items-center justify-between"><Label htmlFor="low-stock-email" className="flex flex-col gap-1"><span>Low Stock Alerts</span><span className="font-normal text-xs text-gray-500">Get an email when stock is low.</span></Label><Switch id="low-stock-email" checked={notificationSettings.emailOnLowStock} onCheckedChange={(checked) => setNotificationSettings(s => ({...s, emailOnLowStock: checked}))} /></div>
                    </div>
                    {notificationMessage && <p className="text-sm text-center text-green-600 pt-2">{notificationMessage}</p>}
                    <DialogFooter><Button onClick={handleSaveNotifications} disabled={isSubmitting} className="w-full">{isSubmitting ? "Saving..." : "Save Preferences"}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="border-t pt-6 text-center">
              <Button variant="destructive" className="w-full sm:w-auto" onClick={() => { localStorage.removeItem("userEmail"); window.location.href = "/login"; }}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

