# MULTAIR
This document provides a technical overview of the `multair` Node.js middleware library for handling file uploads and form data.

## Core Functionality

`multair` is an Express/Node.js middleware designed to efficiently parse `multipart/form-data` requests, primarily used for handling file uploads in web applications. It aims to provide a robust, flexible, and scalable solution for enterprise-level file handling needs, drawing inspiration from libraries like `multer` but with architectural and feature enhancements.

## Architecture and Design

*   **Based on `busboy`:** `multair` leverages the `busboy` library for low-level parsing of `multipart/form-data` requests. `busboy` is known for its performance and stream-based parsing capabilities, which are crucial for handling large file uploads efficiently without excessive memory consumption.
*   **Stream-Based Processing:**  The entire `multair` pipeline is designed around streams. Incoming request data is streamed to `busboy` for parsing, and file data is further streamed to the configured storage engine. This stream-based approach is fundamental for scalability and memory efficiency, especially when dealing with large files and concurrent uploads.
*   **Pluggable Storage Engines:**  `multair` adopts a pluggable storage engine architecture, allowing developers to choose from built-in storage options or create custom engines tailored to specific storage requirements. This design promotes flexibility and integration with diverse storage backends.

## Built-in Storage Engines

`multair` currently provides these built-in storage engines:

*   **`diskStorage`:** Stores files on the local file system. Offers configurable destination directories and filename generation. Includes robust directory creation and error handling.
*   **`memoryStorage`:** Stores files in memory as `Buffer` objects. Suitable for in-memory processing of smaller files, but use with caution due to potential memory limitations.
*   **`tcpserverStorage`:** Streams file data directly to a remote TCP server. Demonstrates network-based storage and custom protocol possibilities. Configurable with host, port, and timeouts.

## Error Handling

`multair` emphasizes robust error handling with a system of custom error classes defined in `lib/errors.js`. Key aspects include:

*   **Custom Error Classes:**  Provides specific error classes like `DirectoryCreationError`, `DiskStorageError`, `FileSizeLimitError`, `FileFilterError`, `InvalidOptionError`, and a base `MultairError`. These classes provide structured error information including error codes, filenames, paths, and original errors for better debugging and error management.
*   **Error Wrapping:**  Errors originating from underlying libraries (like `mkdirp`, `fs`, `net` sockets, `busboy`) are wrapped in `multair`'s custom error classes to provide context and consistency in error reporting.
*   **Stream Consumption on Error:**  In error scenarios during file processing (e.g., file filter rejection, storage errors), `multair` ensures that the incoming file stream is properly consumed (`file.resume()`) to prevent backpressure issues and ensure correct event flow within `busboy`.
*   **Specific Error Events:**  `multair` leverages `busboy`'s `'limit'` event for file size limits and integrates error handling into storage engine callbacks and stream event handlers (`'error'`, `'close'`).

## Key Features (Current & Planned)

*   **Multipart Form Parsing:**  Handles `multipart/form-data` requests effectively using `busboy`.
*   **File Storage Abstraction:**  Pluggable storage engines for flexible file management.
*   **Built-in Storage Engines:**  Provides `diskStorage`, `memoryStorage`, and `tcpserverStorage` out of the box.
*   **File Filtering (`fileFilter` option):**  Allows for programmatic filtering of uploaded files based on criteria like MIME type or filename (partially implemented, needs refinement and testing).
*   **Size Limits (`limits` option):**  Supports configuration of size limits for fields and files to prevent resource exhaustion and denial-of-service attacks (partially implemented, needs full integration and testing).
*   **Comprehensive File Information:**  Provides detailed file information objects in `req.file` and `req.files`, including metadata and storage-engine specific properties (`buffer`, `path`, etc.).
*   **Option Validation:**  Includes basic validation of middleware and storage engine options to catch configuration errors early.

## API Overview

*   **`multair(options)` Middleware Function:**  The main factory function that creates the `multair` middleware. Accepts an `options` object for configuration, including `storage`, `limits`, and `fileFilter`.
*   **`multair.diskStorage(options)`:** Factory function to create instances of the `diskStorage` engine, configurable with `destination`, `filename`, and `mkdirpOptions`.
*   **`multair.memoryStorage()`:** Factory function to create instances of the `memoryStorage` engine (currently no options).
*   **`multair.tcpserverStorage(options)`:** Factory function to create instances of the `tcpserverStorage` engine, configurable with `host`, `port`, `connectTimeout`, and `transferTimeout`.

## Scalability and Enterprise Readiness (Initial Stage)

`multair` is designed with scalability and enterprise integration in mind from the outset.  Key aspects contributing to this goal include:

*   **Stream-Based Architecture:**  Core for handling large uploads and high concurrency efficiently.
*   **Robust Error Handling:**  Essential for reliable operation in production environments.
*   **Pluggable Storage:**  Facilitates integration with various enterprise storage solutions, including cloud storage and network-attached storage.
*   **Configurable Limits:**  Provides security and resource management controls necessary for enterprise deployments.

**Current Limitations and Future Directions:**

*   **`fileFilter` and `limits` Refinement:**  The `fileFilter` and `limits` options are in the initial stages of implementation and require further refinement, testing, and documentation.
*   **Comprehensive Testing:**  More extensive unit and integration tests are needed to ensure robustness and reliability across various scenarios.
*   **Documentation Expansion:**  Documentation needs to be expanded to cover all features, options, storage engines, and custom engine creation in detail.
*   **Custom Storage Engine API:**  The API for creating custom storage engines could be further clarified and potentially enhanced with helper classes or interfaces.
*   **Cloud Storage Integrations:**  Future development could include built-in helper functions or storage engine examples for common cloud storage services (S3, Azure Blob, Google Cloud Storage) to simplify enterprise integrations.

`multair` is currently under active development and aims to evolve into a production-ready, enterprise-grade file handling middleware for Node.js applications.
