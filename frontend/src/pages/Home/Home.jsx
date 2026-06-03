import { useState } from 'react';
import logo from './logo.svg';
import './Home.css';
import { useFetchFilms } from './recup_liste_films';
import Movie from '../../components/Movie/Movie';

function Home() {
  // 1. L'état pour ce qui est tapé en direct dans la barre
  const [Film, setFilm] = useState('');
  
  // 2. L'état pour le mot-clé validé (quand on clique sur le bouton)
  const [searchTerm, setSearchTerm] = useState('');

  // 3. On passe ce mot-clé validé à notre moteur de recherche
  const { movies } = useFetchFilms(searchTerm);

  // 4. La fonction déclenchée par le clic sur le bouton
  const lancerRecherche = () => {
    console.log("🚨 BOUTON CLIQUÉ ! Lancement de la recherche pour :", Film);
    setSearchTerm(Film);
  };
  const liste_films = movies.map((movie) => <Movie key={movie.id} data={movie} />);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Recherche de films</p>
        
        {/* --- ZONE DE RECHERCHE --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            required
            type="text"
            placeholder="Ex: Batman, Avatar..."
            value={Film}
            onChange={(event) => setFilm(event.target.value)}
            style={{ padding: '5px', fontSize: '16px' }}
          />
          <button onClick={lancerRecherche} style={{ padding: '5px 10px', fontSize: '16px', cursor: 'pointer' }}>
            Rechercher
          </button>
        </div>
        
        {/* --- AFFICHAGE DES RÉSULTATS --- */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          {movies.length > 0 ? (
            liste_films
          ) : (
            <p>Aucun film ne correspond à cette recherche.</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default Home;