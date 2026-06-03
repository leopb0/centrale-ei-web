
import React from 'react';
import { Link } from 'react-router-dom';

function Movie({ data }) {
  return (
    // Le Link va rediriger l'utilisateur vers /movie/1, /movie/2, etc.
    <Link to={`/movie/${data.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        padding: '15px', 
        margin: '10px', 
        width: '250px',
        backgroundColor: '#282c34',
        color: 'white',
        textAlign: 'center',
        cursor: 'pointer' // Ajoute la petite main au survol
      }}>
        {data.imageUrl && (
          <img 
            src={data.imageUrl} 
            alt={`Affiche de ${data.name}`} 
            style={{ width: '100%', borderRadius: '5px' }} 
          />
        )}
        <h3 style={{ marginTop: '10px' }}>{data.name}</h3>
        <p style={{ fontSize: '14px', color: '#ccc' }}>
          <strong>Réalisateur :</strong> {data.director} <br/>
          <strong>Année :</strong> {data.releaseYear}
        </p>
      </div>
    </Link>
  );
}

export default Movie;