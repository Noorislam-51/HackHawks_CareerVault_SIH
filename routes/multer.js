const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get original file extension
    const uniqueFilename = uuidv4(); // Generate UUID
    cb(null, uniqueFilename + ext);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
