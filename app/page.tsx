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
        let errorMessage = "Login failed. Please check your credentials.";
        try {
            const data = await res.json();
            errorMessage = data.error || errorMessage;
        } catch (e) {
            errorMessage = `Login failed: Server responded with status ${res.status}.`;
        }
        setError(errorMessage);
        return;
      }

      // FIX: Wrap the successful response parsing in a try...catch
      // This handles cases where the server returns 200 OK but an invalid JSON body.
      try {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email); 

        if (user.role === "incharge") {
          router.push("/incharge/dashboard");
        } else {
          router.push("/instructor/dashboard");
        }
      } catch (e) {
        setError("Received an invalid response from the server. Please try again.");
      }

    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
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

      if (!res.ok) {
        let errorMessage = "Signup failed. Please try again.";
        try {
            const data = await res.json();
            errorMessage = data.error || errorMessage;
        } catch (e) {
            errorMessage = `Signup failed: Server responded with status ${res.status}.`;
        }
        setError(errorMessage);
        return;
      }
      
      setSuccess("Signup successful! You can now log in.");
      setSignupMode(false);
      setEmail("");
      setPassword("");
      setDesignation("");
      setSelectedRole("");
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setDesignation(role === "incharge" ? "Lab InCharge" : "Lab Instructor");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
             <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Flask className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">LIMS</span>
             </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {signupMode ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-600 text-sm">
              {signupMode
                ? "Create a new account to access the Lab Inventory Management System."
                : "Please login to your account to continue."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
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
                  Designation
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Lab InCharge or Lab Instructor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="bg-gray-100"
                />
              </div>
            )}

            {error && <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-md">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium p-3 bg-green-50 rounded-md">{success}</div>}

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

