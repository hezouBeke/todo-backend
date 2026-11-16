function notFound(req, res, next) {
  res.status(404).json({ erreur: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

module.exports = notFound;