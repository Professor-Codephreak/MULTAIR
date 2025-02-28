# MULTAIR
MULTAIR: Multipart Upload Layer Transfer Architecture for Intelligent Routing

`multair` Node.js middleware library for handling file uploads and form data.

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


## Storage Engines

Multair, like Multer, utilizes storage engines to control where and how uploaded files are stored. Multair provides built-in storage engines and allows you to create custom ones for diverse storage solutions.

### Built-in Storage Engines

Multair currently includes the following built-in storage engines:

*   <a href="https://github.com/Professor-Codephreak/MULTAIR/blob/main/storage/diskstorage.js">Disk Storage</a>
*   **<a href="https://github.com/Professor-Codephreak/MULTAIR/blob/main/storage/memory.js">Memory Storage</a>**
*   <a href="https://github.com/Professor-Codephreak/MULTAIR/blob/main/storage/tcpserver.js">TCP Server Storage</a>

---

## <a href="https://github.com/Professor-Codephreak/MULTAIR/blob/main/storage/memory.js">Memory Storage</a>

The `memoryStorage` engine stores files **directly in memory** as `Buffer` objects. This engine is best suited for scenarios where:

*   **In-Memory Processing:** You need to immediately process the file data in your application's memory without the overhead of writing to disk. Common use cases include image manipulation, virus scanning, or data transformation pipelines.
*   **Small Files:** You are handling relatively small files and are confident that memory usage will remain within acceptable limits for your application.
*   **Temporary File Handling:** You require temporary storage of files during the request lifecycle, and persistence beyond the request is not needed.

**Critical Warning:**  `memoryStorage` has significant **memory implications**.  Storing large files or handling numerous concurrent uploads **will consume substantial memory** and can lead to **application crashes due to out-of-memory errors**.  **Exercise extreme caution when using `memoryStorage` in production**, especially for applications handling uploads from untrusted sources or potentially large files. It is generally recommended to use `diskStorage` for production environments unless you have carefully assessed and mitigated the memory risks.

### Usage

To utilize `memoryStorage`, you need to require the `multair` library and configure it as the `storage` engine in your `multair()` middleware options:

```javascript
const express = require('express');
const multair = require('multair');

const app = express();

const upload = multair({
  storage: multair.memoryStorage()
});

app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the 'avatar' file object with data in memory
  if (req.file) {
    console.log('Uploaded file (in memory):', req.file.originalname);
    // Access the file data as a Buffer:
    const fileBuffer = req.file.buffer;
    console.log('File buffer size:', fileBuffer.length, 'bytes');
    // ... Perform in-memory processing with fileBuffer ...
  } else {
    console.log('No file uploaded.');
  }
  res.send('File uploaded to memory (or no file uploaded)!');
});

// ... (rest of your express application)
```

In this example, when a user uploads a file with the field name avatar, MULTAIR will use memoryStorage to keep the file data in memory. The req.file object in your route handler will then contain the file's information, including the buffer property holding the file's contents.<br />
The memoryStorage() engine does not accept any configuration options in this version of MULTAIR. To use it, simply call the factory function multair.memoryStorage() without passing any arguments.<br />
File Information (req.file or elements in req.files) when using memoryStorage
When memoryStorage is active, the file information object (available via req.file for .single() or within req.files arrays for .array(), .fields(), .any()) will include these properties:
# Note
fieldname	Field name from the HTML form<br />
originalname	Original filename as provided by the user's browser	Important: Sanitize this value if used in file paths or URLs<br />
encoding	Encoding of the file	e.g., '7bit', 'binary<br />
mimetype	MIME type of the file	e.g., 'image/jpeg', 'text/plain'<br />
size	Size of the file in bytes<br />
buffer	Buffer object containing the complete file data.	Specific to memoryStorage. Access the file's binary content directly through this property<br />
Example req.file object (when using memoryStorage):<br />
```json
{
  "fieldname": "avatar",
  "originalname": "user-profile.jpg",
  "encoding": "7bit",
  "mimetype": "image/jpeg",
  "size": 256789,
  "buffer": {
    "type": "Buffer",
    "data": [
      255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1,
      1, 0, 0, 1, 0, 1, 0, 0, 255, 219, 0, 67, 0, 8,
      6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9, 8, 8, 9, 11,
      9, 8, 8, 9, 11, 11, 10, 10, 10, 12, 18, 12, 11,
      12, 12, 12, 18, 16, 16, 19, 24, 16, 19, 22, 22,
      24, 24, 24, 17, 21, 27, 26, 26, 24, 25, 25, 29,
      33, 31, 28, 28, 32, 36, 46, 39, 32, 34, 44, 37,
      40, 51, 41, 48, 51, 49, 49, 64, 55, 49, 58, 55,
      66, 70, 71, 72, 69, 61, 67, 77, 86, 77, 69, 56,
      // ... (truncated for brevity) ...
    ]
  }
}
```
