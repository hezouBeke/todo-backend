const Task = require('../models/Task');
const asyncHandler = require('../middlewares/asyncHandler');

const STATUTS = ['a_faire', 'en_cours', 'termine'];
const CHAMPS_AUTORISES = ['titre', 'description', 'statut', 'priorite', 'dateLimite'];


function champsAutorises(body) {
  const champs = {};
  for (const cle of CHAMPS_AUTORISES) {
    if (body && body[cle] !== undefined) {
      champs[cle] = body[cle];
    }
  }
  return champs;
}


function echapperRegex(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /tasks  (filtres : ?statut=en_cours  ?priorite=haute  ?q=mot)
const listerTaches = asyncHandler(async (req, res) => {
  const { statut, priorite, q } = req.query;
  const filtre = { user: req.user._id };           

  if (statut !== undefined) {
    if (!STATUTS.includes(statut)) {
      return res.status(400).json({ erreur: 'statut doit valoir a_faire, en_cours ou termine' });
    }
    filtre.statut = statut;
  }

  if (typeof priorite === 'string') {
    filtre.priorite = priorite;
  }

  if (typeof q === 'string' && q !== '') {
    filtre.titre = { $regex: echapperRegex(q), $options: 'i' };
  }

  const taches = await Task.find(filtre).sort({ createdAt: -1 });
  res.json(taches);
});

// GET /tasks/stats
const statistiques = asyncHandler(async (req, res) => {
  const resultat = await Task.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$statut', total: { $sum: 1 } } },
  ]);

  const stats = { total: 0, a_faire: 0, en_cours: 0, termine: 0 };
  for (const ligne of resultat) {
    stats[ligne._id] = ligne.total;
    stats.total += ligne.total;
  }

  res.json(stats);
});

// GET /tasks/:id
const obtenirTache = asyncHandler(async (req, res) => {
  const tache = await Task.findOne({ _id: req.params.id, user: req.user._id });

  if (!tache) {
    return res.status(404).json({ erreur: 'Tâche introuvable' });
  }
  res.json(tache);
});

// POST /tasks
const creerTache = asyncHandler(async (req, res) => {
  const tache = await Task.create({
    ...champsAutorises(req.body),
    user: req.user._id,                            
  });

  res.status(201).json(tache);
});

// PUT /tasks/:id : remplace (titre et statut obligatoires)
const remplacerTache = asyncHandler(async (req, res) => {
  const champs = champsAutorises(req.body);

  if (champs.titre === undefined || champs.statut === undefined) {
    return res.status(400).json({ erreur: 'titre et statut sont obligatoires pour un PUT' });
  }

  const tache = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    champs,
    { new: true, runValidators: true }
  );

  if (!tache) {
    return res.status(404).json({ erreur: 'Tâche introuvable' });
  }
  res.json(tache);
});

// PATCH /tasks/:id : modifie seulement les champs envoyés
const modifierTache = asyncHandler(async (req, res) => {
  const champs = champsAutorises(req.body);

  if (Object.keys(champs).length === 0) {
    return res.status(400).json({ erreur: 'envoie au moins un champ à modifier' });
  }

  const tache = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    champs,
    { new: true, runValidators: true }
  );

  if (!tache) {
    return res.status(404).json({ erreur: 'Tâche introuvable' });
  }
  res.json(tache);
});

// DELETE /tasks/:id
const supprimerTache = asyncHandler(async (req, res) => {
  const tache = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!tache) {
    return res.status(404).json({ erreur: 'Tâche introuvable' });
  }
  res.status(204).send();
});

module.exports = {
  listerTaches,
  statistiques,
  obtenirTache,
  creerTache,
  remplacerTache,
  modifierTache,
  supprimerTache,
};