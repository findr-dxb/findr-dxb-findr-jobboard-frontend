"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, handleApiError } from "@/lib/api"
import axios from "axios"

type UserType = "jobseeker" | "employer" | "admin" | null

interface User {
  id: string
  email: string
  type: UserType
  name?: string
  profileImage?: string
  points?: number
  profileCompletion?: number
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, type: UserType) => Promise<boolean>
  signup: (data: { 
    email: string; 
    password: string; 
    role: string; 
    name?: string;
    phoneNumber?: string;
    designation?: string;
    [key: string]: any;
  }) => Promise<boolean>
  logout: (shouldRefresh?: boolean) => void
  isLoading: boolean
  error: string | null
  updateProfile: (data: any) => Promise<boolean>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken");
        const role = localStorage.getItem("findr_role") || localStorage.getItem("userRole");

        if (token && role) {
          if (role === 'admin') {
            setUser({
              id: "admin-id",
              email: "admin@findr.ae",
              type: "admin",
              name: "Admin User",
              profileImage: "/images/admin-hero.png",
              role: "admin"
            });
            setIsLoading(false);
            return;
          }

          const apiBase = process.env.NEXT_PUBLIC_API_URL;
          const endpoint = role === 'employer'
            ? `${apiBase}/employer/details`
            : `${apiBase}/profile/details`;

          const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const { data } = await res.json();
            const userData: User = {
              id: data._id,
              email: data.companyEmail || data.email || "",
              type: role as UserType,
              name: role === 'employer'
                ? (data.companyName || data.name || data.fullName || "")
                : (data.fullName || data.name || data.companyName || ""),
              profileImage: role === 'employer'
                ? (data.companyLogo || `/images/${role}-hero.png`)
                : (data.profilePicture || `/images/${role}-hero.png`),
              points: data.points || 0,
              profileCompletion: data.profileCompleted || 0,
              role: "user"
            };
            setUser(userData);
          } else {
            localStorage.removeItem("findr_token");
            localStorage.removeItem("findr_role");
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error in checkAuthState:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [])

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Handle admin login with real API
      if (type === "admin") {
        try {
          const response = await authApi.adminLogin(email, password)
          
          if (response.success && response.user) {
            const adminUser: User = {
              id: response.user.id,
              email: response.user.email,
              type: "admin",
              name: response.user.name || "Admin User",
              profileImage: "/images/admin-hero.png",
              role: response.user.role || "admin",
            }

            setUser(adminUser)
            localStorage.setItem("findr_token", response.token)
            localStorage.setItem("findr_role", "admin")
            
            return true
          } else {
            setError(response.message || "Invalid admin credentials")
            return false
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to login as admin"
          setError(errorMessage)
          return false
        }
      }
      
      // Regular login for jobseeker/employer
      const response = await authApi.login(email, password, type as string)
      
      const userData: User = {
        id: response.user._id,
        email: response.user.email,
        type: response.user.role as UserType,
        name: response.user.role === 'employer'
          ? (response.user.companyName || response.user.name || response.user.fullName)
          : (response.user.fullName || response.user.name || response.user.companyName),
        profileImage: response.user.role === 'employer' 
          ? (response.user.companyLogo || `/images/${type}-hero.png`)
          : (response.user.profilePicture || `/images/${type}-hero.png`),
        points: response.user.points,
        profileCompletion: response.user.profileCompletion,
        role: "user"
      }

      setUser(userData)
      localStorage.setItem("findr_token", response.token)
      localStorage.setItem("findr_role", type as string)
        
      return true
    } catch (error: any) {
      const errorData = handleApiError(error)
      
      // Check if user is blocked
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        setError("Your account has been blocked. Please contact support.")
        return false
      }
      
      setError(errorData.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: { email: string; password: string; role: string; name?: string; phoneNumber?: string }): Promise<boolean> => {
    try {
      console.log('AuthContext: Starting signup...');
      setIsLoading(true)
      setError(null)
      
      console.log('AuthContext: Calling API with data:', data);
      const response = await authApi.signup(data)
      console.log('AuthContext: API Response:', response);
      
      const userData: User = {
        id: response.user._id,
        email: response.user.email,
        type: response.user.role as UserType,
        name: response.user.role === 'employer'
          ? (response.user.companyName || response.user.name || response.user.fullName)
          : (response.user.fullName || response.user.name || response.user.companyName),
        profileImage: response.user.role === 'employer' 
          ? (response.user.companyLogo || `/images/${data.role}-hero.png`)
          : (response.user.profilePicture || `/images/${data.role}-hero.png`),
        points: response.user.points,
        profileCompletion: response.user.profileCompletion
      }

      setUser(userData)
      localStorage.setItem("findr_token", response.token)
      localStorage.setItem("findr_role", data.role)
      
      return true
    } catch (error: any) {
      const errorData = handleApiError(error)
      setError(errorData.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.updateProfile(data)
      
      if (user) {
        const updatedUser = {
          ...user,
          name: response.data.fullName || response.data.name || user.name,
          points: response.data.points,
          profileCompletion: response.data.profileCompletion,
          profileImage: user.type === 'employer' 
            ? (response.data.companyLogo || user.profileImage)
            : (response.data.profilePicture || user.profileImage)
        }
        setUser(updatedUser)
      }
      
      return true
    } catch (error: any) {
      const errorData = handleApiError(error)
      setError(errorData.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (shouldRefresh = false) => {
    // Get user type before clearing state
    const currentUserType = user?.type
    
    // Clear user state first
    setUser(null)
    setError(null)
    
    // Clear all localStorage items related to authentication
    try {
      localStorage.removeItem("findr_token")
      localStorage.removeItem("findr_role")
      localStorage.removeItem("authToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userId")
      localStorage.removeItem("userName")
      localStorage.removeItem("rememberedEmail")
      localStorage.removeItem("pendingRedirect")
      
      // Clear any session storage items if present
      sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing storage during logout:', error)
    }
    
    // Force a small delay to ensure state updates propagate
    setTimeout(() => {
      if (shouldRefresh) {
        // Force page refresh
        window.location.href = currentUserType === "admin" ? "/" : "/login"
      } else {
        // Redirect to appropriate login page based on user type
        if (currentUserType === "admin") {
          router.replace("/")
        } else {
          router.replace("/login")
        }
      }
    }, 100)
  }

   const refreshAuth = async () => {
     const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
     const role = localStorage.getItem("findr_role") || localStorage.getItem("userRole")
     if (!token || !role) return

     try {
       if (role === 'admin') {
         setUser({
           id: "admin-id",
           email: "admin@findr.ae",
           type: "admin",
           name: "Admin User",
           profileImage: "/images/admin-hero.png",
           role: "admin"
         })
         return
       }

       const apiBase = process.env.NEXT_PUBLIC_API_URL
       const endpoint = role === 'employer'
         ? `${apiBase}/employer/details`
         : `${apiBase}/profile/details`

       const res = await fetch(endpoint, {
         headers: { 'Authorization': `Bearer ${token}` },
       })

       if (res.ok) {
         const { data } = await res.json()
         const updatedUser: User = {
           id: data._id,
           email: data.companyEmail || data.email || "",
           type: role as UserType,
           name: role === 'employer'
             ? (data.companyName || data.name || data.fullName || "")
             : (data.fullName || data.name || data.companyName || ""),
           profileImage: role === 'employer'
             ? (data.companyLogo || `/images/${role}-hero.png`)
             : (data.profilePicture || `/images/${role}-hero.png`),
           points: data.points || 0,
           profileCompletion: data.profileCompleted || 0,
           role: "user"
         }
         setUser(updatedUser)
       }
     } catch (error) {
       console.error('AuthContext: refreshAuth error:', error)
       logout()
     }
   }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup,
        logout, 
        isLoading,
        error,
        updateProfile,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
