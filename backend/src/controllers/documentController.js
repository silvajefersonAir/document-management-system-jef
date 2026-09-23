class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this);
  }

  upload(req, res) {
    const document = this.documentService.createDocument(req.file, req.userId);
    res.status(201).json(document);
  }

  list(req, res) {
    const documents = this.documentService.listDocuments(req.userId);
    res.json({ documents });
  }

  download(req, res, next) {
    try {
      const { document, filePath } = this.documentService.getDownload(
        req.params.id,
        req.userId,
      );

      res.download(filePath, document.originalName, (error) => {
        if (error && !res.headersSent) {
          if (error.code === 'ENOENT') {
            error.status = 404;
            error.code = 'DOCUMENT_NOT_FOUND';
            error.message = 'Arquivo não encontrado.';
          }
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentController;
