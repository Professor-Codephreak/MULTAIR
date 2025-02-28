Multipart Upload Layer Transfer Architecture for Intelligent Routing
MULTAIR (c) 2025 Gregory L. Magnusson

Based on original works:
Multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
Busboy (c) 2010 Benjamin Thomas

MIT License
---

## Disk Storage

The `diskStorage` engine is a powerful and flexible storage engine for Multair that gives you full control over how files are saved to the **local file system**.  It is the recommended storage engine for most production environments due to its efficiency, reliability, and configurability.

**Key Features:**

*   **Storage on Disk:** Files are physically written to disk, making them persistent and accessible outside the immediate request lifecycle.
*   **Configurable Destination:** You can precisely control where files are saved on your server's file system, allowing for organization and integration with existing file storage structures.
*   **Filename Customization:**  `diskStorage` enables you to define how filenames are generated, providing options for security, uniqueness, and integration with file management systems.
*   **Directory Creation:** Automatically creates destination directories if they don't exist, simplifying setup and preventing common errors.

**When to Use Disk Storage:**

*   **Production Environments:**  Generally the best choice for production web applications where file persistence and reliable disk-based storage are required.
*   **Large Files:** Efficiently handles large file uploads without excessive memory consumption due to its stream-based nature.
*   **File System Integration:** When you need to directly access uploaded files from the file system for other processes or applications.
*   **Scalability:** Suitable for scalable applications, as disk storage is generally more memory-efficient than in-memory storage for large or numerous files.

### Usage

To use `diskStorage`, you need to require `multair` and configure it as the `storage` engine when initializing Multair middleware. You can customize its behavior using options passed to the `multair.diskStorage()` factory function.

```javascript
const express = require('express');
const multair = require('multair');

const app = express();

// Configure disk storage
const storage = multair.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where files will be saved
        cb(null, './uploads'); // Files will be saved to './uploads' directory
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for each uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multair({ storage: storage });

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file now contains information about the stored file on disk
    console.log(req.file);
    res.send('File uploaded and saved to disk!');
});

// ... (rest of your express app)
