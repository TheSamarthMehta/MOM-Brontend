import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents and images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const router = express.Router();

// Upload document file (after document record is created)
router.post('/document/:documentId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentId } = req.params;
    const MeetingDocument = (await import('../models/MeetingDocument.js')).default;
    
    // Update the existing document record with file information
    const document = await MeetingDocument.findByIdAndUpdate(
      documentId,
      {
        documentPath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      },
      { new: true }
    );

    if (!document) {
      // Clean up uploaded file if document doesn't exist
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        documentId: document._id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Upload document (legacy route - creates both record and uploads file)
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { meetingId, documentName, remarks } = req.body;

    // Create document record in database
    const MeetingDocument = (await import('../models/MeetingDocument.js')).default;
    
    const document = await MeetingDocument.create({
      meetingId,
      documentName: documentName || req.file.originalname,
      documentPath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      remarks
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        documentId: document._id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Download document
router.get('/document/:documentId', async (req, res) => {
  try {
    const MeetingDocument = (await import('../models/MeetingDocument.js')).default;
    const document = await MeetingDocument.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!document.documentPath || !fs.existsSync(document.documentPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(document.documentPath, document.documentName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Delete document file
router.delete('/document/:documentId', async (req, res) => {
  try {
    const MeetingDocument = (await import('../models/MeetingDocument.js')).default;
    const document = await MeetingDocument.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (document.documentPath && fs.existsSync(document.documentPath)) {
      fs.unlink(document.documentPath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    // Delete document record from database
    await MeetingDocument.findByIdAndDelete(req.params.documentId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
});

export default router;
