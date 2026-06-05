import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import { hashPassword, verifyPassword } from '../hash.js';
import { getRecommendations } from '../services/recommendationEngine.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await appDataSource.getRepository(User).find();
    res.json({ users });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const repo = appDataSource.getRepository(User);
    const user = repo.create({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: await hashPassword(req.body.password),
    });
    const saved = await repo.save(user);
    res.status(201).json({ message: 'Compte créé avec succès.', id: saved.id });
  } catch (error) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: `L'adresse "${req.body.email}" est déjà utilisée.` });
    }
    res.status(500).json({ message: 'Erreur lors de la création du compte.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const repo = appDataSource.getRepository(User);
    const user = await repo.findOne({
      where: { email: req.body.email },
      select: { id: true, email: true, password: true },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const valid = await verifyPassword(req.body.password, user.password);
    if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, email: user.email });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    await appDataSource.getRepository(User).delete({ id: req.params.userId });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

router.get('/:userId/recommendations', async (req, res) => {
  try {
    const recommendations = await getRecommendations(parseInt(req.params.userId, 10));
    res.json({ recommendations });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la génération des recommandations.' });
  }
});

export default router;
