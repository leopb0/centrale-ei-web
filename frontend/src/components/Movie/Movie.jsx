import React from 'react';

function Movie({ data }) {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      padding: '15px', 
      margin: '10px', 
      width: '250px',
      backgroundColor: '#282c34', // Pour aller avec votre thème sombre
      color: 'white',
      textAlign: 'center'
    }}>
      {/* On affiche l'image si elle existe */}
      {data.imageUrl && (
        <img 
          src={data.imageUrl} 
          alt={`Affiche de ${data.name}`} 
          style={{ width: '100%', borderRadius: '5px' }} 
        />
      )}
      
      {/* On utilise data.name au lieu de data.title ! */}
      <h3 style={{ marginTop: '10px' }}>{data.name}</h3>
      
      <p style={{ fontSize: '14px', color: '#ccc' }}>
        <strong>Réalisateur :</strong> {data.director} <br/>
        <strong>Année :</strong> {data.releaseYear}
      </p>
    </div>
  );
}

export default Movie;