const express = require('express');
const multer = require('multer');
const path = require('node:path');
const DocumentRepository = require('../repositories/documentRepository');
const FileRepository = require('../repositories/fileRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');
const { resolveStorageDirectory } = require('../storage');

const storageDirectory = resolveStorageDirectory();

const uploadStorage = multer.diskStorage({
  destination: storageDirectory,
  filename: (request, file, callback) => {
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
  },
});

const documentRepository = new DocumentRepository();
const fileRepository = new FileRepository(storageDirectory);
const documentService = new DocumentService(documentRepository, fileRepository);
const documentController = new DocumentController(documentService);
const router = express.Router();

router.use((req, res, next) => {
  req.userId = req.get('X-User-Id') || process.env.DEFAULT_USER_ID || 'anonymous';
  next();
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
