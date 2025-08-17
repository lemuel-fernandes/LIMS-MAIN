"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FlaskRoundIcon as Flask } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [signupMode, setSignupMode] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }
      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "incharge") {
        router.push("/incharge/dashboard");
      } else {
        router.push("/instructor/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
          designation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      setSuccess("Signup successful! You can now log in.");
      setSignupMode(false);
      setEmail("");
      setPassword("");
      setDesignation("");
      setSelectedRole("");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setDesignation(role === "incharge" ? "Lab InCharge" : "Lab Instructor");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {/* <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Flask className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LIMS</span>
          </div>

          <nav className="space-y-2">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
              <span className="text-sm">Dashboard</span>
            </div>
            <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4"></div>
              <span className="text-sm">Departments</span>
            </div>
            <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4"></div>
              <span className="text-sm">Settings</span>
            </div>
            <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4"></div>
              <span className="text-sm">Statistics</span>
            </div>
            <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4"></div>
              <span className="text-sm">Profile</span>
            </div>
            <div className="px-4 py-2 text-gray-600 flex items-center gap-2">
              <div className="w-4 h-4"></div>
              <span className="text-sm">Report</span>
            </div>
          </nav>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {signupMode ? "Sign Up" : "Login"}
            </h1>
            <p className="text-gray-600">
              {signupMode
                ? "Create a new account to access LIMS."
                : "Welcome back! Please Login to your account"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder={
                  signupMode ? "Create a password" : "Enter Your Password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100"
              />
            </div>

            {signupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation (optional)
                </label>
                <Input
                  type="text"
                  placeholder="Lab InCharge or Lab Instructor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="bg-gray-100"
                />
              </div>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div className="flex gap-2">
              <Button
                variant={selectedRole === "incharge" ? "default" : "outline"}
                onClick={() => handleRoleSelect("incharge")}
                className={`flex-1 ${
                  selectedRole === "incharge"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
              >
                Lab InCharge
              </Button>
              <Button
                variant={selectedRole === "instructor" ? "default" : "outline"}
                onClick={() => handleRoleSelect("instructor")}
                className={`flex-1 ${
                  selectedRole === "instructor"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
              >
                Lab Instructor
              </Button>
            </div>

            <Button
              onClick={signupMode ? handleSignup : handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {signupMode ? "Sign Up" : "Log In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm mt-2"
                onClick={() => {
                  setSignupMode((m) => !m);
                  setError("");
                  setSuccess("");
                }}
              >
                {signupMode
                  ? "Already have an account? Log in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
