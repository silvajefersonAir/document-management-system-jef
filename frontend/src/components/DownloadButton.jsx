import { useState } from 'react';
import { downloadDocument } from '../services/documentService';

export default function DownloadButton({ document, userId = 'anonymous' }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setErrorMessage('');

    try {
      const result = await downloadDocument(document.id, userId);
      const objectUrl = URL.createObjectURL(result.blob);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = result.fileName || document.originalName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span className="download-action">
      <button type="button" onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {errorMessage && <span className="error-message" role="alert">{errorMessage}</span>}
    </span>
  );
}
