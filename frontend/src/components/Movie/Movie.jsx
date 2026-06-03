import React from 'react';
import './Movie.css';

function Movie({ data }) {
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  const formattedDate = new Date(data.release_date).toLocaleDateString(
    'fr-FR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="movie-card">
      {data.poster_path && (
        <img
          className="movie-poster"
          src={`${imageBaseUrl}${data.poster_path}`}
          alt={`Affiche du film ${data.title}`}
        />
      )}
      <div className="movie-info">
        <h2 className="movie-title">{data.title}</h2>
        <p className="movie-date">Date de sortie : {formattedDate}</p>
      </div>
    </div>
  );
}

export default Movie;
