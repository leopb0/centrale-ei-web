import axios from 'axios';
import { useEffect, useState } from 'react';

export function useFetchFilms() {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    console.log('test');
    axios
      .get(`https://api.themoviedb.org/3/trending/movie/day?language=en-US`, {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo',
          accept: 'application/json',
        },
      })
      .then((response) => {
        // Do something if call succeeded
        console.log('Données reçues :', response.data.results);
        setMovies(response.data.results);
      })
      .catch((error) => {
        // Do something if call failed
        console.log(error);
      });
  }, []);

  return { movies };
}
