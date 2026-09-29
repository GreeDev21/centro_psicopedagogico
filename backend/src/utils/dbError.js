const SIN_ACCESO = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'EAI_AGAIN',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'ER_ACCESS_DENIED_ERROR',
  'ER_DBACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE',
  'ER_SERVER_SHUTDOWN'
]);

function sinAccesoBd(err) {
  if (!err) return false;
  if (SIN_ACCESO.has(err.code)) return true;
  return /ECONNREFUSED|connect ETIMEDOUT|getaddrinfo|Access denied|Unknown database/i.test(String(err.message || ''));
}

module.exports = { sinAccesoBd };
