import { createSlice } from '@reduxjs/toolkit';

// Get initial state from the session (if available on the server during SSR)
const initialState = {
  userData: null, // { email, name, image } from next-auth
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // A reducer to set the user data after successful authentication
    setUser: (state, action) => {
      state.status = 'succeeded';
      state.userData = action.payload;
    },
    // A reducer to clear user data on logout
    clearUser: (state) => {
      state.status = 'idle';
      state.userData = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser, setStatus } = userSlice.actions;

// Selectors are functions that allow us to select a value from the state
export const selectCurrentUser = (state) => state.user.userData;
export const selectUserStatus = (state) => state.user.status;

export default userSlice.reducer;