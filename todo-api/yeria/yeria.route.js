// yeria/routes.js
const express = require('express');
const { yeriaApp, YeriaUI, requireYeriaUser } = require('./index');

const router = express.Router();
router.use(requireYeriaUser); // protège toutes les routes Yeria

router.get('/hello', (req, res) => {
  const view = YeriaUI.createReaderView('hello', 'Hello world')
    .addParagraph('Hello world !');
  res.json(yeriaApp.serve(view));
});

module.exports = router;