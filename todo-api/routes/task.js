const express = require('express');
const auth = require('../middlewares/auth');
const verifierId = require('../middlewares/verifierId');
const {
  listerTaches,
  statistiques,
  obtenirTache,
  creerTache,
  remplacerTache,
  modifierTache,
  supprimerTache,
} = require('../controllers/task.controller');

const router = express.Router();


router.use(auth);


router.get('/', listerTaches);
router.get('/stats', statistiques);

router.get('/:id', verifierId, obtenirTache);
router.post('/', creerTache);
router.put('/:id', verifierId, remplacerTache);
router.patch('/:id', verifierId, modifierTache);
router.delete('/:id', verifierId, supprimerTache);

module.exports = router;