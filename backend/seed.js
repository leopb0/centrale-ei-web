import axios from 'axios';
import { appDataSource } from './datasource.js';
import Movie from './entities/movies.js';

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

// Fonction de conversion TMDB -> Ton schéma de Base de données
function mapTMDBToMovieSchema(tmdbMovie) {
  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0])
    : 2024;

  const genreNames = tmdbMovie.genre_ids
    ? tmdbMovie.genre_ids
        .map((id) => TMDB_GENRES[id])
        .filter(Boolean)
        .join(', ')
    : 'Générique';

  // Normalisation de la popularité pour ton algo (entre 0 et 1)
  const normalizedPopularity = Math.min(
    1,
    parseFloat((tmdbMovie.popularity / 10000).toFixed(4))
  );

  let minAge = 0;
  if (tmdbMovie.adult) {
    minAge = 18;
  } else if (tmdbMovie.genre_ids?.includes(27)) {
    minAge = 16; // Horreur
  } else if (
    tmdbMovie.genre_ids?.includes(53) ||
    tmdbMovie.genre_ids?.includes(28)
  ) {
    minAge = 12; // Thriller / Action
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
    director: 'Inconnu', // Non fourni par cet endpoint de liste
    duration: 120, // Non fourni par cet endpoint de liste
  };
}

// Script principal avec la boucle de 1 à 25
async function seedWithTMDB() {
  try {
    console.log('Connexion à la base de données...');
    await appDataSource.initialize();
    const movieRepository = appDataSource.getRepository(Movie);

    // Tableau qui va accumuler nos 500 films
    const allMoviesToSave = [];
    const maxPages = 25;

    console.log(
      `Début de la récupération des films (Pages 1 à ${maxPages})...`
    );

    for (let page = 1; page <= maxPages; page++) {
      console.log(`→ Récupération de la page ${page}/${maxPages}...`);

      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular`,
        {
          // Axios permet de passer les paramètres de requête proprement via l'objet 'params'
          params: {
            language: 'fr-FR',
            page: page,
          },
          headers: {
            // Remplace par process.env.TMDB_TOKEN si tu as configuré ton .env
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo',
            accept: 'application/json',
          },
        }
      );

      const tmdbMoviesList = response.data.results;

      // On convertit les 20 films de la page courante et on les ajoute au grand tableau
      const mappedMovies = tmdbMoviesList.map((movie) =>
        mapTMDBToMovieSchema(movie)
      );
      allMoviesToSave.push(...mappedMovies);

      // Petit bonus : Une pause de 100ms entre chaque appel pour ne pas surcharger
      // le réseau ou se faire bloquer par TMDB (Rate Limiting)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Total des films convertis avec succès : ${allMoviesToSave.length}`
    );
    console.log('Sauvegarde globale dans la base de données SQLite...');

    // Sauvegarde par paquets de 50 pour que SQLite ne ralentisse pas
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
