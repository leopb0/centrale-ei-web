import React from 'react';
import { Link } from 'react-router-dom';
import './Movie.css';

function Movie({ data, large }) {
  const cardWidth = large ? '300px' : '200px';
  const cardHeight = large ? '460px' : '380px';
  const imgHeight = large ? '340px' : '270px';

  return (
    <Link to={`/movie/${data.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="movie-card"
        style={{
          border: '1px solid rgba(108, 71, 255, 0.2)',
          borderRadius: '12px',
          margin: '10px',
          width: cardWidth,
          height: cardHeight,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#13132a',
          color: 'white',
          textAlign: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt={`Affiche de ${data.name}`}
            style={{
              width: '100%',
              height: imgHeight,
              borderRadius: '8px 8px 0 0',
              objectFit: 'cover',
              flexShrink: 0,
              display: 'block',
            }}
          />
        )}
        <div
          style={{
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h3
            style={{
              margin: '0',
              fontSize: '1.1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {data.name}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#ccc',
              margin: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            <strong>Réalisateur :</strong> {data.director} <br />
            <strong>Année :</strong> {data.releaseYear}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default Movie;
