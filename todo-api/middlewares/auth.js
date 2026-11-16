const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const auth = asyncHandler(async (req, res, next) => {
  
  const entete = req.headers.authorization || '';
  const [type, token] = entete.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ erreur: 'Token manquant' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide';
    return res.status(401).json({ erreur: message });
  }

  const user = await User.findById(payload.id);
  if (!user) {
    return res.status(401).json({ erreur: 'Utilisateur introuvable' });
  }

  req.user = user;   // les routes suivantes savent qui est connecté
  next();
});

module.exports = auth;