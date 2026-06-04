import { useEffect, useState } from 'react';
import './Counter.css';
import Movie from '../../components/Movie/Movie';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Vous devez être connecté pour voir les recommandations');
          setLoading(false);

          return;
        }

        const baseUrl =
          import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/recommandations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des recommandations');
        }

        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="Counter-container">
      <h1>Films Recommandés Pour Vous</h1>
      {loading && <p>Chargement des recommandations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          gap: '20px',
        }}
      >
        {recommendations.length > 0
          ? recommendations.map((movie) => (
              <Movie key={movie.id} data={movie} />
            ))
          : !loading && <p>Aucune recommandation disponible pour le moment.</p>}
      </div>
    </div>
  );
}

export default Recommendations;
