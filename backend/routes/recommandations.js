import express from 'express';
import cors from 'cors';
import { In, Not } from 'typeorm';
import jwt from 'jsonwebtoken';
import LikeEntity from '../entities/like.js';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movies.js';

const router = express.Router();

// --- FONCTIONS UTILITAIRES POUR LA SIMILARITÉ COSINUS ---

// Renvoyer un Set de tous les genres uniques présents dans les films aimés et le film cible
function getUniqueGenres(likedMovies, targetMovie) {
  const genresSet = new Set();
  likedMovies.forEach((m) => {
    if (m.genre) {
      m.genre.split(',').forEach((g) => genresSet.add(g.trim()));
    }
  });
  if (targetMovie.genre) {
    targetMovie.genre.split(',').forEach((g) => genresSet.add(g.trim()));
  }

  return Array.from(genresSet);
}

// Calculer la similarité cosinus entre deux vecteurs binaires (présence/absence de genre)
function calculateCosineSimilarity(movieA, movieB, allGenres) {
  if (!movieA.genre || !movieB.genre) {
    return 0;
  }

  const genresA = movieA.genre.split(',').map((g) => g.trim());
  const genresB = movieB.genre.split(',').map((g) => g.trim());

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  allGenres.forEach((genre) => {
    const valA = genresA.includes(genre) ? 1 : 0;
    const valB = genresB.includes(genre) ? 1 : 0;

    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

router.get('/', async function (req, res) {
  try {
    // Récupération du token JWT
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;
    const likeRepository = appDataSource.getRepository(LikeEntity);
    const movieRepository = appDataSource.getRepository(Movie);

    // --- POIDS DE L'ALGORITHME ---
    const WEIGHT_GENRE = 0.5; // Poids accordé à la similarité cosinus des genres (50%)
    const WEIGHT_COLLAB = 0.5; // Poids accordé aux utilisateurs similaires (50%)

    // ==========================================
    // ÉTAPE 1 : Analyser le profil de l'utilisateur
    // ==========================================
    const userReactions = await likeRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });

    const interactedMovieIds = userReactions.map((r) => r.movie.id);
    const likedMovies = userReactions
      .filter((r) => r.isLike === true)
      .map((r) => r.movie);

    if (likedMovies.length === 0) {
      const popularMovies = await movieRepository.find({
        order: { popularity: 'DESC' },
        take: 50,
      });

      return res.json({ recommendations: popularMovies });
    }

    // ==========================================
    // ÉTAPE 2 : Trouver les utilisateurs similaires (Collaborative)
    // ==========================================
    const likedMovieIds = likedMovies.map((m) => m.id);

    const similarLikes = await likeRepository.find({
      where: {
        movie: { id: In(likedMovieIds) },
        isLike: true,
        user: { id: Not(userId) },
      },
      relations: ['user'],
    });

    const userSimilarityScores = {};
    similarLikes.forEach((like) => {
      const simUserId = like.user.id;
      userSimilarityScores[simUserId] =
        (userSimilarityScores[simUserId] || 0) + 1;
    });

    const similarUsersIds = Object.keys(userSimilarityScores).map((id) =>
      parseInt(id, 10)
    );

    const collaborativeMovieScores = {};
    let maxCollabScore = 0; // Pour la normalisation future

    if (similarUsersIds.length > 0) {
      const collabLikes = await likeRepository.find({
        where: { user: { id: In(similarUsersIds) }, isLike: true },
        relations: ['movie', 'user'],
      });

      collabLikes.forEach((like) => {
        if (!interactedMovieIds.includes(like.movie.id)) {
          const simScore = userSimilarityScores[like.user.id];
          collaborativeMovieScores[like.movie.id] =
            (collaborativeMovieScores[like.movie.id] || 0) + simScore;

          if (collaborativeMovieScores[like.movie.id] > maxCollabScore) {
            maxCollabScore = collaborativeMovieScores[like.movie.id];
          }
        }
      });
    }

    // ==========================================
    // ÉTAPE 3 : Appliquer la formule Cosinus + Collab
    // ==========================================
    const unseenMovies = await movieRepository.find({
      where:
        interactedMovieIds.length > 0
          ? { id: Not(In(interactedMovieIds)) }
          : {},
    });

    const scoredMovies = unseenMovies.map((movie) => {
      // 3A. Calcul de la Similarité Cosinus (Content-Based)
      // On extrait la liste globale des genres pertinents pour cette comparaison
      const allGenres = getUniqueGenres(likedMovies, movie);

      let totalCosineSimilarity = 0;
      likedMovies.forEach((likedMovie) => {
        totalCosineSimilarity += calculateCosineSimilarity(
          movie,
          likedMovie,
          allGenres
        );
      });

      // On fait la moyenne de similarité par rapport à tous les films aimés
      const meanCosineSimilarity = totalCosineSimilarity / likedMovies.length;

      // 3B. Récupération et normalisation du score Collaboratif
      // Utile car le score collab peut monter haut, alors que le cosinus est bridé entre 0 et 1
      const rawCollabScore = collaborativeMovieScores[movie.id] || 0;
      const normalizedCollabScore =
        maxCollabScore > 0 ? rawCollabScore / maxCollabScore : 0;

      // 3C. Calcul du Score Final
      const finalScore =
        meanCosineSimilarity * WEIGHT_GENRE +
        normalizedCollabScore * WEIGHT_COLLAB;

      return { ...movie, recommendationScore: finalScore };
    });

    // ==========================================
    // ÉTAPE 4 : Tri final et réponse
    // ==========================================
    const finalRecommendations = scoredMovies
      .filter((movie) => movie.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({ recommendations: finalRecommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while generating recommendations' });
  }
});

export default router;
