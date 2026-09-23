import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, userId = 'anonymous' }) {
  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento enviado ainda.</p>;
  }

  return (
    <div className="document-list" aria-live="polite">
      {documents.map((document) => (
        <article className="document-row" key={document.id}>
          <div>
            <h3>{document.originalName}</h3>
            <p>{formatFileSize(document.size)} · Enviado em {formatDate(document.uploadedAt)}</p>
          </div>
          <DownloadButton document={document} userId={userId} />
        </article>
      ))}
    </div>
  );
}
