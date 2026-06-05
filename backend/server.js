import cors from 'cors';
import express from 'express';
import logger from 'morgan';
import { appDataSource } from './datasource.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import moviesRouter from './routes/movies.js';
import recommandationsRouter from './routes/recommandations.js';
import { jsonErrorHandler } from './services/jsonErrorHandler.js';
import { routeNotFoundJsonHandler } from './services/routeNotFoundJsonHandler.js';
import User from './entities/user.js';
import { hashPassword } from './hash.js';

const ensureDevAccount = async () => {
  const userRepository = appDataSource.getRepository(User);
  const existing = await userRepository.findOne({ where: { email: 'dev@gmail.com' } });
  if (!existing) {
    const devUser = userRepository.create({
      email: 'dev@gmail.com',
      firstname: 'Dev',
      lastname: 'Admin',
      password: await hashPassword('dev'),
    });
    await userRepository.save(devUser);
    console.log('Dev account created: dev@gmail.com / dev');
  }
};

const startServer = async () => {
  console.log('Data Source has been initialized!');
  await ensureDevAccount();
  const app = express();

  app.use(logger('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register routes
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/movies', moviesRouter);
  app.use('/recommandations', recommandationsRouter);

  // Register 404 middleware and error handler
  app.use(routeNotFoundJsonHandler); // this middleware must be registered after all routes to handle 404 correctly
  app.use(jsonErrorHandler); // this error handler must be registered after all middleware to catch all errors

  const port = parseInt(process.env.PORT || '8000');

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};

// 1. starts only the server
// startServer();

// 2. starts the database connection first then starts the server
appDataSource
  .initialize()
  .then(startServer)
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
