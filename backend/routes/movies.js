import express from 'express';
import { Like } from 'typeorm';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movies.js';
import LikeEntity from '../entities/like.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const repo = appDataSource.getRepository(Movie);
    const movies = req.query.name
      ? await repo.find({ where: { name: Like(`%${req.query.name}%`) } })
      : await repo.find();
    res.json(movies);
  } catch {
    res.status(500).json({ message: 'Erreur lors de la récupération des films.' });
  }
});

router.get('/user/liked', requireAuth, async (req, res) => {
  try {
    const likes = await appDataSource.getRepository(LikeEntity).find({
      where: { user: { id: req.user.userId }, isLike: true },
      relations: ['movie'],
    });
    res.json(likes.map(l => l.movie));
  } catch {
    res.status(500).json({ message: 'Erreur lors de la récupération des films aimés.' });
  }
});

router.get('/:id/reaction', requireAuth, async (req, res) => {
  try {
    const reaction = await appDataSource.getRepository(LikeEntity).findOne({
      where: { user: { id: req.user.userId }, movie: { id: req.params.id } },
    });
    res.json({ isLike: reaction?.isLike ?? null });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la récupération de la réaction.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await appDataSource.getRepository(Movie).findOneBy({ id: req.params.id });
    if (!movie) return res.status(404).json({ message: 'Film introuvable.' });
    res.json(movie);
  } catch {
    res.status(500).json({ message: 'Erreur interne.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const repo = appDataSource.getRepository(Movie);
    const movie = await repo.findOneBy({ id: req.params.id });
    if (!movie) return res.status(404).json({ message: 'Film introuvable.' });
    await repo.remove(movie);
    res.json({ message: `Film "${movie.name}" supprimé.` });
  } catch {
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

router.post('/:movieId/react', requireAuth, async (req, res) => {
  try {
    const { isLike } = req.body;
    const likeRepo = appDataSource.getRepository(LikeEntity);
    const existing = await likeRepo.findOne({
      where: { user: { id: req.user.userId }, movie: { id: req.params.movieId } },
    });

    if (existing) {
      if (existing.isLike !== isLike) {
        existing.isLike = isLike;
        await likeRepo.save(existing);
        return res.json({ message: 'Réaction mise à jour.', isLike: existing.isLike });
      }
      await likeRepo.remove(existing);
      return res.json({ message: 'Réaction supprimée.', isLike: null });
    }

    const reaction = likeRepo.create({ isLike, user: { id: req.user.userId }, movie: { id: req.params.movieId } });
    await likeRepo.save(reaction);
    res.status(201).json({ message: 'Réaction enregistrée.', isLike: reaction.isLike });
  } catch {
    res.status(500).json({ message: 'Erreur lors du traitement de la réaction.' });
  }
});

export default router;
