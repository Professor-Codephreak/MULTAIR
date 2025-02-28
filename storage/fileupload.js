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

const express = require('express');
const multair = require('./index'); // Assuming multair's index.js is in the same directory
const path = require('path');

const app = express();

// Configure disk storage for file uploads
const storage = multair.diskStorage({
    destination: function (req, file, cb) {
        // Destination folder for uploaded files (create 'uploads' directory in project root)
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename (you can customize this as needed)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Create the multair upload middleware using the configured disk storage
const upload = multair({ storage: storage });

// Route to handle single file upload (using .single('avatar') middleware)
app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file information
    // req.body will hold the text fields, if there were any in the form

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('Uploaded file information (req.file):', req.file);
    console.log('Form text fields (req.body):', req.body);

    res.send(`
        <h1>File Upload Successful!</h1>
        <p>File saved to: ${req.file.path}</p>
        <p>Original filename: ${req.file.originalname}</p>
        <p>MIME type: ${req.file.mimetype}</p>
        <p>File size: ${req.file.size} bytes</p>
        ${req.body.username ? `<p>Username: ${req.body.username}</p>` : ''}
    `);
});

// Serve a simple HTML form for file upload testing
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Multair File Upload Example</title>
        </head>
        <body>
            <h1>Upload your profile picture</h1>
            <form action="/profile" method="post" enctype="multipart/form-data">
                <label for="avatar">Choose an image file:</label>
                <input type="file" name="avatar" id="avatar"><br><br>

                <label for="username">Username (optional):</label>
                <input type="text" name="username" id="username" placeholder="Enter username"><br><br>

                <button type="submit">Upload Profile Picture</button>
            </form>
        </body>
        </html>
    `);
});

// Error handling middleware (for demonstration - refine in production)
app.use(function (err, req, res, next) {
    console.error('Error during file upload:', err);
    res.status(500).send(`
        <h1>File Upload Error!</h1>
        <p>An error occurred during file upload. See console for details.</p>
        <pre>${err.stack}</pre>
    `);
});


app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
