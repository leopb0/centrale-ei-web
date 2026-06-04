import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function MovieDetails() {
  // useParams permet d'extraire l'ID depuis l'URL (ex: /movie/1 -> id = 1)
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentReaction, setCurrentReaction] = useState(null); // true = like, false = dislike, null = none

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    fetch(`${baseUrl}/movies/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  }, [id]);

  // Récupère la réaction de l'utilisateur connecté pour ce film
  useEffect(() => {
    const fetchReaction = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return setCurrentReaction(null);
      }
      try {
        const baseUrl =
          import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/movies/${id}/reaction`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        setCurrentReaction(data.isLike === null ? null : data.isLike);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReaction();
  }, [id]);

  if (!movie) {
    return (
      <h2 style={{ color: 'white', textAlign: 'center' }}>Chargement...</h2>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        color: 'white',
        backgroundColor: '#282c34',
        minHeight: '100vh',
      }}
    >
      <Link to="/" style={{ color: '#61dafb', textDecoration: 'none' }}>
        ← Retour à l'accueil
      </Link>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {movie.imageUrl && (
          <img
            src={movie.imageUrl}
            alt={movie.name}
            style={{ width: '300px', borderRadius: '10px' }}
          />
        )}
        <div>
          <h1>
            {movie.name} ({movie.releaseYear})
          </h1>
          <h3>Réalisé par : {movie.director}</h3>

          <p>
            <strong>Note :</strong> {movie.rating}/10
          </p>
          <div style={{ margin: '20px 0' }}>
            <p>
              <strong>Genre :</strong> {movie.genre || 'Non renseigné'}
            </p>
            {/* <p>
              <strong>Popularité :</strong>{' '}
              {movie.popularity
                ? `${Math.round(movie.popularity * 100)} %`
                : 'N/A'}
            </p> */}
            <p>
              <strong>Durée :</strong> {movie.duration} minutes
            </p>
          </div>
          <p>
            <strong>Public :</strong>{' '}
            {movie.minAge > 0
              ? `Interdit aux moins de ${movie.minAge} ans`
              : 'Tout public'}
          </p>
          <div style={{ marginTop: '20px' }}>
            <h2>Synopsis</h2>
            <p>{movie.synopsis}</p>
          </div>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {/* Styles change selon la réaction actuelle */}
            <button
              onClick={async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                  setFeedback('Vous devez être connecté pour liker');

                  return;
                }
                try {
                  const baseUrl =
                    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
                  const res = await fetch(`${baseUrl}/movies/${id}/react`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isLike: true }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error(data.message || 'Error');
                  }
                  setFeedback(data.message || 'Like enregistré');
                  // Met à jour l'état local selon ce que renvoie le backend
                  if (Object.prototype.hasOwnProperty.call(data, 'isLike')) {
                    setCurrentReaction(
                      data.isLike === null ? null : data.isLike
                    );
                  }
                } catch (err) {
                  console.error(err);
                  setFeedback("Erreur lors de l'enregistrement");
                }
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor:
                  currentReaction === true ? '#4caf50' : undefined,
                color: currentReaction === true ? 'white' : undefined,
                border: 'none',
                borderRadius: '4px',
              }}
            >
              👍 Like
            </button>

            <button
              onClick={async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                  setFeedback('Vous devez être connecté pour disliker');

                  return;
                }
                try {
                  const baseUrl =
                    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
                  const res = await fetch(`${baseUrl}/movies/${id}/react`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isLike: false }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error(data.message || 'Error');
                  }
                  setFeedback(data.message || 'Dislike enregistré');
                  if (Object.prototype.hasOwnProperty.call(data, 'isLike')) {
                    setCurrentReaction(
                      data.isLike === null ? null : data.isLike
                    );
                  }
                } catch (err) {
                  console.error(err);
                  setFeedback("Erreur lors de l'enregistrement");
                }
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor:
                  currentReaction === false ? '#f44336' : undefined,
                color: currentReaction === false ? 'white' : undefined,
                border: 'none',
                borderRadius: '4px',
              }}
            >
              👎 Dislike
            </button>
            {feedback && (
              <div style={{ color: 'white', marginLeft: '10px' }}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
