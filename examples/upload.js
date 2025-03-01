/** /examples/upload.js
 * Multipart Upload Layer Transfer Architecture for Intelligent Routing
 * MULTAIR (c) 2025 Gregory L. Magnusson
 * MIT License
 */

const express = require('express');
const multair = require('../index');

const app = express();

app.post('/upload/memory', multair({ storage: multair.memoryStorage() }), (req, res) => {
  console.log('Memory Storage - req.files:', req.files);
  res.send('File uploaded to memory!');
});

app.post('/upload/disk', multair({ storage: multair.diskStorage({ destination: './uploads' }) }), (req, res) => {
  console.log('Disk Storage - req.files:', req.files);
  res.send('File uploaded to disk!');
});

app.post('/upload/tcp', multair({
  storage: multair.tcpserverStorage({
    host: 'localhost',
    port: 9999
  })
}), (req, res) => {
  console.log('TCP Server Storage - req.files:', req.files);
  res.send('File streamed to TCP server!');
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>upload</title></head>
      <body>
        <h1>Upload Form</h1>

        <h2>upload to memory</h2>
        <form method="POST" action="/upload/memory" enctype="multipart/form-data">
          <input type="file" name="avatar_memory"><br><br>
          <button type="submit">upload to Memory</button>
        </form>

        <h2>upload to disk</h2>
        <form method="POST" action="/upload/disk" enctype="multipart/form-data">
          <input type="file" name="avatar_disk"><br><br>
          <button type="submit">upload to Disk</button>
        </form>

        <h2>upload to TCP server</h2>
        <form method="POST" action="/upload/tcp" enctype="multipart/form-data">
          <input type="file" name="avatar_tcp"><br><br>
          <button type="submit">upload to TCP Server</button>
        </form>

      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
