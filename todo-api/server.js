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

app.get('/', requireYeriaUser, (req, res) => {
  const view = YeriaUI.createReaderView('hello', 'Hello world')
    .addParagraph('Hello world !');
  res.json(yeriaApp.serve(view));
});
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);
app.use('/secure', require('./yeria/yeria.route'));

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API lancée sur http://localhost:${PORT}`);
  });
});