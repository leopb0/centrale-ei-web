import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function MovieDetails() {
  // useParams permet d'extraire l'ID depuis l'URL (ex: /movie/1 -> id = 1)
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/movies/${id}`)
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
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
      
          <p><strong>Note :</strong> {movie.rating}/10</p>
          <div style={{ margin: '20px 0' }}>
   
            <p><strong>Genre :</strong> {movie.genre || "Non renseigné"}</p>
            <p><strong>Popularité :</strong> {movie.popularity ? `${Math.round(movie.popularity * 100)} %` : "N/A"}</p>
            <p><strong>Durée :</strong> {movie.duration} minutes</p>
          </div> 
            <p><strong>Public :</strong> {movie.minAge > 0 ? `Interdit aux moins de ${movie.minAge} ans` : "Tout public"}</p>
          <div style={{ marginTop: '20px' }}>
            <h2>Synopsis</h2>
            <p>{movie.synopsis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
