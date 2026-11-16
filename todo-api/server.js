require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');


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


app.use(requestLogger);
app.use(express.json());


app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);


app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API lancée sur http://localhost:${PORT}`);
  });
});