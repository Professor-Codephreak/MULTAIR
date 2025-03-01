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

class MultairError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MultairError';
    this.code = code;
  }
}

class DirectoryCreationError extends MultairError {
  constructor(message, path, originalError) {
    super(message, 'DIRECTORY_CREATION_ERROR');
    this.path = path;
    this.originalError = originalError;
    this.name = 'DirectoryCreationError';
  }
}

class DiskStorageError extends MultairError {
  constructor(message, filename, originalError, code = 'DISK_STORAGE_ERROR') {
    super(message, code);
    this.filename = filename;
    this.originalError = originalError;
    this.name = 'DiskStorageError';
  }
}

class FileSizeLimitError extends MultairError {
    constructor(message, filename, fieldname, limit, code = 'FILE_SIZE_LIMIT') {
        super(message, code);
        this.filename = filename;
        this.fieldname = fieldname;
        this.limit = limit;
        this.name = 'FileSizeLimitError';
    }
}

class FileFilterError extends MultairError {
    constructor(message, filename, fieldname, originalError, code = 'FILE_FILTER_ERROR') {
        super(message, code);
        this.filename = filename;
        this.fieldname = fieldname;
        this.originalError = originalError;
        this.name = 'FileFilterError';
    }
}

class InvalidOptionError extends MultairError {
    constructor(message, optionName, optionValue, code = 'INVALID_OPTION') {
        super(message, code);
        this.optionName = optionName;
        this.optionValue = optionValue;
        this.name = 'InvalidOptionError';
    }
}

module.exports = {
  MultairError,
  DirectoryCreationError,
  DiskStorageError,
  FileSizeLimitError,
  FileFilterError,
  InvalidOptionError
};
