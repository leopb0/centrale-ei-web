import express from 'express';
// import axios from 'axios';
import cors from 'cors';
import { Like } from 'typeorm';
import LikeEntity from '../entities/like.js';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movies.js';
const router = express.Router();

router.get('/', async (req, res) => {
  console.log(
    'RequÃªte reÃ§ue sur GET /movies : rÃ©cupÃ©ration de la liste des films...'
  );

  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // On regarde si l'URL contient "?name=quelquechose"
    const searchName = req.query.name;
    let movies;

    if (searchName) {
      // S'il y a une recherche, on filtre les rÃ©sultats
      console.log(`Recherche en cours avec le mot-clÃ© : ${searchName}`);
      movies = await movieRepository.find({
        where: {
          name: Like(`%${searchName}%`), // Le % agit comme un joker de chaque cÃ´tÃ©
        },
      });
    } else {
      // Sinon, on rÃ©cupÃ¨re TOUS les enregistrements comme avant
      movies = await movieRepository.find();
    }

    // On renvoie la liste au format JSON
    res.status(200).json(movies);
  } catch (error) {
    console.error('Erreur lors de la rÃ©cupÃ©ration des films :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la rÃ©cupÃ©ration des films.',
    });
  }
});

router.get('/:id', async (req, res) => {
  // 1. On rÃ©cupÃ¨re l'id depuis les paramÃ¨tres de l'URL
  const movieId = req.params.id;

  console.log(`RequÃªte reÃ§ue pour rÃ©cupÃ©rer le film avec l'id : ${movieId}`);

  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // 2. On cherche le film correspondant Ã  cet ID dans la base de donnÃ©es
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

    // 4. Si le film est trouvÃ©, on le renvoie avec un statut 200 OK
    res.status(200).json(movie);
  } catch (error) {
    console.error('Erreur lors de la rÃ©cupÃ©ration du film :', error);
    res.status(500).json({
      message: 'Une erreur interne est survenue.',
    });
  }
});

router.use(cors()); // ðŸ”¥ Autorise toutes les requÃªtes cross-origin
router.use(express.json()); // Permet de lire le JSON envoyÃ© dans le body

router.post('/', async (req, res) => {
  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // On crÃ©e une nouvelle instance de film avec le body reÃ§u
    const newMovie = movieRepository.create(req.body);

    // On sauvegarde en base de donnÃ©es
    await movieRepository.save(newMovie);

    res.status(201).json({ message: 'Film ajoutÃ© !', movie: newMovie });
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
        message: 'Film ajoutÃ© avec succÃ¨s',
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

  console.log(`RequÃªte reÃ§ue pour supprimer le film avec l'id : ${movieId}`);

  try {
    const movieRepository = appDataSource.getRepository(Movie);

    // 1. On cherche si le film existe dans la base de donnÃ©es
    const movie = await movieRepository.findOneBy({
      id: movieId,
    });

    // 2. Si le film n'existe pas, on renvoie immÃ©diatement une erreur 404 Not Found
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
      `Le film "${movie.name}" (ID: ${movieId}) a Ã©tÃ© supprimÃ© avec succÃ¨s.`
    );

    // 4. On renvoie un code 200 OK avec un message de confirmation
    res.status(200).json({
      message: `Le film "${movie.name}" a bien Ã©tÃ© supprimÃ©.`,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du film :', error);
    res.status(500).json({
      message: 'Une erreur interne est survenue lors de la suppression.',
    });
  }
});

// POST /movies/:movieId/react
// req.body doit contenir : { userId: 4, isLike: true }
router.post('/:movieId/react', async function (req, res) {
  try {
    const movieId = req.params.movieId;
    const { userId, isLike } = req.body;

    const likeRepository = appDataSource.getRepository(LikeEntity);

    // 1. On cherche si l'utilisateur a dÃ©jÃ  rÃ©agi Ã  ce film
    const existingReaction = await likeRepository.findOne({
      where: {
        user: { id: userId },
        movie: { id: movieId },
      },
    });

    if (existingReaction) {
      // Si la rÃ©action existe dÃ©jÃ  mais qu'elle change (ex: Like -> Dislike)
      if (existingReaction.isLike !== isLike) {
        existingReaction.isLike = isLike;
        await likeRepository.save(existingReaction);

        return res.json({ message: 'Reaction updated successfully' });
      }

      // Si l'utilisateur clique Ã  nouveau sur le mÃªme bouton, on peut imaginer qu'il "annule" son comme sur Netflix
      await likeRepository.remove(existingReaction);

      return res.json({ message: 'Reaction removed' });
    }

    // 2. Si aucune rÃ©action n'existe, on la crÃ©e
    const newReaction = likeRepository.create({
      isLike: isLike,
      user: { id: userId }, // TypeORM comprend directement grÃ¢ce Ã  l'ID
      movie: { id: movieId },
    });

    await likeRepository.save(newReaction);
    res.status(201).json({ message: 'Reaction saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing the reaction' });
  }
});

export default router;


