/**
 * Multipart Upload Layer Transfer Architecture for Intelligent Routing
 * MULTAIR (c) 2025 Gregory L. Magnusson
 *
 * Based on original works:
 * Multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
 * Busboy (c) 2010 Benjamin Thomas
 *
 * MIT License
 */

const net = require('net');
const { DiskStorageError } = require('../lib/errors');

/**
 * TCPServerStorage Engine for Multair.
 *
 * This engine streams uploaded file data to a remote TCP server. It is an example
 * of how Multair's storage engine architecture can be used to integrate with
 * network-based storage solutions or custom protocols.
 *
 * **Use Case:** Demonstrates streaming file uploads to a separate server,
 * potentially for processing, storage in a distributed system, or integration
 * with a service that accepts data via TCP sockets.
 *
 * @param {object} [options] Configuration options for TCPServerStorage.
 * @param {string} [options.host='localhost'] TCP server hostname or IP address.
 * @param {number} [options.port=9999]      TCP server port.
 * @param {number} [options.connectTimeout=5000] Timeout in milliseconds for establishing TCP connection.
 * @param {number} [options.transferTimeout=30000] Timeout in milliseconds for the entire file transfer after connection.
 *
 * @example
 * // Basic usage with default host 'localhost' and port 9999
 * const tcpStorage = require('multair').tcpserverStorage();
 *
 * @example
 * // Custom TCP server host and port
 * const tcpStorageCustomServer = require('multair').tcpserverStorage({
 *   host: 'fileserver.example.com',
 *   port: 12345
 * });
 *
 * @example
 * // Setting connection and transfer timeouts
 * const tcpStorageTimeouts = require('multair').tcpserverStorage({
 *   host: 'fileserver.example.com',
 *   port: 12345,
 *   connectTimeout: 10000, // 10 seconds connection timeout
 *   transferTimeout: 60000 // 1 minute transfer timeout
 * });
 */
function TCPServerStorage(options) {
  const opts = options || {};
  this.host = opts.host || 'localhost';
  this.port = opts.port || 9999;
  this.connectTimeout = opts.connectTimeout || 5000;
  this.transferTimeout = opts.transferTimeout || 30000;
}

TCPServerStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const socket = net.connect({ port: this.port, host: this.host, timeout: this.connectTimeout });
  let bytesTransferred = 0;
  let transferTimer;

  socket.on('connect', () => {
    console.log(`TCP connection established to ${this.host}:${this.port}`);
    transferTimer = setTimeout(() => {
      socket.destroy(new Error('TCP transfer timeout'));
    }, this.transferTimeout);

    file.stream.pipe(socket);

    file.stream.on('data', (chunk) => {
      bytesTransferred += chunk.length;
    });

    file.stream.on('error', (err) => {
      clearTimeout(transferTimer);
      socket.destroy();
      cb(new DiskStorageError('Error reading file stream for TCP transfer', file.originalname, err, 'TCP_FILE_STREAM_ERROR'));
    });

    socket.on('error', (socketErr) => {
      clearTimeout(transferTimer);
      file.stream.unpipe(socket);
      file.resume();
      cb(new DiskStorageError('TCP socket error during file transfer', file.originalname, socketErr, 'TCP_SOCKET_ERROR'));
    });

    socket.on('close', (hadError) => {
      clearTimeout(transferTimer);
      if (hadError) {
        return;
      }
      console.log(`TCP transfer finished for ${file.originalname}, ${bytesTransferred} bytes`);
      /**
       * Callback with file information after successful TCP transfer.
       * The object passed to cb will be merged into the `req.file` or `req.files` object.
       */
      cb(null, {
        tcpHost: this.host,
        tcpPort: this.port,
        bytesTransferred: bytesTransferred,
        message: 'File successfully transferred via TCP'
      });
    });
  });

  socket.on('error', (connectErr) => {
    clearTimeout(transferTimer);
    file.resume();
    cb(new DiskStorageError(`Failed to connect to TCP server at ${this.host}:${this.port}`, file.originalname, connectErr, 'TCP_CONNECTION_ERROR'));
  });

  socket.setTimeout(this.connectTimeout, () => {
    socket.destroy(new Error('TCP connection timeout'));
  });
};

TCPServerStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  console.warn('TCPServerStorage: _removeFile is a no-op. No local file to remove.');
  cb(null);
};

module.exports = function(options) {
    return new TCPServerStorage(options);
};
