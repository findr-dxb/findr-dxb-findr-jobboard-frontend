import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { getApiErrorMessage } from "@/lib/api-error"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const JOB_TYPE_TO_API: Record<string, string> = {
  "full-time": "Full Time",
  "part-time": "Part Time",
  contract: "Contract",
  remote: "Remote",
  hybrid: "Hybrid",
}

function getAuthToken(): string {
  const token =
    localStorage.getItem("findr_token") || localStorage.getItem("authToken")
  if (!token) throw new Error("Please log in to continue.")
  return token
}

export interface JobFormData {
  jobTitle: string
  company: string
  location: string
  jobType: string
  salary: string
  experience: string
  skills: string
  description: string
  requirements: string
  deadline: string
  nationality: string
}

export interface JobPostingLimitInfo {
  limit: number
  pointsCost: number
  employerPoints: number
  lastJobPostedAt: string | null
  nextFreeSlotAt: string | null
  daysUntilFreeSlot: number
  cooldownDays: number
  hasPostingSlot: boolean
  canUnlockWithPoints: boolean
  waitRequired: boolean
}

export interface JobPostingState {
  formData: JobFormData
  isSubmitting: boolean
  isLoading: boolean
  error: string | null
  success: boolean
  profileCompletion: number
  profileComplete: boolean
  canPostJob: boolean
  missingFields: string[]
  companyName: string
  jobPosting: JobPostingLimitInfo | null
  isUnlocking: boolean
}

const emptyForm: JobFormData = {
  jobTitle: "",
  company: "",
  location: "",
  jobType: "",
  salary: "",
  experience: "",
  skills: "",
  description: "",
  requirements: "",
  deadline: "",
  nationality: "",
}

const initialState: JobPostingState = {
  formData: emptyForm,
  isSubmitting: false,
  isLoading: false,
  error: null,
  success: false,
  profileCompletion: 0,
  profileComplete: false,
  canPostJob: false,
  missingFields: [],
  companyName: "",
  jobPosting: null,
  isUnlocking: false,
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export const checkEmployerEligibility = createAsyncThunk(
  "jobPosting/checkEmployerEligibility",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const { data } = await axios.get(`${API_URL}/employer/eligibility`, {
        headers: authHeaders(token),
      })
      return data.data
    } catch (err) {
      return rejectWithValue(
        getApiErrorMessage(err, "Could not verify your profile. Please try again.")
      )
    }
  }
)

export const unlockJobPostingSlot = createAsyncThunk(
  "jobPosting/unlockJobPostingSlot",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const { data } = await axios.post(
        `${API_URL}/employer/unlock-job-posting`,
        {},
        { headers: authHeaders(token) }
      )
      return data
    } catch (err) {
      return rejectWithValue(
        getApiErrorMessage(err, "Could not unlock a job posting slot.")
      )
    }
  }
)

export const submitJobPosting = createAsyncThunk(
  "jobPosting/submitJobPosting",
  async (formData: JobFormData, { rejectWithValue }) => {
    try {
      const token = getAuthToken()
      const salary = parseFloat(formData.salary) || 0

      const { data } = await axios.post(
        `${API_URL}/create/jobs`,
        {
          title: formData.jobTitle,
          companyName: formData.company,
          location: formData.location,
          jobType: [JOB_TYPE_TO_API[formData.jobType] || "Full Time"],
          salary: { min: salary, max: salary },
          experienceLevel: formData.experience,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          description: formData.description,
          requirements: formData.requirements
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean),
          applicationDeadline: formData.deadline,
          nationality: formData.nationality,
        },
        { headers: authHeaders(token) }
      )
      return data
    } catch (err) {
      return rejectWithValue(
        getApiErrorMessage(err, "Could not post this job. Please try again.")
      )
    }
  }
)

const jobPostingSlice = createSlice({
  name: "jobPosting",
  initialState,
  reducers: {
    updateFormField: (
      state,
      action: PayloadAction<{ field: keyof JobFormData; value: string }>
    ) => {
      state.formData[action.payload.field] = action.payload.value
    },
    updateFormData: (state, action: PayloadAction<Partial<JobFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    resetForm: (state) => {
      state.formData = emptyForm
      state.error = null
      state.success = false
    },
    clearError: (state) => {
      state.error = null
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload
    },
    resetJobPostingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkEmployerEligibility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkEmployerEligibility.fulfilled, (state, action) => {
        state.isLoading = false
        state.profileCompletion = action.payload.profileCompletion.percentage
        state.profileComplete = action.payload.profileComplete ?? action.payload.profileCompletion.percentage >= 80
        state.canPostJob = action.payload.canPostJob
        state.missingFields = action.payload.profileCompletion.missingFields
        state.companyName = action.payload.companyInfo.companyName
        state.jobPosting = action.payload.jobPosting ?? null
      })
      .addCase(checkEmployerEligibility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(submitJobPosting.pending, (state) => {
        state.isSubmitting = true
        state.error = null
        state.success = false
      })
      .addCase(submitJobPosting.fulfilled, (state) => {
        state.isSubmitting = false
        state.success = true
        state.formData = emptyForm
      })
      .addCase(submitJobPosting.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
        state.success = false
      })

    builder
      .addCase(unlockJobPostingSlot.pending, (state) => {
        state.isUnlocking = true
        state.error = null
      })
      .addCase(unlockJobPostingSlot.fulfilled, (state, action) => {
        state.isUnlocking = false
        if (action.payload?.jobPosting) {
          state.jobPosting = action.payload.jobPosting
          state.canPostJob =
            (state.profileComplete ?? state.profileCompletion >= 80) &&
            action.payload.jobPosting.hasPostingSlot
        }
      })
      .addCase(unlockJobPostingSlot.rejected, (state, action) => {
        state.isUnlocking = false
        state.error = action.payload as string
      })
  },
})

export const {
  updateFormField,
  updateFormData,
  resetForm,
  clearError,
  setSuccess,
  resetJobPostingState,
} = jobPostingSlice.actions

export default jobPostingSlice.reducer
