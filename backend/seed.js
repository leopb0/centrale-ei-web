import axios from 'axios';
import { appDataSource } from './datasource.js';
import Movie from './entities/movies.js';

const TMDB_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo';

const TMDB_HEADERS = {
  Authorization: TMDB_TOKEN,
  accept: 'application/json',
};

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

// Mise à jour de la fonction de mapping pour inclure les nouveaux détails
function mapTMDBToMovieSchema(tmdbMovie, details) {
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
    // 👇 On utilise les données récupérées depuis les crédits
    director: details?.director || 'Inconnu',
    actors: details?.actors || [],
    duration: details?.runtime ?? null,
  };
}

// 🔄 Nouvelle fonction qui récupère durée + crédits en une seule fois
async function fetchMovieDetails(tmdbId) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        // L'astuce magique: append_to_response permet de récupérer les crédits dans le même appel JSON
        params: { language: 'fr-FR', append_to_response: 'credits' },
        headers: TMDB_HEADERS,
      }
    );

    const data = response.data;
    const credits = data.credits;

    // 1. Isoler le réalisateur (job === 'Director' dans le tableau 'crew')
    const directorData = credits?.crew?.find(
      (member) => member.job === 'Director'
    );
    const director = directorData ? directorData.name : 'Inconnu';

    // 2. Isoler les 3 acteurs les plus connus
    // On filtre les acteurs, on les trie par popularité décroissante, on garde les 3 premiers et on extrait leurs noms
    const topActors =
      credits?.cast
        ?.filter((member) => member.known_for_department === 'Acting')
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 3)
        .map((actor) => actor.name) || [];

    return {
      runtime: data.runtime || null,
      director: director,
      actors: topActors,
    };
  } catch (error) {
    return { runtime: null, director: 'Inconnu', actors: [] };
  }
}

// Mise à jour de la boucle de récupération
async function fetchAllMovieDetails(tmdbMovies) {
  console.log(
    `→ Récupération des détails (durée, réalisateur, acteurs) pour ${tmdbMovies.length} films...`
  );
  const results = await Promise.all(
    tmdbMovies.map(async (movie) => ({
      id: movie.id,
      details: await fetchMovieDetails(movie.id),
    }))
  );

  return new Map(results.map(({ id, details }) => [id, details]));
}

async function seedWithTMDB() {
  try {
    console.log('Connexion à la base de données...');
    await appDataSource.initialize();
    const movieRepository = appDataSource.getRepository(Movie);

    console.log('Suppression des films existants...');
    await movieRepository.clear();

    const rawTmdbMovies = [];
    const maxPages = 25; // 25 pages * 20 = 500 films

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
      // Petite pause pour ne pas spammer l'API TMDB
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `${rawTmdbMovies.length} films récupérés. Récupération des détails approfondis...`
    );

    // On passe ici notre nouvelle fonction
    const moviesDetailsMap = await fetchAllMovieDetails(rawTmdbMovies);

    const allMoviesToSave = rawTmdbMovies.map((movie) =>
      mapTMDBToMovieSchema(movie, moviesDetailsMap.get(movie.id))
    );

    console.log('Sauvegarde globale dans la base de données SQLite...');
    await movieRepository.save(allMoviesToSave, { chunk: 50 });

    console.log(
      '✅ Base de données peuplée avec succès avec 500 vrais films de TMDB (avec casting) !'
    );
  } catch (error) {
    console.error('❌ Erreur lors du seed TMDB :', error.message);
  } finally {
    await appDataSource.destroy();
    console.log('Connexion fermée.');
  }
}

seedWithTMDB();
