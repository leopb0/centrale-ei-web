import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieRow from '../../components/MovieRow/MovieRow';
import { useFetchLikedMovies } from '../Liked/useFetchLikedMovies';
import './Home.css';

function Home() {
  const [allMovies, setAllMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const userId = localStorage.getItem('userId');
  const { likedMovies } = useFetchLikedMovies();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/movies`)
      .then((res) => setAllMovies(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/recommendations`)
      .then((res) => setRecommendations(res.data.recommendations))
      .catch(console.error);
  }, [userId]);

  const trending = [...allMovies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const latest = [...allMovies].sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
  const bestRated = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="Home-container">
      <MovieRow title="Tendances" movies={trending} />
      {userId ? (
        <MovieRow title="Pour vous" movies={recommendations} />
      ) : (
        <p className="Home-login-hint">Connectez-vous pour voir des recommandations personnalisées.</p>
      )}
      <MovieRow title="Mieux notés" movies={bestRated} />
      {userId && (
        <MovieRow
          title="Vos coups de cœur"
          movies={likedMovies}
          large={likedMovies.length < 5}
        />
      )}
      <MovieRow title="Sorties récentes" movies={latest} />
    </div>
  );
}

export default Home;
