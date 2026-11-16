const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');

function genererToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

function reponseUtilisateur(user) {
  return { _id: user._id, nom: user.nom, email: user.email, role: user.role };
}

// POST /auth/register
const register = asyncHandler(async (req, res) => {
  const { nom, email, motDePasse } = req.body || {};
  const user = await User.create({ nom, email, motDePasse });

  res.status(201).json({ user: reponseUtilisateur(user) });
});
// POST /auth/login
const login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body || {};
  if (typeof email !== 'string' || typeof motDePasse !== 'string') {
    return res.status(400).json({ erreur: 'email et motDePasse sont obligatoires' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+motDePasse');
  const motDePasseOk = user && (await user.comparerMotDePasse(motDePasse));

  if (!motDePasseOk) {
    return res.status(401).json({ erreur: 'Identifiants invalides' });
  }

  res.json({ user: reponseUtilisateur(user), token: genererToken(user) });
});

// GET /auth/me
const me = (req, res) => {
  res.json(reponseUtilisateur(req.user));
};

module.exports = { register, login, me };