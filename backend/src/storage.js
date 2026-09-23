const path = require('node:path');

function resolveStorageDirectory() {
  const configuredDirectory = process.env.STORAGE_DIR;

  if (configuredDirectory && path.isAbsolute(configuredDirectory)) {
    return configuredDirectory;
  }

  return path.resolve(
    __dirname,
    '..',
    '..',
    configuredDirectory || path.join('backend', 'storage'),
  );
}

module.exports = { resolveStorageDirectory };