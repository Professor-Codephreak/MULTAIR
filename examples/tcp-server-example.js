const net = require('net');

const server = net.createServer((socket) => {
  console.log('TCP client connected');
  let receivedDataLength = 0;

  socket.on('data', (data) => {
    receivedDataLength += data.length;
    console.log(`TCP Server received data chunk of ${data.length} bytes, total: ${receivedDataLength}`);
  });

  socket.on('end', () => {
    console.log(`TCP client disconnected, total data received: ${receivedDataLength} bytes`);
    socket.end();
  });

  socket.on('error', (err) => {
    console.error('TCP socket error on server:', err);
  });

  socket.on('close', (hadError) => {
    console.log(`TCP socket closed (server side), hadError: ${hadError}`);
  });
});

const PORT = 9999;
server.listen(PORT, () => {
  console.log(`TCP server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('TCP server error:', err);
});
