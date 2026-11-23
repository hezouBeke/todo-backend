require('dotenv').config();
const {
  YeriaApp, YeriaUI,
  SignatureVerificationError, ViewExpiredError, YeriaPlatformUnreachableError,
} = require('@numerum-tech/yeriasdk');

const yeriaApp = new YeriaApp({
  appId: process.env.YERIA_APP_ID,
  baseUrl: process.env.YERIA_BASE_URL,
  privateKey: process.env.SERVICE_ED25519_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

async function requireYeriaUser(req, res, next) {
  const auth = req.headers.authorization ?? '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!bearer) return res.status(401).json({ error: 'missing token' });

  try {
    req.yeriaUser = await yeriaApp.verifyUserToken(bearer, process.env.YERIA_SERVICE_ID);
    next();
   } catch (err) {
    console.error('Erreur Yeria :', err.name, '-', err.message);

    if (err instanceof ViewExpiredError) return res.status(401).json({ error: 'token expired' });
    if (err instanceof SignatureVerificationError) return res.status(401).json({ error: 'invalid token' });
    if (err instanceof YeriaPlatformUnreachableError) return res.status(503).json({ error: 'yeria unreachable' });
    return res.status(500).json({ error: `auth error: ${err.message}` });
  }
}

module.exports = { yeriaApp, YeriaUI, requireYeriaUser };