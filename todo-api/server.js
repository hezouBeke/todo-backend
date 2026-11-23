require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const { yeriaApp, YeriaUI, requireYeriaUser } = require('./yeria');
const yeriaRoute = require('./yeria/yeria.route');

if (!process.env.MONGODB_URI) {
  console.error('Variable manquante : MONGODB_URI');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Variable manquante : JWT_SECRET');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

const originesAutorisees = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || originesAutorisees.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origine non autorisée par CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(requestLogger);
app.use(express.json());

app.get('/', requireYeriaUser, (req, res, next) => {
  try {
    const form = yeriaApp
      .createFormView('user-registration', 'User Registration')
      .setIntro('Please fill in all required fields')
      .addTextField('firstName', 'First Name', true, 50)
      .addTextField('lastName', 'Last Name', true, 50)
      .addEmailField('email', 'Email Address', true)
      .addPhoneField('phone', 'Phone Number', false)
      .submitButton('Create Account', 'POST');

    // Adaptez selon la méthode de rendu de YeriaUI / FormView dans votre doc :
    // ex. YeriaUI.render(form) ou form.render() / form.toHTML() / form.toJSON()
    const output = typeof YeriaUI?.render === 'function' ? YeriaUI.render(form) : form;
    return res.send(output);
  } catch (err) {
    return next(err);
  }
});

app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);
app.use('/secure', yeriaRoute);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API lancée sur http://localhost:${PORT}`);
  });
});