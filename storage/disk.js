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

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const {
    DirectoryCreationError,
    DiskStorageError
} = require('../lib/errors');

/**
 * DiskStorage Engine for Multair.
 *
 * This engine stores files on disk, providing configurable options for
 * destination directory and filename generation.
 *
 * @param {object} [options] Configuration options for DiskStorage.
 * @param {string|function} [options.destination='./uploads'] Destination directory or a function to determine it.
 *                                                            - String: Path to the directory. Will be created if it doesn't exist.
 *                                                            - Function: `function(req, file, cb)` that determines the destination directory.
 * @param {function} [options.filename]           Function to determine the filename inside the destination directory.
 *                                                            - `function(req, file, cb)` that determines the filename.
 * @param {object} [options.mkdirpOptions={ recursive: true }] Options passed to the `mkdirp` directory creation function.
 *
 * @example
 * // Basic usage with default destination './uploads' and random filename
 * const diskStorage = require('multair').diskStorage();
 *
 * @example
 * // Custom destination directory for all files
 * const diskStorageCustomDest = require('multair').diskStorage({
 *   destination: './custom-uploads'
 * });
 *
 * @example
 * // Dynamic destination based on request and file properties
 * const diskStorageDynamicDest = require('multair').diskStorage({
 *   destination: function (req, file, cb) {
 *     const userId = req.user.id; // Example: Get user ID from request
 *     const destPath = `./uploads/user-${userId}`;
 *     cb(null, destPath); // Destination path for this user's uploads
 *   }
 * });
 *
 * @example
 * // Custom filename generation using original filename and timestamp
 * const diskStorageCustomFilename = require('multair').diskStorage({
 *   destination: './uploads',
 *   filename: function (req, file, cb) {
 *     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
 *     cb(null, file.originalname + '-' + uniqueSuffix); // Example: originalname-1678886400000-123456789
 *   }
 * });
 *
 * @example
 * // More advanced filename generation using crypto and extension
 * const diskStorageAdvancedFilename = require('multair').diskStorage({
 *   destination: './uploads',
 *   filename: function (req, file, cb) {
 *     crypto.randomBytes(16, (err, raw) => {
 *       if (err) return cb(err);
 *       cb(null, raw.toString('hex') + path.extname(file.originalname || '')); // Example: randomhex.jpg
 *     });
 *   }
 * });
 */
function DiskStorage(options) {
    const opts = options || {};
    const destination = opts.destination || './uploads'; // Default destination if not provided
    const filename = opts.filename;
    const mkdirpOptions = opts.mkdirpOptions || { recursive: true };

    this.getDestination = typeof destination === 'function' ? destination : function(req, file, cb) {
        cb(null, destination);
    };

    this.getFilename = typeof filename === 'function' ? filename : function(req, file, cb) {
        crypto.randomBytes(16, (err, raw) => {
            cb(err, err ? undefined : raw.toString('hex') + path.extname(file.originalname || ''));
        });
    };

    this.mkdirpOptions = mkdirpOptions;
}

DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    this.getDestination(req, file, (err, dest) => {
        if (err) return cb(err);

        this.getFilename(req, file, (err, name) => {
            if (err) return cb(err);
            const finalPath = path.join(dest, name);
            const outStream = fs.createWriteStream(finalPath);

            outStream.on('error', (err) => {
                cb(new DiskStorageError('Failed to write file to disk', file.originalname, err));
            });
            outStream.on('finish', () => {
                /**
                 * Callback with file information after successful storage.
                 * The object passed to cb will be merged into the `req.file` or `req.files` object.
                 */
                cb(null, {
                    destination: dest,
                    filename: name,
                    path: finalPath,
                    size: outStream.bytesWritten
                });
            });

            file.stream.pipe(outStream);
        });

        mkdirp(dest, this.mkdirpOptions)
            .catch(err => {
                cb(new DirectoryCreationError('Failed to create directory for file upload', dest, err));
            });
    });
};

DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    const pathToRemove = file.path;
    delete file.buffer;
    fs.unlink(pathToRemove, (err) => {
        if (err && err.code !== 'ENOENT') {
            return cb(new DiskStorageError('Failed to delete file from disk', file.filename, err, 'FILE_DELETION_ERROR'));
        }
        cb(null);
    });
};

module.exports = function(options) {
    return new DiskStorage(options);
};
