import express from 'express';
import { In, Not } from 'typeorm';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import LikeEntity from '../entities/like.js';
import Movie from '../entities/movies.js';
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

router.get('/:userId/recommendations', async function (req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const likeRepository = appDataSource.getRepository(LikeEntity);
    const movieRepository = appDataSource.getRepository(Movie);

    // --- POIDS DE L'ALGORITHME (Ajustables) ---
    const WEIGHT_GENRE = 0.5; // Poids accordÃ© aux genres prÃ©fÃ©rÃ©s (50%)
    const WEIGHT_COLLAB = 0.5; // Poids accordÃ© aux utilisateurs similaires (50%)

    // ==========================================
    // Ã‰TAPE 1 : Analyser le profil de l'utilisateur
    // ==========================================
    // On rÃ©cupÃ¨re toutes les rÃ©actions de l'utilisateur
    const userReactions = await likeRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });

    const interactedMovieIds = userReactions.map((r) => r.movie.id);
    const likedMovies = userReactions
      .filter((r) => r.isLike === true)
      .map((r) => r.movie);

    if (likedMovies.length === 0) {
      // Si l'utilisateur n'a rien likÃ©, on renvoie les films les plus populaires par dÃ©faut
      const popularMovies = await movieRepository.find({
        order: { popularity: 'DESC' },
        take: 10,
      });

      return res.json({ recommendations: popularMovies });
    }

    // ==========================================
    // Ã‰TAPE 2 : Calculer le score des Genres (Content-Based)
    // ==========================================
    const genrePreferences = {};

    likedMovies.forEach((movie) => {
      if (!movie.genre) {
        return;
      }
      // On sÃ©pare les genres (ex: "Action, Sci-Fi" -> ["Action", "Sci-Fi"])
      const genres = movie.genre.split(',').map((g) => g.trim());
      genres.forEach((genre) => {
        // Chaque fois que l'utilisateur like un genre, on augmente son score de +1
        genrePreferences[genre] = (genrePreferences[genre] || 0) + 1;
      });
    });

    // ==========================================
    // Ã‰TAPE 3 : Trouver les utilisateurs similaires (Collaborative)
    // ==========================================
    const likedMovieIds = likedMovies.map((m) => m.id);

    // On cherche les autres likes sur les mÃªmes films (par d'autres utilisateurs)
    const similarLikes = await likeRepository.find({
      where: {
        movie: { id: In(likedMovieIds) },
        isLike: true,
        user: { id: Not(userId) }, // On exclut notre utilisateur cible
      },
      relations: ['user'],
    });

    const userSimilarityScores = {};
    similarLikes.forEach((like) => {
      const simUserId = like.user.id;
      // +1 point de similaritÃ© pour chaque film likÃ© en commun
      userSimilarityScores[simUserId] =
        (userSimilarityScores[simUserId] || 0) + 1;
    });

    // On rÃ©cupÃ¨re TOUS les likes des utilisateurs similaires
    const similarUsersIds = Object.keys(userSimilarityScores).map((id) =>
      parseInt(id, 10)
    );

    const collaborativeMovieScores = {};
    if (similarUsersIds.length > 0) {
      const collabLikes = await likeRepository.find({
        where: { user: { id: In(similarUsersIds) }, isLike: true },
        relations: ['movie', 'user'],
      });

      collabLikes.forEach((like) => {
        // On ignore les films que notre utilisateur a dÃ©jÃ  vus
        if (!interactedMovieIds.includes(like.movie.id)) {
          const simScore = userSimilarityScores[like.user.id];
          // Le score collaboratif du film augmente en fonction du degrÃ© de similaritÃ© de l'utilisateur qui l'a likÃ©
          collaborativeMovieScores[like.movie.id] =
            (collaborativeMovieScores[like.movie.id] || 0) + simScore;
        }
      });
    }

    // ==========================================
    // Ã‰TAPE 4 : Appliquer la formule et trier les films non vus
    // ==========================================

    // On rÃ©cupÃ¨re tous les films que l'utilisateur n'a pas encore likÃ©s/dislikÃ©s
    const unseenMovies = await movieRepository.find({
      where:
        interactedMovieIds.length > 0
          ? { id: Not(In(interactedMovieIds)) }
          : {},
    });

    const scoredMovies = unseenMovies.map((movie) => {
      // 4A. Calcul du score Genre pour ce film
      let movieGenreScore = 0;
      if (movie.genre) {
        const genres = movie.genre.split(',').map((g) => g.trim());
        genres.forEach((genre) => {
          if (genrePreferences[genre]) {
            movieGenreScore += genrePreferences[genre];
          }
        });
      }

      // 4B. RÃ©cupÃ©ration du score Collaboratif pour ce film
      const movieCollabScore = collaborativeMovieScores[movie.id] || 0;

      // 4C. Calcul du Score Final (La formule mathÃ©matique)
      const finalScore =
        movieGenreScore * WEIGHT_GENRE + movieCollabScore * WEIGHT_COLLAB;

      // On ajoute dynamiquement la propriÃ©tÃ© score Ã  l'objet film pour le tri
      return { ...movie, recommendationScore: finalScore };
    });

    // ==========================================
    // Ã‰TAPE 5 : Tri final et rÃ©ponse
    // ==========================================

    // On retire les films avec un score de 0 (aucune pertinence) et on trie du plus grand au plus petit
    const finalRecommendations = scoredMovies
      .filter((movie) => movie.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10); // On ne garde que le Top 10

    res.json({ recommendations: finalRecommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while generating recommendations' });
  }
});

export default router;

