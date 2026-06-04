import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './Home.css';
import { useFetchFilms } from './recup_liste_films';
import Movie from '../../components/Movie/Movie';

function Home() {
  // 1. L'état pour ce qui est tapé en direct dans la barre
  const [Film, setFilm] = useState('');
  const [sorting_criterion, SetSorting_criterion] = useState('popularity');

  const UpdateSortedMovies = () => {
    SetSorting_criterion(document.getElementById('film-criterion').value);
  };

  const getSortedMovies = () => {
    let sorting_function;
    if (sorting_criterion === 'popularity') {
      sorting_function = (a, b) => b.popularity - a.popularity; //needs to be changed
    } else if (sorting_criterion === 'release_date') {
      sorting_function = (a, b) =>
        new Date(b.releaseYear) - new Date(a.releaseYear);
    } else if (sorting_criterion === 'rating') {
      sorting_function = (a, b) => b.rating - a.rating;
    } else if (sorting_criterion === 'alphabetical') {
      sorting_function = (a, b) => a.name.localeCompare(b.name);
    } else if (sorting_criterion === 'duration') {
      sorting_function = (a, b) => b.duration - a.duration;
    }

    return [...movies].sort(sorting_function);
  };

  // 2. L'état pour le mot-clé validé (quand on clique sur le bouton)
  const [searchTerm, setSearchTerm] = useState('');

  // 3. On passe ce mot-clé validé à notre moteur de recherche
  const { movies } = useFetchFilms(searchTerm);

  // 4. La fonction déclenchée par le clic sur le bouton
  const lancerRecherche = () => {
    console.log('🚨 BOUTON CLIQUÉ ! Lancement de la recherche pour :', Film);
    setSearchTerm(Film);
  };
  const liste_films = getSortedMovies().map((movie) => (
    <Movie key={movie.id} data={movie} />
  ));

  return (
    <div className="App">
      <header className="App-header">
        <h1>Recherche de films</h1>

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
          <button
            onClick={lancerRecherche}
            style={{ padding: '5px 10px', fontSize: '16px', cursor: 'pointer' }}
          >
            Rechercher
          </button>
        </div>

        <label for="film-criterion">Critère de tri</label>
        <select
          id="film-criterion"
          name="film-criterion"
          onChange={UpdateSortedMovies}
        >
          <option value="popularity">Popularité</option>
          <option value="release_date">Date de sortie</option>
          <option value="rating">Note</option>
          <option value="alphabetical">Alphabétique</option>
          <option value="duration">Durée</option>
        </select>

        {/* --- AFFICHAGE DES RÉSULTATS --- */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
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
