// Vérifie que :id a la forme d'un ObjectId MongoDB (24 caractères hexadécimaux)
function verifierId(req, res, next) {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({ erreur: 'id invalide' });
  }
  next();
}

module.exports = verifierId;