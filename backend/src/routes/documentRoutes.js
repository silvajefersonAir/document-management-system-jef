const express = require('express');

function createDocumentRouter({ upload, documentController, getUserId }) {
  const router = express.Router();

  router.use((request, response, next) => {
    try {
      request.userId = getUserId(request);
      next();
    } catch (error) {
      next(error);
    }
  });

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = createDocumentRouter;
