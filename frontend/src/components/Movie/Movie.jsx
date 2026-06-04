import React from 'react';
import { Link } from 'react-router-dom';

function Movie({ data }) {
  return (
    // Le Link va rediriger l'utilisateur vers /movie/1, /movie/2, etc.
    <Link to={`/movie/${data.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          margin: '10px',
          width: '250px',
          height: '450px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#282c34',
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
              height: '320px',
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
