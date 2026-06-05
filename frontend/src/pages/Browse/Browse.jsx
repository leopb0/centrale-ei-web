import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieRow from '../../components/MovieRow/MovieRow';
import './Browse.css';

function Browse() {
  const [allMovies, setAllMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const userId = localStorage.getItem('userId');

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
    <div className="Browse-container">
      <h1 className="Browse-title">Browse</h1>
      <MovieRow title="Trending now" movies={trending} />
      <MovieRow title="Latest Releases" movies={latest} />
      <MovieRow title="Best Rated" movies={bestRated} />
      {userId ? (
        <MovieRow title="For you" movies={recommendations} />
      ) : (
        <p className="Browse-login-hint">Log in to see personalised recommendations.</p>
      )}
    </div>
  );
}

export default Browse;
