import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import {hashPassword, verifyPassword} from '../hash.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', function (req, res) {
  appDataSource
    .getRepository(User)
    .find({})
    .then(function (users) {
      res.json({ users: users });
    });
});

// // Dans ton routeur express (users.js)
// router.get('/:userId/recommendations', function (req, res) {
//   const userId = req.params.userId;
// });

router.post('/new', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });

  userRepository
    .save(newUser)
    .then(function (savedUser) {
      res.status(201).json({
        message: 'User successfully created',
        id: savedUser.id,
      });
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `User with email "${newUser.email}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the user' });
      }
    });
});

router.post('/register', async function (req, res) {
  try {
    const userRepository = appDataSource.getRepository(User);

    const newUser = userRepository.create({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: await hashPassword(req.body.password),
    });

    const savedUser = await userRepository.save(newUser);
    res.status(201).json({ message: 'User successfully created', id: savedUser.id });
  } catch (error) {
    console.error(error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: `User with email "${req.body.email}" already exists` });
    } else {
      res.status(500).json({ message: 'Error while creating the user' });
    }
  }
});

router.post('/login', async function (req, res) {
  try {
    const userRepository = appDataSource.getRepository(User);
    const { email, password } = req.body;

    const user = await userRepository.findOne({ where: { email }, select: { id: true, email: true, password: true } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while logging in' });
  }
});

router.delete('/:userId', function (req, res) {
  appDataSource
    .getRepository(User)
    .delete({ id: req.params.userId })
    .then(function () {
      res.status(204).json({ message: 'User successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the user' });
    });
});

export default router;
