import axios from 'axios';
import { appDataSource } from './datasource.js';
import Movie from './entities/movies.js';

const TMDB_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo';

const TMDB_HEADERS = {
  Authorization: TMDB_TOKEN,
  accept: 'application/json',
};

// Dictionnaire des genres TMDB
const TMDB_GENRES = {
  28: 'Action',
  12: 'Aventure',
  16: 'Animation',
  35: 'Comédie',
  80: 'Crime',
  99: 'Documentaire',
  18: 'Drame',
  10751: 'Famille',
  14: 'Fantastique',
  36: 'Histoire',
  27: 'Horreur',
  10402: 'Musique',
  9648: 'Mystère',
  10749: 'Romance',
  878: 'Science-Fiction',
  10770: 'Téléfilm',
  53: 'Thriller',
  10752: 'Guerre',
  37: 'Western',
};

function mapTMDBToMovieSchema(tmdbMovie, runtime) {
  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0])
    : 2024;

  const genreNames = tmdbMovie.genre_ids
    ? tmdbMovie.genre_ids
        .map((id) => TMDB_GENRES[id])
        .filter(Boolean)
        .join(', ')
    : 'Générique';

  const normalizedPopularity = Math.min(
    1,
    parseFloat((tmdbMovie.popularity / 10000).toFixed(4))
  );

  let minAge = 0;
  if (tmdbMovie.adult) {
    minAge = 18;
  } else if (tmdbMovie.genre_ids?.includes(27)) {
    minAge = 16;
  } else if (
    tmdbMovie.genre_ids?.includes(53) ||
    tmdbMovie.genre_ids?.includes(28)
  ) {
    minAge = 12;
  }

  return {
    name: tmdbMovie.title,
    synopsis: tmdbMovie.overview,
    releaseYear: year,
    rating: tmdbMovie.vote_average,
    popularity: normalizedPopularity,
    minAge: minAge,
    genre: genreNames || 'Autre',
    imageUrl: tmdbMovie.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
      : null,
    languages: [tmdbMovie.original_language],
    director: 'Inconnu',
    duration: runtime ?? null,
  };
}

async function fetchRuntime(tmdbId) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      { params: { language: 'fr-FR' }, headers: TMDB_HEADERS }
    );
    return response.data.runtime || null;
  } catch {
    return null;
  }
}

async function fetchAllRuntimes(tmdbMovies) {
  console.log(`→ Récupération des durées pour ${tmdbMovies.length} films...`);
  const results = await Promise.all(
    tmdbMovies.map(async (movie) => ({
      id: movie.id,
      runtime: await fetchRuntime(movie.id),
    }))
  );
  return new Map(results.map(({ id, runtime }) => [id, runtime]));
}

async function seedWithTMDB() {
  try {
    console.log('Connexion à la base de données...');
    await appDataSource.initialize();
    const movieRepository = appDataSource.getRepository(Movie);

    console.log('Suppression des films existants...');
    await movieRepository.clear();

    const rawTmdbMovies = [];
    const maxPages = 25;

    console.log(
      `Début de la récupération des films (Pages 1 à ${maxPages})...`
    );

    for (let page = 1; page <= maxPages; page++) {
      console.log(`→ Récupération de la page ${page}/${maxPages}...`);

      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular`,
        {
          params: { language: 'fr-FR', page },
          headers: TMDB_HEADERS,
        }
      );

      rawTmdbMovies.push(...response.data.results);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `${rawTmdbMovies.length} films récupérés. Récupération des durées...`
    );

    const runtimes = await fetchAllRuntimes(rawTmdbMovies);

    const allMoviesToSave = rawTmdbMovies.map((movie) =>
      mapTMDBToMovieSchema(movie, runtimes.get(movie.id))
    );

    console.log('Sauvegarde globale dans la base de données SQLite...');
    await movieRepository.save(allMoviesToSave, { chunk: 50 });

    console.log(
      '✅ Base de données peuplée avec succès avec 500 vrais films de TMDB !'
    );
  } catch (error) {
    console.error('❌ Erreur lors du seed TMDB :', error.message);
  } finally {
    await appDataSource.destroy();
    console.log('Connexion fermée.');
  }
}

seedWithTMDB();
