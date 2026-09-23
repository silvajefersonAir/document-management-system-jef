const fs = require('node:fs');
const path = require('node:path');
const { resolveStorageDirectory } = require('../storage');

class FileRepository {
  constructor(storageDirectory = resolveStorageDirectory()) {
    this.storageDirectory = path.resolve(storageDirectory);
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(document) {
    const filePath = path.resolve(this.storageDirectory, document.storedName);
    const storagePrefix = `${this.storageDirectory}${path.sep}`;

    if (!filePath.startsWith(storagePrefix)) {
      const error = new Error('Caminho de arquivo inválido.');
      error.status = 400;
      error.code = 'INVALID_STORAGE_PATH';
      throw error;
    }

    return filePath;
  }

  fileExists(document) {
    return fs.existsSync(this.getFilePath(document));
  }

  remove(document) {
    const filePath = this.getFilePath(document);
    fs.rmSync(filePath, { force: true });
  }
}

module.exports = FileRepository;
