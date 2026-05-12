export const errorMiddleware = (
  err,
  req,
  res,
  next
) => {

  console.error(err);

  const status =
    err.statusCode || 500;

  const message =
    err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    error: message
  });

};