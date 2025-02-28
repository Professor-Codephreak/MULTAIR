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

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const {
    DirectoryCreationError,
    DiskStorageError
} = require('../lib/errors');

function DiskStorage(options) {
    const opts = options || {};
    const destination = opts.destination;
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
