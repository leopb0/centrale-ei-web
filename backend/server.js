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
  const repo = appDataSource.getRepository(User);
  const exists = await repo.findOne({ where: { email: 'dev@gmail.com' } });
  if (!exists) {
    await repo.save(repo.create({
      email: 'dev@gmail.com',
      firstname: 'Dev',
      lastname: 'Admin',
      password: await hashPassword('dev'),
    }));
  }
};

const startServer = async () => {
  await ensureDevAccount();

  const app = express();
  app.use(logger('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/movies', moviesRouter);
  app.use('/recommandations', recommandationsRouter);

  app.use(routeNotFoundJsonHandler);
  app.use(jsonErrorHandler);

  const port = parseInt(process.env.PORT || '8000');
  app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
};

appDataSource
  .initialize()
  .then(startServer)
  .catch(err => console.error('Erreur d\'initialisation de la base de données :', err));
