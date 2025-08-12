import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

// Type definitions for upload response
interface FileInfo {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  type?: string;
  isValid?: boolean;
  error?: string;
  preview?: {
    hasVehicles: boolean;
    hasSignals: boolean;
    vehicleCount: number;
    signalCount: number;
  };
}

interface UploadResponse {
  message: string;
  file: FileInfo;
}

interface ErrorResponse {
  error: string;
}

interface FileListItem {
  filename: string;
  path: string;
  size: number;
  created: string;
  modified: string;
}

interface FileListResponse {
  files: FileListItem[];
}

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter to allow only certain file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/json',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
// POST /api/uploads/scenario - Upload scenario file
router.post('/scenario', upload.single('scenario'), async (req: Request, res: Response<UploadResponse | ErrorResponse>) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    const filePath = req.file.path;
    const fileInfo: FileInfo = {
      id: path.basename(filePath, path.extname(filePath)),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: filePath,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    // If it's a JSON file, try to parse it to validate structure
    if (req.file.mimetype === 'application/json') {
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const parsedContent = JSON.parse(fileContent);
        
        // Basic validation for scenario structure
        if (parsedContent && typeof parsedContent === 'object') {
          fileInfo.isValid = true;
          fileInfo.preview = {
            hasVehicles: Array.isArray(parsedContent.vehicles),
            hasSignals: Array.isArray(parsedContent.signals),
            vehicleCount: parsedContent.vehicles ? parsedContent.vehicles.length : 0,
            signalCount: parsedContent.signals ? parsedContent.signals.length : 0
          };
        }
      } catch (parseError) {
        fileInfo.isValid = false;
        fileInfo.error = 'Invalid JSON format';
      }
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// POST /api/uploads/data - Upload traffic data file (CSV/Excel)
router.post('/data', upload.single('data'), async (req: Request, res: Response<UploadResponse | ErrorResponse>) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    const filePath = req.file.path;
    const fileInfo: FileInfo = {
      id: path.basename(filePath, path.extname(filePath)),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: filePath,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      type: 'data'
    };

    res.status(201).json({
      message: 'Data file uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload data file' });
  }
});

// GET /api/uploads - List uploaded files
router.get('/', async (req: Request, res: Response<FileListResponse | ErrorResponse>) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    if (!await fs.pathExists(uploadsDir)) {
      return res.json({ files: [] });
    }

    const files = await fs.readdir(uploadsDir);
    const fileList: FileListItem[] = [];
    
    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = await fs.stat(filePath);
      
      fileList.push({
        filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString()
      });
    }

    res.json({ files: fileList });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// DELETE /api/uploads/:filename - Delete uploaded file
router.delete('/:filename', async (req: Request, res: Response<void | ErrorResponse>) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.remove(filePath);
    res.status(204).send();
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// GET /api/uploads/:filename/download - Download file
router.get('/:filename/download', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;
