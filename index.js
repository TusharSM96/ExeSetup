const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const unzipper = require("unzipper");
const app = express();
// Set up multer for file handling
const upload = multer({ dest: "uploads/" });
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  console.log("called");
  res.send(` 
    <html>
    <body>
      <h1>I am Test</h1>
      <form action="/submit" method="POST" enctype="multipart/form-data" onsubmit="return validateForm()">
        <label for="select1">Select 1:</label>
        <select name="select1" id="select1">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
        </select>
        <br/>
        <label for="select2">Select 2:</label>
        <select name="select2" id="select2">
            <option value="value1">Value 1</option>
            <option value="value2">Value 2</option>
        </select>
        <br/>
        <label for="file">File:</label>
        <br/>
        <input type="file" name="file" id="file">
        <button type="submit">Submit</button>
        <br/>
      </form>
      <script>
        function validateForm() {
          const fileInput = document.getElementById('file');
          if (fileInput.files.length === 0) {
            alert('Please select a file.');
            return false;
          }
          return true;
        }
      </script>
    </body>
    </html>
  `);
});

// Handle form submission with ZIP file upload
app.post("/submit", upload.single("file"), async (req, res) => {
  console.log(req.body);
  console.log(req.file); // Contains file information
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const uploadedZipPath = path.join(__dirname, req.file.path);
  const extractionPath = path.join(__dirname, "extracted_files");
  try {
    // Ensure extraction directory exists
    await fs.ensureDir(extractionPath);
    // Extract the ZIP file
    await fs.createReadStream(uploadedZipPath)
      .pipe(unzipper.Extract({ path: extractionPath }))
      .promise();

    // Optionally, delete the ZIP file after extraction
    await fs.remove(uploadedZipPath);
    // Optionally, list extracted files
    const files = await fs.readdir(extractionPath);
    res.send(` 
      <html>
        <h1>Form Submitted Successfully</h1>
        <p>Selected Option 1: ${req.body.select1}</p>
        <p>Selected Option 2: ${req.body.select2}</p>
        <p>File: ${req.file.originalname}</p>
        <p>Files extracted: ${files.join(', ')}</p>
      </html>
    `);
  } catch (err) {
    console.error('Error during extraction:', err);
    res.status(500).send("An error occurred during file extraction.");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
