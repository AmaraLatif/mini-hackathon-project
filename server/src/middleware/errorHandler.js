export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Malformed JSON bodies arrive as 400 from express.json(); treat them as client errors.
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  const body = { error: status >= 500 ? 'Something went wrong on the server.' : err.message };
  if (status < 500 && err.details) Object.assign(body, err.details);
  res.status(status).json(body);
}
