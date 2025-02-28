# Memory Storage Engine (`memorystorage.md`)

Multipart Upload Layer Transfer Architecture for Intelligent Routing
MULTAIR (c) 2025 Gregory L. Magnusson

Based on original works:
Multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
Busboy (c) 2010 Benjamin Thomas

MIT License
---

## Memory Storage

The `memoryStorage` engine is the simplest storage engine provided by Multair. It stores uploaded files **directly in memory** as `Buffer` objects.

**Key Characteristics:**

*   **In-Memory Storage:** File data is held in your application's memory (RAM) as Node.js Buffers, instead of being written to disk.
*   **Transient Storage:** Files are not persisted beyond the lifespan of your Node.js application process. Once the process ends, the files are lost.
*   **Fast Access (Potentially):** Accessing file data that is already in memory can be faster than reading from disk, especially for smaller files.

**When to Use Memory Storage:**

*   **In-Memory Processing:** Ideal when you need to immediately process file data within your application's memory, such as:
    *   Image manipulation (resizing, watermarking, etc.)
    *   Virus scanning
    *   Data transformation and analysis
    *   Temporary file handling for short-lived operations
*   **Small Files:** Suitable for handling relatively small files where memory consumption is not a major concern.
*   **Prototyping and Development:** Can be convenient for development and testing, as it avoids the need for file system setup.

**Critical Warnings:**

*   **Memory Exhaustion Risk:**  `memoryStorage` is **highly susceptible to memory exhaustion**. Uploading large files or handling a high volume of concurrent uploads **will rapidly consume memory**. This can lead to **application crashes** and instability, especially in production environments.
*   **Not for Production (Generally):** **Avoid using `memoryStorage` in production** unless you have a very specific use case, are handling only small files, and have carefully monitored and mitigated memory usage risks. `diskStorage` is generally recommended for production.
*   **Instance-Local Storage:** In clustered or load-balanced environments, files stored in memory are local to each instance. Sharing files across instances requires a separate shared storage mechanism.

### Usage

To use `memoryStorage`, configure Multair middleware with the `storage` option set to `multair.memoryStorage()`:

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
```
When configured with memoryStorage, MULTAIR will parse multipart/form-data requests, and for each file upload, it will store the file content as a Buffer in memory. This Buffer is then accessible through the req.file.buffer property (or within req.files array elements).

The multair.memoryStorage() engine does not accept any options in its current implementation. It is used by simply calling the factory function:
multair.memoryStorage()


File Size Limits: Always enforce strict file size limits when using memoryStorage to mitigate the risk of memory exhaustion. Configure the limits.fileSize option in Multair middleware.
Resource Monitoring: Monitor your application's memory usage closely when using memoryStorage, especially under load.
For production applications, carefully evaluate if diskStorage or a custom storage engine better suits your needs in terms of scalability, reliability, and resource management.
