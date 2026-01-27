import { configureStore } from '@reduxjs/toolkit'
import jobPostingReducer from './features/jobPosting/jobPostingSlice'

export const store = configureStore({
  reducer: {
    jobPosting: jobPostingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
