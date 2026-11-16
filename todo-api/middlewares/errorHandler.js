function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(`${req.method} ${req.originalUrl} - ${err.message}`);

 
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erreur: 'JSON invalide dans le corps de la requête' });
  }


  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ erreur: 'Données invalides', details });
  }

  
  if (err.name === 'CastError') {
    return res.status(400).json({ erreur: 'Identifiant invalide' });
  }

 
  if (err.code === 11000) {
    return res.status(409).json({ erreur: 'Cette valeur existe déjà' });
  }

  const statut = err.status || 500;
  const message = statut === 500 ? 'Erreur interne du serveur' : err.message;
  res.status(statut).json({ erreur: message });
}

module.exports = errorHandler;