import { createSlice, current } from '@reduxjs/toolkit';
import { createSchedule } from './scheduleThunks';

const initialState = {
  // global states
  status: 'idle', // 'idle' | 'loading'
  error: null,

  // create.js
  createForm: {
    title: "",
    friendMode: "account", // 'account' or 'manual'
    friendGoogleEmail: null,
    friendName: null,
    friendLocation: "",
    frequency: "one-off",
  },
  newSchedule: null, 

  // [currentScheduleId].js
  currentSchedule: null,
  isRemoteUpdate: false
};

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    // Reducer to update any field in the create form
    updateCreateForm: (state, action) => {
      if (action.payload.field === "friendGoogleEmail") 
        state.createForm["friendName"] = null;
      else if (action.payload.field === "friendName") 
        state.createForm["friendGoogleEmail"] = null;

      state.createForm[action.payload.field] = action.payload.value;
      console.log(current(state));
    },
    // Reducer to clear the entire form
    resetCreateForm: state => {
      state.createForm = initialState.createForm;
    },

    // Set the entire schedule (for loading and socket updates)
    setSchedule: (state, action) => {
      state.currentSchedule = action.payload;
    },
    setRemoteUpdate: (state, action) => {
      state.isRemoteUpdate = action.payload;
    }, 
    // Update a specific field in the schedule (for the input field)
    updateScheduleField: (state, action) => {
      const { field, value } = action.payload;
      if (state.currentSchedule) {
        state.currentSchedule[field] = value;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createSchedule.pending, state => {
        state.error = null;
        state.status = "loading";
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        Object.assign(state, initialState);
        state.newSchedule = action.payload;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.error = action.payload;
        state.status = initialState.status;
      })
  }
});

// Action creators
export const {
  // Create.js
  updateCreateForm,
  resetCreateForm,
  
  // [currentScheduleId].js
  setSchedule, 
  setRemoteUpdate
} = scheduleSlice.actions;

// global
export const selectScheduleStatus = state => state.schedule.status;
export const selectScheduleError = state => state.schedule.error;

// create.js
export const selectCreateForm = state => state.schedule.createForm;
export const selectNewSchedule = state => state.schedule.newSchedule;

// [currentScheduleId].js
export const selectCurrentSchedule = state => state.schedule.currentSchedule;
export const selectRemoteUpdate = state => state.schedule.isRemoteUpdate;

export default scheduleSlice.reducer;
