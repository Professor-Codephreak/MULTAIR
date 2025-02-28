/**
 * Multair - AI-enhanced file handling middleware for Node.js, extrapolated and enhancing
 * Busboy and Multer.
 *
 * (c) 2025 Gregory L. Magnusson
 *
 * Based on original works:
 * Copyright (c) 2014-2021 Hage Yaapa <yaapa@live.com> (Multer)
 * Copyright (c) 2010 Benjamin Thomas (Busboy)
 *
 * MIT License
 */

const net = require('net');
const { DiskStorageError } = require('../lib/errors');

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
