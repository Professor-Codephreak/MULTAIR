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
```
In this example, diskStorage is configured with a destination function to specify the upload directory and a filename function to generate unique filenames.

The multair.diskStorage(options) factory function accepts an options object to customize its behavior:
destination (string or function, default: './uploads'):
String: A string representing the path to the directory where uploaded files should be stored. Multair will ensure this directory exists (creating it if necessary using mkdirp).
Function: A function that determines the destination directory dynamically. It should have the signature:
function(req, file, cb) {
  cb(null, destinationPath); // destinationPath is a string
}

```js
req: The Express request object.
file: An object containing information about the file being processed (see "File Information" below).
cb: A callback function that you must call once you have determined the destination directory. The first argument should be an error (if any), and the second argument should be the destination directory path (string).
filename (function, optional):
A function to determine the filename that should be used to store the file within the destination directory. It has the signature:
function(req, file, cb) {
  cb(null, filename); // filename is a string
}
```
req: The Express request object.
file: An object containing information about the file being processed (see "File Information" below).
cb: A callback function that you must call once you have determined the filename. The first argument should be an error (if any), and the second argument should be the filename (string).
If no filename function is provided, Multair will generate a unique, random filename (using crypto.randomBytes) with the original file extension preserved.
mkdirpOptions (object, default: { recursive: true }):
Options object that is passed directly to the mkdirp library when creating destination directories. See the mkdirp documentation for available options. The default { recursive: true } ensures that all necessary parent directories are created as well.
File Information (req.file or elements in req.files) when using diskStorage
When using diskStorage, the file information object will contain the following properties, in addition to the standard file information properties common to all Multair storage engines:
Key	Description
fieldname	Field name from the HTML form	
originalname	Original filename as provided by the user's browser	Important: Sanitize this value if used in file paths or URLs.
encoding	Encoding of the file	e.g., '7bit', 'binary'
mimetype	MIME type of the file	e.g., 'image/jpeg', 'text/plain'
size	Size of the file in bytes	
destination	The directory path where the file was saved.	Specific to diskStorage.
filename	The name of the file as saved within the destination directory.	Specific to diskStorage. This may be different from originalname if you used a custom filename function.
path	The full path to the uploaded file on the server's file system.	Specific to diskStorage. Combine destination and filename to reconstruct this path.
Example req.file object (when using diskStorage):
```json
{
  "fieldname": "avatar",
  "originalname": "profile-picture.png",
  "encoding": "7bit",
  "mimetype": "image/png",
  "size": 123456,
  "destination": "./uploads",
  "filename": "avatar-1678886400000-123456789.png",
  "path": "./uploads/avatar-1678886400000-123456789.png"
}
```

Example: Custom Filename Generation with UUID
```js
const { v4: uuidv4 } = require('uuid'); // Install uuid: npm install uuid

const storage = multair.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename); // Filename will be a UUID + original extension
  }
});
```
