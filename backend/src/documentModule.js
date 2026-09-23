const crypto = require('node:crypto');
const multer = require('multer');
const DocumentRepository = require('./repositories/documentRepository');
const FileRepository = require('./repositories/fileRepository');
const DocumentService = require('./services/documentService');
const DocumentController = require('./controllers/documentController');
const { resolveStorageDirectory } = require('./storage');

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function getMaxFileSize() {
  const configuredSize = Number(process.env.MAX_FILE_SIZE);
  return Number.isInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : DEFAULT_MAX_FILE_SIZE;
}

function createUploadMiddleware(storageDirectory) {
  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename: (request, file, callback) => {
      callback(null, crypto.randomUUID());
    },
  });

  return multer({
    storage,
    limits: { fileSize: getMaxFileSize() },
    fileFilter: (request, file, callback) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error('Tipo de arquivo não permitido.');
        error.status = 415;
        error.code = 'FILE_TYPE_NOT_ALLOWED';
        callback(error);
        return;
      }

      callback(null, true);
    },
  });
}

function getUserId(request) {
  const configuredUser = process.env.DEFAULT_USER_ID || 'anonymous';
  const canTrustHeader = process.env.NODE_ENV !== 'production'
    && process.env.TRUST_USER_HEADER !== 'false';
  const userId = canTrustHeader
    ? request.get('X-User-Id') || configuredUser
    : configuredUser;

  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(userId)) {
    const error = new Error('Identificador de usuário inválido.');
    error.status = 400;
    error.code = 'INVALID_USER_ID';
    throw error;
  }

  return userId;
}

function createDocumentModule() {
  const storageDirectory = resolveStorageDirectory();
  const upload = createUploadMiddleware(storageDirectory);
  const documentRepository = new DocumentRepository();
  const fileRepository = new FileRepository(storageDirectory);
  const documentService = new DocumentService(documentRepository, fileRepository);
  const documentController = new DocumentController(documentService);

  return {
    upload,
    documentController,
    getUserId,
  };
}

module.exports = { createDocumentModule, getMaxFileSize, allowedMimeTypes };
