import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [tempSchedules, setTempSchedules] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('whenworks:tempSchedules')) 
      setTempSchedules(JSON.parse(localStorage.getItem('whenworks:tempSchedules')));
  }, []);

  function createTemp() {
    const id = 'temp-' + Date.now();
    const newTemp = { id, title: 'Untitled (guest)', createdAt: new Date().toISOString(), updatedAt: null };
    const arr = [newTemp, ...tempSchedules];
    localStorage.setItem('whenworks:tempSchedules', JSON.stringify(arr));
    setTempSchedules(arr);
    window.location.href = `/schedule/${id}`;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>WhenWorks — Dashboard</h1>
      <div style={{ marginBottom: 12 }}>
        {session ? (
          <>
            <span>Signed in as {session.user.email}</span>
            <Link href="/create"><button style={{ marginLeft: 12 }}>New Schedule</button></Link>
          </>
        ) : (
          <>
            <button onClick={createTemp} style={{ marginLeft: 12 }}>New temporary schedule (guest)</button>
            <h2>Temporary schedules (this device/session)</h2>
            <ul>
              {tempSchedules.map(s => (
                <li key={s.id}><Link href={`/schedule/${s.id}`}>{s.title}</Link> — {new Date(s.createdAt).toLocaleString()}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
