export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}
