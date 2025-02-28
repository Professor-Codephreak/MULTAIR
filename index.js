/**
 * Multair - file handling middleware for Node.js
 *
 * (c) 2025 Gregory L. Magnusson
 *
 * Based on original works:
 * multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
 * busyboy (c) 2010 Benjamin Thomas
 *
 * MIT License
 */

const Busboy = require('busboy');
const {
    FileSizeLimitError,
    FileFilterError,
    InvalidOptionError,
    MultairError
} = require('./lib/errors');
const diskStorage = require('./storage/disk');
const memoryStorage = require('./storage/memory');
const tcpserverStorage = require('./storage/tcpserver');

function multair(options = {}) {
    const opts = { ...options };

    if (opts.limits && typeof opts.limits !== 'object') {
        throw new InvalidOptionError('limits option must be an object', 'limits', opts.limits);
    }
    if (opts.fileFilter && typeof opts.fileFilter !== 'function') {
        throw new InvalidOptionError('fileFilter option must be a function', 'fileFilter', opts.fileFilter);
    }
    if (opts.storage && typeof opts.storage !== 'object' && typeof opts.storage !== 'function') {
        throw new InvalidOptionError('storage option must be a storage engine instance or a function', 'storage', opts.storage);
    }

    let storageEngine;
    if (opts.storage) {
        storageEngine = typeof opts.storage === 'function' ? opts.storage(opts.storageOptions) : opts.storage;
    } else {
        storageEngine = memoryStorage();
    }

    return function(req, res, next) {
        if (!req.is('multipart/form-data')) {
            return next();
        }

        const busboy = Busboy({ headers: req.headers, limits: opts.limits });
        const files = {};
        const fields = {};

        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            console.log(`File received: ${fieldname} - ${filename}`);

            if (opts.fileFilter) {
                if (!opts.fileFilter(req, { fieldname, originalname: filename, mimetype: mimeType }, (err, acceptFile) => {
                    if (err) {
                        file.resume();
                        return next(new FileFilterError('File filtering error', filename, fieldname, err));
                    }
                    if (!acceptFile) {
                        file.resume();
                        return next(new FileFilterError('File rejected by fileFilter', filename, fieldname));
                    }
                    handleFileStorage(fieldname, file, info);
                    return null;
                })) {
                    return;
                }
            } else {
                handleFileStorage(fieldname, file, info);
            }

            function handleFileStorage(fieldname, file, info) {
                storageEngine._handleFile(req, file, (err, storedFileDetails) => {
                    if (err) {
                        file.resume();
                        return next(err);
                    }

                    file.on('limit', () => {
                        file.truncated = true;
                        const fileSizeLimitErr = new FileSizeLimitError('File size limit exceeded', filename, fieldname, opts.limits.fileSize);
                        return next(fileSizeLimitErr);
                    });

                    file.on('error', (storageErr) => {
                        file.resume();
                        return next(new DiskStorageError('File stream error during storage', filename, storageErr));
                    });

                    file.on('end', () => {
                        if (!files[fieldname]) {
                            files[fieldname] = [];
                        }
                        files[fieldname].push(storedFileDetails);
                    });
                });
            }
        });

        busboy.on('field', (fieldname, value, info) => {
            fields[fieldname] = value;
        });

        busboy.on('finish', () => {
            req.body = fields;
            req.files = files;
            next();
        });

        busboy.on('error', (err) => {
            next(new MultairError('Form parsing error', 'FORM_PARSING_ERROR', err));
        });

        req.pipe(busboy);

        req.on('error', (err) => {
            next(new MultairError('Request stream error', 'REQUEST_STREAM_ERROR', err));
        });
    };
}

multair.diskStorage = diskStorage;
multair.memoryStorage = memoryStorage;
multair.tcpserverStorage = tcpserverStorage;

module.exports = multair;
