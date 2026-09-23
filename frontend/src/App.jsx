import { useEffect, useState } from 'react';
import './App.css';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentService';

const USER_ID = 'anonymous';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        const loadedDocuments = await listDocuments(USER_ID);
        if (isMounted) setDocuments(loadedDocuments);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDocuments();
    return () => { isMounted = false; };
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setErrorMessage('');
  }

  return (
    <main className="app-shell">
      <div className="app-content">
        <p className="eyebrow">Document Management System</p>
        <h1>Seus documentos, em um só lugar.</h1>
        <p className="intro">Envie arquivos, acompanhe seus documentos e baixe o que precisar.</p>

        <section className="panel" aria-labelledby="upload-title">
          <h2 id="upload-title">Enviar documento</h2>
          <UploadComponent onUploaded={handleUploaded} userId={USER_ID} />
        </section>

        <section className="panel" aria-labelledby="documents-title">
          <h2 id="documents-title">Documentos enviados</h2>
          {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
          {isLoading ? <p className="empty-state">Carregando documentos...</p> : (
            <DocumentList documents={documents} userId={USER_ID} />
          )}
        </section>
      </div>
    </main>
  );
}
