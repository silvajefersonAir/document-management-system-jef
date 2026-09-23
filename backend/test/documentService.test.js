const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const DocumentRepository = require('../src/repositories/documentRepository');
const FileRepository = require('../src/repositories/fileRepository');
const DocumentService = require('../src/services/documentService');

test('isola documentos por proprietário e normaliza o nome original', () => {
  const documentRepository = new DocumentRepository();
  const fileRepository = {
    remove() {},
    fileExists() { return true; },
    getFilePath() { return '/tmp/document'; },
  };
  const service = new DocumentService(documentRepository, fileRepository);

  const document = service.createDocument({
    filename: 'stored-file',
    originalname: '../relatorio\n.pdf',
    size: 10,
    mimetype: 'application/pdf',
  }, 'owner-a');

  assert.equal(document.originalName, '.._relatorio_.pdf');
  assert.equal(service.listDocuments('owner-a').length, 1);
  assert.deepEqual(service.listDocuments('owner-b'), []);
  assert.throws(
    () => service.getDownload(document.id, 'owner-b'),
    (error) => error.code === 'DOCUMENT_ACCESS_DENIED' && error.status === 403,
  );
});

test('rejeita caminhos fora do diretório de storage', () => {
  const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-storage-'));
  const fileRepository = new FileRepository(storageDirectory);

  assert.throws(
    () => fileRepository.getFilePath({ storedName: '../outside.txt' }),
    (error) => error.code === 'INVALID_STORAGE_PATH' && error.status === 400,
  );

  fs.rmSync(storageDirectory, { recursive: true, force: true });
});

test('remove arquivo quando o registro de metadados falha', () => {
  let removedDocument;
  const documentRepository = {
    create() {
      throw new Error('metadata failure');
    },
  };
  const fileRepository = {
    remove(document) {
      removedDocument = document;
    },
  };
  const service = new DocumentService(documentRepository, fileRepository);

  assert.throws(() => service.createDocument({ filename: 'orphaned-file' }, 'owner-a'));
  assert.deepEqual(removedDocument, { storedName: 'orphaned-file' });
});
