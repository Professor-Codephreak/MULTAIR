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

const { DiskStorageError } = require('../lib/errors');

function MemoryStorage() {
  // MemoryStorage has no options in this basic implementation
}

MemoryStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const fileBufferChunks = [];

  file.on('data', (data) => {
    fileBufferChunks.push(data);
  });

  file.on('error', (err) => {
    cb(new DiskStorageError('Error reading file stream into memory', file.originalname, err, 'MEMORY_STORAGE_ERROR'));
  });

  file.on('end', () => {
    const fileBuffer = Buffer.concat(fileBufferChunks);
    cb(null, {
      buffer: fileBuffer,
      size: fileBuffer.length
    });
  });
};

MemoryStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  delete file.buffer;
  cb(null);
};

module.exports = function() {
  return new MemoryStorage();
};
