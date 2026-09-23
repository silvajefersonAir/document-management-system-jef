const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Isola o storage dos testes em um diretório temporário antes de carregar o app,
// já que as rotas resolvem o diretório de armazenamento no momento do require.
const tempStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-storage-'));
process.env.STORAGE_DIR = tempStorageDir;

const app = require('../src/app');

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server.close();
  fs.rmSync(tempStorageDir, { recursive: true, force: true });
});

function uploadFile(fileName, content, userId = 'user-1') {
  const formData = new FormData();
  formData.set('file', new Blob([content]), fileName);

  return fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });
}

test('POST /upload envia um documento e retorna seus metadados', async () => {
  const response = await uploadFile('relatorio.txt', 'conteúdo do relatório');
  const body = await response.json();

  assert.strictEqual(response.status, 201);
  assert.ok(body.id, 'deve retornar um id');
  assert.strictEqual(body.originalName, 'relatorio.txt');
  assert.strictEqual(body.owner, 'user-1');
  assert.strictEqual(body.storedName, undefined, 'não deve expor o nome interno do arquivo');
});

test('POST /upload sem arquivo retorna erro 400', async () => {
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: new FormData(),
  });
  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error.code, 'FILE_REQUIRED');
});

test('GET /documents lista apenas os documentos do usuário informado', async () => {
  await uploadFile('doc-usuario-2.txt', 'conteúdo', 'user-2');

  const response = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.ok(Array.isArray(body.documents));
  assert.ok(
    body.documents.every((document) => document.owner === 'user-1'),
    'só devem aparecer documentos do dono correspondente',
  );
  assert.ok(
    body.documents.some((document) => document.originalName === 'relatorio.txt'),
  );
});

test('GET /documents/:id/download baixa o conteúdo original do arquivo', async () => {
  const uploadResponse = await uploadFile('download.txt', 'conteúdo para download');
  const { id } = await uploadResponse.json();

  const response = await fetch(`${baseUrl}/documents/${id}/download`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  const text = await response.text();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(text, 'conteúdo para download');
  assert.match(response.headers.get('content-disposition') || '', /download\.txt/);
});

test('GET /documents/:id/download retorna 404 para documento inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/id-inexistente/download`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 404);
  assert.strictEqual(body.error.code, 'DOCUMENT_NOT_FOUND');
});

test('GET /documents/:id/download retorna 403 quando o dono é diferente', async () => {
  const uploadResponse = await uploadFile('privado.txt', 'segredo', 'user-1');
  const { id } = await uploadResponse.json();

  const response = await fetch(`${baseUrl}/documents/${id}/download`, {
    headers: { 'X-User-Id': 'user-2' },
  });
  const body = await response.json();

  assert.strictEqual(response.status, 403);
  assert.strictEqual(body.error.code, 'DOCUMENT_ACCESS_DENIED');
});
