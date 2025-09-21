import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Router from "next/router";
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentSchedule, selectRemoteUpdate, setRemoteUpdate, setSchedule } from '../../features/schedules/scheduleSlice';
import { saveSchedule } from '../../features/schedules/scheduleThunks';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'https://favourite-arthritis-restoration-telecom.trycloudflare.com');

export default function ScheduleEditor() {
  const dispatch = useDispatch();
  const schedule = useSelector(selectCurrentSchedule);
  const isRemoteUpdate = useSelector(selectRemoteUpdate);
  const router = useRouter(); // this triggers either a 2nd/3rd render
  const { data: session, status } = useSession(); // this triggers either a 2nd/3rd render
  const { currentScheduleId } = router.query;

  useEffect(() => {
    // console.log(status)
    // console.log(currentScheduleId)
    if (!currentScheduleId || status === "loading") return; // this will run after the 1st & 2nd render
    if (status === "unauthenticated" && !currentScheduleId.startsWith('temp-')) 
      Router.push("/");
    // cb runs after 1st render because its an effect
    // cb runs after 2nd render because status changed from "loading" to "authenticated"
    // cb runs after 3rd render because currentScheduleId changed from undefined to integer
    // sometimes currentScheduleId gets updated earlier than status (we can't control it)
  }, [status, currentScheduleId]);
  
  useEffect(() => {
    if (!currentScheduleId || status === "loading") return; // this will run after the 1st & 2nd render

    (async function() {
      if (currentScheduleId.startsWith('temp-')) {
        const raw = localStorage.getItem('whenworks:tempSchedules');
        const arr = raw ? JSON.parse(raw) : [];
        const currentTemp = arr.find(s => s.id === currentScheduleId);
        dispatch(setSchedule(currentTemp));
        return;

      } else if (!currentScheduleId.startsWith("temp-")) {
        const { data } = await axios.get(`/api/schedules/${currentScheduleId}`);
        dispatch(setSchedule(data));
        // socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'https://portions-sofa-operations-cornell.trycloudflare.com');
        socket.emit('joinSchedule', { scheduleId: currentScheduleId, userId: 'web' });
        socket.on('scheduleUpdate', (payload) => {
          dispatch(setRemoteUpdate(true));
          dispatch(setSchedule({ ...schedule, title: payload.title }));
        });
      }
    })()

    return () => { if (socket) socket.disconnect(); }
  }, [status, currentScheduleId]);

  useEffect(() => {
    (async () => {
      if (!currentScheduleId || status === "loading") return; // this will run after the 1st & 2nd render
      if (currentScheduleId.startsWith('temp-')) 
        saveTemporary(); 
      else if (!currentScheduleId.startsWith("temp-") && session) { 
        if (!isRemoteUpdate) {
          await dispatch(saveSchedule({ ...schedule, currentScheduleId, updater_email: session.user.email }));
          socket.emit('scheduleChange', { scheduleId: currentScheduleId, payload: { title: schedule.title }});
        }
        dispatch(setRemoteUpdate(false));
      }
    })()
  }, [schedule?.title]);

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  function saveTemporary() {
    const raw = localStorage.getItem('whenworks:tempSchedules');
    const arr = raw ? JSON.parse(raw) : [];
    const idx = arr.findIndex(s => s.id === currentScheduleId);
    const updatedTemp = { ...arr[idx], ...schedule, updatedAt: new Date().toISOString() };
    if (idx >= 0) arr[idx] = updatedTemp; else arr.unshift(updatedTemp);
    localStorage.setItem('whenworks:tempSchedules', JSON.stringify(arr));
  }

  return (
    <>
      {
        schedule ? (
          <div style={{ padding: 24 }}>
            <h2>Schedule editor — {schedule.id}</h2>
            <div>
              <label>Title: 
                <input value={schedule.title} onChange={(e) => {
                  dispatch(setRemoteUpdate(false));
                  dispatch(setSchedule({ ...schedule, title: e.target.value }));
                }} />
              </label>
            </div>
            <div style={{ marginTop: 20 }}>
              <strong>Preview timeline</strong>
              <p>Timeline rendering is not fully implemented in this starter — use Luxon on the frontend (client) to render city/timezone aligned lanes. The DB contains timezone fields to auto-render when present.</p>
            </div>
          </div>
        ) : null
      }
    </>
  );
}
