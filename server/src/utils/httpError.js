/** Error carrying an HTTP status; errorHandler turns it into a JSON response. */
export function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
}
