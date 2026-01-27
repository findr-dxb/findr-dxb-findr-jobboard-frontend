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
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthState = () => {
      try {
        // Ensure we're in browser environment
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        // Check for stored auth data (try both token formats)
        const storedUser = localStorage.getItem("findr_user")
        const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
        
        // Only set user if both user data and token exist
        if (storedUser && token) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Additional validation to ensure user object is valid
            if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.type) {
              setUser(parsedUser);
            } else {
              // Invalid user data, clear everything
              console.warn('AuthContext: Invalid user data found, clearing storage');
              localStorage.removeItem("findr_user")
              localStorage.removeItem("findr_token")
              localStorage.removeItem("authToken")
              setUser(null);
            }
          } catch (parseError) {
            console.error('AuthContext: Error parsing stored user:', parseError);
            // Clear invalid stored data
            localStorage.removeItem("findr_user")
            localStorage.removeItem("findr_token")
            localStorage.removeItem("authToken")
            setUser(null);
          }
        } else {
          // No complete auth data, ensure user is null
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error in checkAuthState:', error);
        setUser(null);
      } finally {
        setIsLoading(false)
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkAuthState();
    } else {
      setIsLoading(false);
    }
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
            localStorage.setItem("findr_user", JSON.stringify(adminUser))
            localStorage.setItem("findr_token", response.token)
            
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
        name: response.user.name || response.user.fullName || response.user.companyName,
        profileImage: response.user.role === 'employer' 
          ? (response.user.companyLogo || `/images/${type}-hero.png`)
          : (response.user.profilePicture || `/images/${type}-hero.png`),
        points: response.user.points,
        profileCompletion: response.user.profileCompletion,
        role: "user"
      }

      setUser(userData)
      localStorage.setItem("findr_user", JSON.stringify(userData))
      localStorage.setItem("findr_token", response.token)
        
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
        name: response.user.name || response.user.fullName || response.user.companyName,
        profileImage: response.user.role === 'employer' 
          ? (response.user.companyLogo || `/images/${data.role}-hero.png`)
          : (response.user.profilePicture || `/images/${data.role}-hero.png`),
        points: response.user.points,
        profileCompletion: response.user.profileCompletion
      }

      setUser(userData)
      localStorage.setItem("findr_user", JSON.stringify(userData))
      localStorage.setItem("findr_token", response.token)
      
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
        localStorage.setItem("findr_user", JSON.stringify(updatedUser))
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
      localStorage.removeItem("findr_user")
      localStorage.removeItem("findr_token")
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
        window.location.href = currentUserType === "admin" ? "/login/admin" : "/login"
      } else {
        // Redirect to appropriate login page based on user type
        if (currentUserType === "admin") {
          router.replace("/login/admin")
        } else {
          router.replace("/login")
        }
      }
    }, 100)
  }

  const refreshAuth = () => {
    console.log('AuthContext: Manual refresh triggered');
    const storedUser = localStorage.getItem("findr_user")
    const token = localStorage.getItem("findr_token") || localStorage.getItem("authToken")
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Refreshing with user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing stored user during refresh:', error);
        logout()
      }
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
