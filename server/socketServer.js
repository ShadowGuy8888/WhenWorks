/* Simple Socket.IO server to support live editing.
   Run: node server/socketServer.js
   NOTE: For production, run on a dedicated host (Cloud Run, Render, VM) */
const http = require('http');
const ioLib = require('socket.io');
const PORT = process.env.SOCKET_IO_PORT || 4000;

const server = http.createServer();
const io = new ioLib.Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('joinSchedule', ({ scheduleId, userId }) => {
    socket.join('schedule:' + scheduleId);
  });
  socket.on('scheduleChange', ({ scheduleId, payload }) => {
    // broadcast to others in room
    console.log('Room contents:', io.sockets.adapter.rooms.get('schedule:' + scheduleId));
    socket.to('schedule:' + scheduleId).emit('scheduleUpdate', payload);
  });
  socket.on('disconnect', () => {
    console.log('disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log('Socket.IO server listening on', PORT);
});
