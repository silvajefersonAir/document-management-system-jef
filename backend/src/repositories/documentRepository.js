class DocumentRepository {
  constructor() {
    this.documents = new Map();
  }

  create(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findById(id) {
    return this.documents.get(id) || null;
  }

  findByOwner(owner) {
    return [...this.documents.values()]
      .filter((document) => document.owner === owner)
      .sort((first, second) => (
        new Date(second.uploadedAt) - new Date(first.uploadedAt)
      ));
  }
}

module.exports = DocumentRepository;
