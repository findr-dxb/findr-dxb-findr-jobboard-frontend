import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  updateFormField,
  updateFormData,
  resetForm,
  clearError,
  setSuccess,
  resetJobPostingState,
  checkEmployerEligibility,
  submitJobPosting,
  unlockJobPostingSlot,
} from './jobPostingSlice'

export const useJobPosting = () => {
  const dispatch = useAppDispatch()
  const jobPostingState = useAppSelector((state) => state.jobPosting)

  const updateField = (field: keyof typeof jobPostingState.formData, value: string) => {
    dispatch(updateFormField({ field, value }))
  }

  const updateForm = (data: Partial<typeof jobPostingState.formData>) => {
    dispatch(updateFormData(data))
  }

  const reset = () => {
    dispatch(resetForm())
  }

  const clearErrorMessage = () => {
    dispatch(clearError())
  }

  const setSuccessMessage = (success: boolean) => {
    dispatch(setSuccess(success))
  }

  const resetState = () => {
    dispatch(resetJobPostingState())
  }

  const checkEligibility = () => {
    return dispatch(checkEmployerEligibility())
  }

  const submitJob = () => {
    return dispatch(submitJobPosting(jobPostingState.formData))
  }

  const unlockPostingSlot = () => {
    return dispatch(unlockJobPostingSlot())
  }

  return {
    // State
    formData: jobPostingState.formData,
    isSubmitting: jobPostingState.isSubmitting,
    isLoading: jobPostingState.isLoading,
    isUnlocking: jobPostingState.isUnlocking,
    error: jobPostingState.error,
    success: jobPostingState.success,
    profileCompletion: jobPostingState.profileCompletion,
    profileComplete: jobPostingState.profileComplete,
    canPostJob: jobPostingState.canPostJob,
    missingFields: jobPostingState.missingFields,
    companyName: jobPostingState.companyName,
    jobPosting: jobPostingState.jobPosting,
    
    // Actions
    updateField,
    updateForm,
    reset,
    clearErrorMessage,
    setSuccessMessage,
    resetState,
    checkEligibility,
    submitJob,
    unlockPostingSlot,
  }
}
