////constant vasiable
const path = require("path");
const os = require("os");
let uploadZipPath = path.join(os.tmpdir(), "myapp", "uploads");
let ExtarctedipTempPath = path.join(os.tmpdir(), "myapp", "TempZipFiles");
let ExtarctedFilesPath = path.join(os.tmpdir(), "myapp", "ExtractedFiles");
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: uploadZipPath });
const api = express();
const fs = require("fs-extra");
const unzipper = require("unzipper");
api.use(express.json());
api.use(express.urlencoded({ extended: false }));
api.post("/uploadzipp", upload.single("zipfile"), async (req, res) => {
  const filePath = path.join(uploadZipPath, req.file.filename);
  try {
    // Ensure the directories exist
    await fs.ensureDir(ExtarctedipTempPath);
    await fs.ensureDir(ExtarctedFilesPath);
    // // Unzip the uploaded file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(unzipper.Extract({ path: ExtarctedipTempPath }))
        .on("close", resolve)
        .on("error", reject);
    });
    let InsideFolderFilePath = req.file.originalname.split(".")[0];
    let ZippTempFolderPath = path.join(
      ExtarctedipTempPath,
      InsideFolderFilePath
    );
    ///let Empty Uploads File Dir
    const ReadAllFilesInsideFolder = fs.readdirSync(ZippTempFolderPath);
    let CopyPath = ReadAllFilesInsideFolder?.map((val) =>
      fs.cpSync(
        path.join(ZippTempFolderPath, val),
        path.join(ExtarctedFilesPath, val),
        { recursive: true, force: true }
      )
    );
    fs.rmSync(ZippTempFolderPath, { recursive: true, force: true })
  } catch (error) {
    res.status(500).send("Error processing the file.");
  }
});
api.listen(9000);
