import React from 'react';

function Movie({ data }) {
  return (
    <div className="movie-card">
      {data.imageUrl && (
        <img
          className="movie-poster"
          src={data.imageUrl}
          alt={`Affiche du film ${data.name}`}
        />
      )}
      <div className="movie-info">
        <h2 className="movie-title">{data.name}</h2>
        {data.releaseYear && (
          <p className="movie-date">Année de sortie : {data.releaseYear}</p>
        )}
      </div>
    </div>
  );
}

export default Movie;