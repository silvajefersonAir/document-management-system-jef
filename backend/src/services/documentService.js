const crypto = require('node:crypto');

class DocumentService {
  constructor(documentRepository, fileRepository) {
    this.documentRepository = documentRepository;
    this.fileRepository = fileRepository;
  }

  createDocument(file, owner) {
    if (!file) {
      throw this.createError(400, 'FILE_REQUIRED', 'Um arquivo deve ser enviado.');
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      owner,
    };

    return this.toPublicDocument(this.documentRepository.create(document));
  }

  listDocuments(owner) {
    return this.documentRepository
      .findByOwner(owner)
      .map((document) => this.toPublicDocument(document));
  }

  getDownload(documentId, owner) {
    const document = this.documentRepository.findById(documentId);

    if (!document) {
      throw this.createError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    if (document.owner !== owner) {
      throw this.createError(403, 'DOCUMENT_ACCESS_DENIED', 'Acesso ao documento negado.');
    }

    if (!this.fileRepository.fileExists(document)) {
      throw this.createError(404, 'DOCUMENT_NOT_FOUND', 'Arquivo não encontrado.');
    }

    return {
      document: this.toPublicDocument(document),
      filePath: this.fileRepository.getFilePath(document),
    };
  }

  toPublicDocument(document) {
    const { storedName, ...publicDocument } = document;
    return publicDocument;
  }

  createError(status, code, message) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
  }
}

module.exports = DocumentService;
