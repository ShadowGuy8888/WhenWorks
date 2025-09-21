import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import axios from 'axios';
import { selectCreateForm, selectScheduleError, selectScheduleStatus, selectNewSchedule, updateCreateForm } from '../features/schedules/scheduleSlice';
import { selectCurrentUser, setUser } from '../features/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { createSchedule } from '../features/schedules/scheduleThunks';

export default function Create() {
  const dispatch = useDispatch();
  const createForm = useSelector(selectCreateForm);
  const scheduleStatus = useSelector(selectScheduleStatus);
  const scheduleError = useSelector(selectScheduleError);
  const newSchedule = useSelector(selectNewSchedule);

  const { data: session, status } = useSession();
  
  if (status === "loading" || scheduleStatus === 'loading') {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }
  
  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  // If we get here, we are authenticated and have a session
  const handleInputChange = (field, value) => {
    console.log({ field, value })
    dispatch(updateCreateForm({ field, value }));
  };

  return (
    <>
      <div style={{ padding: 24 }}>
        <h2>Create new schedule</h2>
        <div>
          <label>Title <input value={createForm.title} onChange={(e) => handleInputChange('title', e.target.value)} /></label>
        </div>
        <div style={{ marginTop: 8 }}>
          <label><input type="radio" checked={createForm.friendMode === 'account'} onChange={() => handleInputChange('friendMode', 'account')} /> Friend has WhenWorks account (search/email)</label>
          <label style={{ marginLeft:12 }}><input type="radio" checked={createForm.friendMode === 'manual'} onChange={() => handleInputChange('friendMode', 'manual')} /> Type friend's name/location</label>
        </div>
        {createForm.friendMode === "account" ? (
          <div>
            <label>Friend's email (WhenWorks account): <input value={createForm.friendEmail} onChange={(e) => handleInputChange('friendGoogleEmail', e.target.value)} /></label>
          </div>
        ) : (
          <div>
            <label>Friend's name: <input value={createForm.friendName} onChange={(e) => handleInputChange('friendName', e.target.value)} /></label>
          </div>
        )}
        <div>
          <label>Frequency:
            <select value={createForm.frequency} onChange={(e) => handleInputChange('frequency', e.target.value)}>
              <option value="one-off">One-off (ad-hoc)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          {/* Disable button while request is in flight */}
          <button onClick={() => dispatch(createSchedule({ ...createForm, ownerEmail: session.user.email }))} disabled={scheduleStatus === 'loading'}>
            {scheduleStatus === 'loading' ? 'Creating...' : 'Create'}
          </button>
        </div>
        <small className="text-danger">{scheduleError ? scheduleError : null}</small>
      </div>
    </>
  );
}
