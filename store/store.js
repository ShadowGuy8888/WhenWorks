import { configureStore } from '@reduxjs/toolkit';
// We will import our slices here
import scheduleReducer from '../features/schedules/scheduleSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    // This defines the top-level state fields: `state.schedule` and `state.user`
    schedule: scheduleReducer,
    // user: userReducer,
  },
});

// Optional: Export types for TypeScript or for better IDE autocompletion
export default store;