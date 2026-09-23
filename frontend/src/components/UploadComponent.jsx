import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ onUploaded, userId = 'anonymous' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const document = await uploadDocument(selectedFile, userId);
      setSelectedFile(null);
      event.target.reset();
      onUploaded(document);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="document-file">Escolha um documento</label>
      <div className="upload-controls">
        <input
          id="document-file"
          type="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </div>
      {selectedFile && <p className="file-selection">Selecionado: {selectedFile.name}</p>}
      {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
    </form>
  );
}
