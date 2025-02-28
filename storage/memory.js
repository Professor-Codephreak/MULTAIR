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

const { DiskStorageError } = require('../lib/errors');

/**
 * MemoryStorage Engine for Multair.
 *
 * This engine stores files in memory as Buffer objects. It is the simplest engine
 * and is suitable for cases where you need to process files directly in memory.
 *
 * **Warning:** Be cautious when using MemoryStorage for large files or high volumes
 * as it can lead to memory exhaustion. DiskStorage is generally recommended for
 * production environments.
 *
 * @example
 * // Basic usage of memoryStorage
 * const memoryStorage = require('multair').memoryStorage();
 *
 * @example
 * // Using memoryStorage in Multair middleware
 * const upload = require('multair')({ storage: require('multair').memoryStorage() });
 * // ... use upload middleware ...
 */
function MemoryStorage() {
  // MemoryStorage has no options in this basic implementation
  // Options could be added in the future if needed (e.g., buffer size limits, etc.)
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
    /**
     * Callback with file information after successful in-memory storage.
     * The object passed to cb will be merged into the `req.file` or `req.files` object.
     */
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
