import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

// Types
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
}

export interface JobPostingState {
  formData: JobFormData
  isSubmitting: boolean
  isLoading: boolean
  error: string | null
  success: boolean
  profileCompletion: number
  canPostJob: boolean
  missingFields: string[]
  companyName: string
}

// Initial state
const initialState: JobPostingState = {
  formData: {
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
  },
  isSubmitting: false,
  isLoading: false,
  error: null,
  success: false,
  profileCompletion: 0,
  canPostJob: false,
  missingFields: [],
  companyName: ""
}

// Async thunks
export const checkEmployerEligibility = createAsyncThunk(
  'jobPosting/checkEmployerEligibility',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get('https://findr-jobboard-backend-production.up.railway.app/api/v1/employer/eligibility', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check employer eligibility')
    }
  }
)

export const submitJobPosting = createAsyncThunk(
  'jobPosting/submitJobPosting',
  async (formData: JobFormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Map frontend jobType values to backend enum values
      const jobTypeMapping: { [key: string]: string } = {
        'full-time': 'Full Time',
        'part-time': 'Part Time',
        'contract': 'Contract',
        'freelance': 'Freelance', // Map freelance to Contract
        'internship': 'Internship', // Map internship to Part Time
        'remote': 'Remote',
        'hybrid': 'Hybrid'
      }

      const mappedJobType = jobTypeMapping[formData.jobType] || 'Full Time'
      const salaryAmount = parseFloat(formData.salary) || 0

      const response = await axios.post('https://findr-jobboard-backend-production.up.railway.app/api/v1/create/jobs', {
        title: formData.jobTitle,
        companyName: formData.company,
        location: formData.location,
        jobType: [mappedJobType],
        salary: {
          min: salaryAmount,
          max: salaryAmount,
        },
        experienceLevel: formData.experience,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        description: formData.description,
        requirements: formData.requirements.split('\n').map(req => req.trim()).filter(req => req),
        applicationDeadline: formData.deadline,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit job posting')
    }
  }
)

// Slice
const jobPostingSlice = createSlice({
  name: 'jobPosting',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof JobFormData; value: string }>) => {
      state.formData[action.payload.field] = action.payload.value
    },
    updateFormData: (state, action: PayloadAction<Partial<JobFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    resetForm: (state) => {
      state.formData = initialState.formData
      state.error = null
      state.success = false
    },
    clearError: (state) => {
      state.error = null
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload
    },
    resetJobPostingState: (state) => {
      return { ...initialState }
    }
  },
  extraReducers: (builder) => {
    // Check employer eligibility
    builder
      .addCase(checkEmployerEligibility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkEmployerEligibility.fulfilled, (state, action) => {
        state.isLoading = false
        state.profileCompletion = action.payload.profileCompletion.percentage
        state.canPostJob = action.payload.canPostJob
        state.missingFields = action.payload.profileCompletion.missingFields
        state.companyName = action.payload.companyInfo.companyName
      })
      .addCase(checkEmployerEligibility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Submit job posting
    builder
      .addCase(submitJobPosting.pending, (state) => {
        state.isSubmitting = true
        state.error = null
        state.success = false
      })
      .addCase(submitJobPosting.fulfilled, (state) => {
        state.isSubmitting = false
        state.success = true
        state.formData = initialState.formData
      })
      .addCase(submitJobPosting.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
        state.success = false
      })
  }
})

export const {
  updateFormField,
  updateFormData,
  resetForm,
  clearError,
  setSuccess,
  resetJobPostingState
} = jobPostingSlice.actions

export default jobPostingSlice.reducer
