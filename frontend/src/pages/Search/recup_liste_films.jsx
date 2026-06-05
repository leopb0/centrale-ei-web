import axios from 'axios';
import { useEffect, useState } from 'react';

// On ajoute 'searchTerm' comme paramètre. S'il est vide, on charge tout.
export function useFetchFilms(searchTerm = '') {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // On construit l'URL vers VOTRE backend
    // Si searchTerm contient du texte, on l'ajoute à l'URL
    const url = searchTerm
      ? `http://localhost:8000/movies?name=${searchTerm}`
      : `http://localhost:8000/movies`;

    axios
      .get(url)
      .then((response) => {
        // 💡 Attention : contrairement à TMDB, votre backend renvoie
        // directement le tableau, donc c'est response.data (et non response.data.results)
        console.log('Données reçues de mon backend :', response.data);
        setMovies(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des films :', error);
      });
  }, [searchTerm]); // Le hook se relancera automatiquement si le terme de recherche change

  return { movies };
}