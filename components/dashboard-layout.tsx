"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { AuthGuard } from "./auth-guard"
import { Search } from "lucide-react"
import { Input } from "./ui/input"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "incharge" | "instructor"
  title: string
  subtitle?: string
}

export function DashboardLayout({ children, userRole, title, subtitle }: DashboardLayoutProps) {
  return (
    <AuthGuard allowedRoles={[userRole]}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar userRole={userRole} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Hello Linu Lonappan,</h1>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{title}</h2>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input type="text" placeholder="Search" className="pl-10 w-64 bg-gray-50 border-gray-200" />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
