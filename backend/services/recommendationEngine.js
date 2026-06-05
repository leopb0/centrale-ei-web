import { In, Not } from 'typeorm';
import { appDataSource } from '../datasource.js';
import LikeEntity from '../entities/like.js';
import Movie from '../entities/movies.js';

function cosineSimilarity(a, b) {
  if (!a.genre || !b.genre) return 0;
  const ga = a.genre.split(',').map(g => g.trim());
  const gb = b.genre.split(',').map(g => g.trim());
  const genres = [...new Set([...ga, ...gb])];
  let dot = 0, ma = 0, mb = 0;
  for (const g of genres) {
    const va = ga.includes(g) ? 1 : 0;
    const vb = gb.includes(g) ? 1 : 0;
    dot += va * vb;
    ma += va * va;
    mb += vb * vb;
  }
  return ma && mb ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0;
}

export async function getRecommendations(userId) {
  const likeRepo = appDataSource.getRepository(LikeEntity);
  const movieRepo = appDataSource.getRepository(Movie);

  const reactions = await likeRepo.find({
    where: { user: { id: userId } },
    relations: ['movie'],
  });

  const interactedIds = reactions.map(r => r.movie.id);
  const liked = reactions.filter(r => r.isLike).map(r => r.movie);

  if (!liked.length) {
    return movieRepo.find({ order: { popularity: 'DESC' }, take: 50 });
  }

  const similarLikes = await likeRepo.find({
    where: { movie: { id: In(liked.map(m => m.id)) }, isLike: true, user: { id: Not(userId) } },
    relations: ['user'],
  });

  const userScores = {};
  for (const l of similarLikes) {
    userScores[l.user.id] = (userScores[l.user.id] || 0) + 1;
  }

  const collabScores = {};
  let maxCollab = 0;
  const similarUserIds = Object.keys(userScores).map(Number);

  if (similarUserIds.length) {
    const collabLikes = await likeRepo.find({
      where: { user: { id: In(similarUserIds) }, isLike: true },
      relations: ['movie', 'user'],
    });
    for (const l of collabLikes) {
      if (!interactedIds.includes(l.movie.id)) {
        collabScores[l.movie.id] = (collabScores[l.movie.id] || 0) + userScores[l.user.id];
        if (collabScores[l.movie.id] > maxCollab) maxCollab = collabScores[l.movie.id];
      }
    }
  }

  const unseen = await movieRepo.find({
    where: interactedIds.length ? { id: Not(In(interactedIds)) } : {},
  });

  return unseen
    .map(movie => {
      const genreScore = liked.reduce((s, l) => s + cosineSimilarity(movie, l), 0) / liked.length;
      const collabScore = maxCollab ? (collabScores[movie.id] || 0) / maxCollab : 0;
      return { ...movie, recommendationScore: 0.5 * genreScore + 0.5 * collabScore };
    })
    .filter(m => m.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 50);
}
