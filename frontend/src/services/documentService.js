const API_PREFIX = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_PREFIX}${endpoint}`, options);
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.blob();

  if (!response.ok) {
    const message = body?.error?.message || 'Não foi possível concluir a operação.';
    const error = new Error(message);
    error.code = body?.error?.code || 'REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }

  return { body, response };
}

export async function listDocuments(userId = 'anonymous') {
  const { body } = await request('/documents', {
    headers: { 'X-User-Id': userId },
  });

  return body.documents;
}

export async function uploadDocument(file, userId = 'anonymous') {
  const formData = new FormData();
  formData.append('file', file);

  const { body } = await request('/upload', {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });

  return body;
}

export async function downloadDocument(documentId, userId = 'anonymous') {
  const { body, response } = await request(`/documents/${documentId}/download`, {
    headers: { 'X-User-Id': userId },
  });

  return {
    blob: body,
    fileName: getFileName(response.headers.get('content-disposition')),
  };
}

function getFileName(contentDisposition) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || 'documento';
}
