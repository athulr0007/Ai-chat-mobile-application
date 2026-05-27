const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { transcribeAudio } = require('../services/groq');

// Configure Multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Preserving the extension (e.g. .m4a or .caf) sent by expo-av
    const ext = path.extname(file.originalname) || '.m4a';
    cb(null, 'voice-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max limit
});

/**
 * @route   POST /voice/transcribe
 * @desc    Upload recorded audio and return transcription from Groq Whisper API
 * @access  Private
 */
router.post('/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`Received audio upload. Saving to: ${filePath}`);

    // Call transcription service
    const transcriptionText = await transcribeAudio(filePath);

    // Clean up/delete the file from disk asynchronously
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp audio file:', err);
    });

    // Send back transcription
    res.json({ text: transcriptionText });
  } catch (err) {
    console.error('Transcription route error:', err);
    
    // Clean up file if it still exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({ msg: 'Failed to transcribe audio', error: err.message });
  }
});

module.exports = router;
