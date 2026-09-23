const fs = require('node:fs');
const path = require('node:path');
const { resolveStorageDirectory } = require('../storage');

class FileRepository {
  constructor(storageDirectory = resolveStorageDirectory()) {
    this.storageDirectory = path.resolve(storageDirectory);
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  getFilePath(document) {
    return path.join(this.storageDirectory, document.storedName);
  }

  fileExists(document) {
    return fs.existsSync(this.getFilePath(document));
  }
}

module.exports = FileRepository;
