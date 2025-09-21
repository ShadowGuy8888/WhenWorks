import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// Import the actions we want to dispatch
import { createScheduleStart, createScheduleSuccess, createScheduleFailure } from './scheduleSlice';

// This is the async thunk
export const createSchedule = createAsyncThunk("schedule/createSchedule", async (formData, thunkAPI) => {
  // `formData` is passed from the component when we dispatch this thunk
  const { ownerEmail, title, friendMode, friendGoogleEmail, friendName, friendLocation, frequency } = formData;

  try {
    // 1. Dispatch the "loading" action
    // thunkAPI.dispatch(createScheduleStart());

    // 2. Make the API call
    const { data } = await axios.post('/api/schedules', {
      ownerEmail: ownerEmail,
      title,
      friendMode,
      friendGoogleEmail,
      friendName,
      friendLocation,
      frequency
    });

    // 3. If successful, dispatch the "success" action and return the data
    // thunkAPI.dispatch(createScheduleSuccess());
    
    return data; // This becomes the `resultAction.payload` in the fulfilled action

  } catch (error) {
    // 4. If it fails, dispatch the "failure" action and reject with the error value
    // console.error(error);
    // const errorMessage = error.response?.data?.message || 'Failed to create schedule';
    // thunkAPI.dispatch(createScheduleFailure(errorMessage));
    console.error(error);
    return thunkAPI.rejectWithValue(error?.response?.data?.message);
  }
});

export const saveSchedule = createAsyncThunk("schedule/updateSchedule", async (formData, thunkAPI) => {
  const { title, updater_email } = formData;
    try {
      const { data } = await axios.put(`/api/schedules/${currentScheduleId}`, {
        title, 
        updater_email
      });
      return data

    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue(error?.response?.data?.message);
    }
});
