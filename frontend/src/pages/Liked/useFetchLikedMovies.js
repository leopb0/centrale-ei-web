import { useEffect, useState } from 'react';

export const useFetchLikedMovies = () => {
  const [likedMovies, setLikedMovies] = useState([]);
  const [likedMoviesLoadingError, setLikedMoviesLoadingError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikedMovies = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLikedMoviesLoadingError(
          'Vous devez être connecté pour voir vos films aimés'
        );
        setIsLoading(false);

        return;
      }

      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/movies/user/liked`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des films aimés');
      }

      const movies = await response.json();
      setLikedMovies(movies);
      setLikedMoviesLoadingError(null);
    } catch (error) {
      console.error('Error fetching liked movies:', error);
      setLikedMoviesLoadingError('Erreur lors du chargement des films aimés');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedMovies();
  }, []);

  return { likedMovies, likedMoviesLoadingError, isLoading, fetchLikedMovies };
};
