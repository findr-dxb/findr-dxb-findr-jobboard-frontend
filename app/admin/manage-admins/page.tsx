"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2, RefreshCw, Users, Shield, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://findr-jobboard-backend-production.up.railway.app/api/v1'

interface Admin {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/admins`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch admins")
      }

      setAdmins(result.data || [])
    } catch (error: any) {
      console.error("Error fetching admins:", error)
      toast({
        title: "Failed to Load Admins",
        description: error.message || "An error occurred while fetching admin accounts.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeletingId(id)
      const response = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete admin")
      }

      toast({
        title: "Admin Deleted",
        description: `Admin account for ${name} has been deleted successfully.`,
      })

      // Refresh the list
      fetchAdmins()
    } catch (error: any) {
      toast({
        title: "Failed to Delete Admin",
        description: error.message || "An error occurred while deleting the admin account.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            Manage Admin Accounts
          </h1>
          <p className="text-gray-600 mt-2">View and manage all admin accounts in the system</p>
        </div>
        <Button
          onClick={fetchAdmins}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Accounts ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No admin accounts found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first admin account to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{admin.email}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            admin.role === "superadmin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {admin.role === "superadmin" && <Star className="w-3 h-3" />}
                          {admin.role === "admin" && <Shield className="w-3 h-3" />}
                          {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end items-center gap-2">
                          {admins.length === 1 ? (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Lock className="w-4 h-4" />
                              <span className="text-xs text-gray-500">Protected</span>
                            </div>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deletingId === admin._id}
                                >
                                  {deletingId === admin._id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the admin account for{" "}
                                    <strong>{admin.name}</strong> ({admin.email})? This action cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(admin._id, admin.name)}
                                    disabled={deletingId === admin._id}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deletingId === admin._id ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
