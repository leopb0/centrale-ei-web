import express from 'express';
// import axios from 'axios';
import cors from 'cors';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movies.js';
import { Like } from 'typeorm';
const router = express.Router();

router.get('/', async (req, res) => {
  console.log(
    'Requête reçue sur GET /movies : récupération de la liste des films...'
  );

  try {
    const movieRepository = appDataSource.getRepository(Movie);
    
    // On regarde si l'URL contient "?name=quelquechose"
    const searchName = req.query.name;
    let movies;

    if (searchName) {
      // S'il y a une recherche, on filtre les résultats
      console.log(`Recherche en cours avec le mot-clé : ${searchName}`);
      movies = await movieRepository.find({
        where: { 
          name: Like(`%${searchName}%`) // Le % agit comme un joker de chaque côté
        }
      });
    } else {
      // Sinon, on récupère TOUS les enregistrements comme avant
      movies = await movieRepository.find();
    }

    // On renvoie la liste au format JSON
    res.status(200).json(movies);
  } catch (error) {
    console.error('Erreur lors de la récupération des films :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des films.',
    });
  }
});

router.get('/:id', async (req, res) => {
  // 1. On récupère l'id depuis les paramètres de l'URL
  const movieId = req.params.id;

  console.log(`Requête reçue pour récupérer le film avec l'id : ${movieId}`);

  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // 2. On cherche le film correspondant à cet ID dans la base de données
    const movie = await movieRepository.findOneBy({
      id: movieId,
    });

    // 3. Si le film n'existe pas, on renvoie une erreur 404
    if (!movie) {
      console.log(`Film avec l'id ${movieId} introuvable.`);

      return res.status(404).json({
        message: `Le film avec l'identifiant ${movieId} n'existe pas.`,
      });
    }

    // 4. Si le film est trouvé, on le renvoie avec un statut 200 OK
    res.status(200).json(movie);
  } catch (error) {
    console.error('Erreur lors de la récupération du film :', error);
    res.status(500).json({
      message: 'Une erreur interne est survenue.',
    });
  }
});

router.use(cors()); // 🔥 Autorise toutes les requêtes cross-origin
router.use(express.json()); // Permet de lire le JSON envoyé dans le body

router.post('/', async (req, res) => {
  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // On crée une nouvelle instance de film avec le body reçu
    const newMovie = movieRepository.create(req.body);

    // On sauvegarde en base de données
    await movieRepository.save(newMovie);

    res.status(201).json({ message: 'Film ajouté !', movie: newMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout du film" });
  }
});

router.post('/new', function (req, res) {
  const movieRepository = appDataSource.getRepository(Movie);
  const newMovie = movieRepository.create({
    name: req.body.name,
    director: req.body.director,
    releaseYear: req.body.releaseYear,
    duration: req.body.duration,
    synopsis: req.body.synopsis,
    rating: req.body.rating,
    imageUrl: req.body.imageUrl,
  });

  movieRepository
    .save(newMovie)
    .then(function (savedMovie) {
      res.status(201).json({
        message: 'Film ajouté avec succès',
        id: savedMovie.id,
      });
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `Erreur impossible`,
        });
      } else {
        res.status(500).json({ message: 'Erreur d ajout du film dans la db' });
      }
    });
});

router.delete('/:id', async (req, res) => {
  const movieId = req.params.id;

  console.log(`Requête reçue pour supprimer le film avec l'id : ${movieId}`);

  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // 1. On cherche si le film existe dans la base de données
    const movie = await movieRepository.findOneBy({
      id: movieId,
    });

    // 2. Si le film n'existe pas, on renvoie immédiatement une erreur 404 Not Found
    if (!movie) {
      console.log(
        `Suppression impossible : le film avec l'id ${movieId} n'existe pas.`
      );

      return res.status(404).json({
        message: `Le film avec l'identifiant ${movieId} n'existe pas.`,
      });
    }

    // 3. Si le film existe, on le supprime
    await movieRepository.remove(movie);

    console.log(
      `Le film "${movie.name}" (ID: ${movieId}) a été supprimé avec succès.`
    );

    // 4. On renvoie un code 200 OK avec un message de confirmation
    res.status(200).json({
      message: `Le film "${movie.name}" a bien été supprimé.`,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du film :', error);
    res.status(500).json({
      message: 'Une erreur interne est survenue lors de la suppression.',
    });
  }
});

export default router;
