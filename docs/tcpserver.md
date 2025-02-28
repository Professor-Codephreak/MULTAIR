# TCP Server Storage Engine (`tcpserverstorage.md`)

Multipart Upload Layer Transfer Architecture for Intelligent Routing
MULTAIR (c) 2025 Gregory L. Magnusson

Based on original works:
Multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
Busboy (c) 2010 Benjamin Thomas

MIT License
---

## TCP Server Storage

The `tcpserverStorage` engine in Multair is a **demonstration storage engine** that showcases how you can stream uploaded file data directly to a **remote TCP server**.  It serves as an example of integrating Multair with network-based storage solutions or custom protocols.

**Purpose and Use Case:**

*   **Network Streaming Example:** This engine is primarily intended as a **proof-of-concept** and **example** to illustrate how Multair's pluggable storage engine architecture can be used to send file data over a network.
*   **Integration with TCP Services:**  It demonstrates how you could potentially integrate Multair with a backend service that accepts file data via raw TCP sockets. This could be a specialized file processing service, a distributed storage system with a custom TCP protocol, or any other system designed to receive data over TCP.
*   **Educational and Experimental:** `tcpserverStorage` is valuable for understanding how to build custom storage engines and explore network-based file handling scenarios within Multair.

**Important Notes:**

*   **Not Production-Ready:**  `tcpserverStorage` as provided is a **basic example** and is **not intended for production use** without significant modification and security considerations.
*   **Requires a TCP Server:**  To use `tcpserverStorage`, you need to have a separate TCP server application running and listening for connections on the specified host and port. A basic example TCP server (`/examples/tcp-server-example.js`) is often provided alongside Multair examples to demonstrate this engine.
*   **Basic Functionality:**  The provided `tcpserverStorage` example focuses on streaming the file data over TCP. It does not implement advanced features like:
    *   File metadata transmission over TCP (beyond bytes transferred count).
    *   Error recovery or retry mechanisms for network issues.
    *   Security or encryption of TCP communication.
    *   Handling responses or acknowledgments from the TCP server.
    *   File deletion or management on the TCP server.

### Usage

To use `tcpserverStorage`, you configure Multair middleware with `storage: multair.tcpserverStorage(options)`, providing connection details for your TCP server:

```javascript
const express = require('express');
const multair = require('multair');

const app = express();

const tcpStorage = multair.tcpserverStorage({
  host: 'your-tcp-server-host.com', // Replace with your TCP server's hostname or IP
  port: 12345,                      // Replace with your TCP server's port
  connectTimeout: 10000,             // Optional: Connection timeout in milliseconds
  transferTimeout: 60000              // Optional: Total transfer timeout in milliseconds
});

const upload = multair({ storage: tcpStorage });

app.post('/upload-to-tcp', upload.single('file'), function (req, res, next) {
  // req.file will contain metadata about the TCP transfer (host, port, bytesTransferred, message)
  if (req.file) {
    console.log('File streamed to TCP server:', req.file);
    res.send('File successfully streamed to TCP server!');
  } else {
    res.status(500).send('File upload failed.');
  }
});
```

In this example, Multair will attempt to establish a TCP connection to the specified server (your-tcp-server-host.com:12345) and stream the uploaded file data over the socket.
Important: You will need to run a separate TCP server application (like the tcp-server-example.js provided with Multair examples) to receive and handle the incoming TCP data.
Options
The multair.tcpserverStorage(options) factory function accepts these options to configure the TCP connection:
host (string, default: 'localhost'):
The hostname or IP address of your TCP server.
port (number, default: 9999):
The port number that your TCP server is listening on.
connectTimeout (number, default: 5000 milliseconds):
The maximum time (in milliseconds) to wait for establishing a TCP connection to the server. If the connection is not established within this timeout, an error will be reported.
transferTimeout (number, default: 30000 milliseconds):
The maximum time (in milliseconds) allowed for the entire file transfer to complete after the TCP connection is established. If the transfer takes longer than this timeout, the connection will be terminated, and an error will be reported.
Security: The example tcpserverStorage does not include any security measures. In a real-world scenario, you would need to implement robust security, such as:
Encryption: Encrypt TCP communication (e.g., using TLS/SSL or a custom encryption protocol).
Authentication: Authenticate the Multair client with the TCP server to prevent unauthorized access.
Authorization: Implement authorization mechanisms on the TCP server to control which clients can upload and manage files.
Reliability: Network communication is inherently unreliable. For production systems, you would need to add error handling, retry mechanisms, connection pooling, and potentially more sophisticated protocols to ensure reliable file transfer over TCP.
Custom Protocol Design: For real-world TCP-based file transfer, you would likely design a custom protocol on top of TCP to handle metadata, acknowledgments, error codes, file management commands, and other application-specific requirements. tcpserverStorage provides a basic starting point for this, but a full production solution would require significantly more development.
tcpserverStorage serves as a valuable example for understanding Multair's storage engine extensibility and exploring network-based file handling. However, remember to address the critical security and reliability considerations before deploying any TCP-based file transfer solution in a production environment.
