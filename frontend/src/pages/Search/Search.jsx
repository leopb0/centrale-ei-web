import { useState } from 'react';
import './Search.css';
import { useFetchFilms } from './recup_liste_films';
import Movie from '../../components/Movie/Movie';

function Search() {
  const [film, setFilm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortingCriterion, setSortingCriterion] = useState('popularity');

  const { movies } = useFetchFilms(searchTerm);

  const getSortedMovies = () => {
    const fns = {
      popularity:   (a, b) => (b.popularity || 0) - (a.popularity || 0),
      release_date: (a, b) => (b.releaseYear || 0) - (a.releaseYear || 0),
      rating:       (a, b) => (b.rating || 0) - (a.rating || 0),
      alphabetical: (a, b) => a.name.localeCompare(b.name),
      duration:     (a, b) => (b.duration || 0) - (a.duration || 0),
    };
    return [...movies].sort(fns[sortingCriterion]);
  };

  return (
    <div className="Search-container">
      <h1 className="Search-title">Recherche de films</h1>

      <div className="Search-controls">
        <input
          type="text"
          className="Search-input"
          placeholder="Ex: Batman, Avatar..."
          value={film}
          onChange={(e) => setFilm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(film)}
        />
        <button className="Search-button" onClick={() => setSearchTerm(film)}>
          Rechercher
        </button>
      </div>

      <div className="Search-sort">
        <label className="Search-label" htmlFor="film-criterion">
          Critère de tri
        </label>
        <select
          id="film-criterion"
          className="Search-select"
          value={sortingCriterion}
          onChange={(e) => setSortingCriterion(e.target.value)}
        >
          <option value="popularity">Popularité</option>
          <option value="release_date">Date de sortie</option>
          <option value="rating">Note</option>
          <option value="alphabetical">Alphabétique</option>
          <option value="duration">Durée</option>
        </select>
      </div>

      <div className="Search-results">
        {movies.length > 0 ? (
          getSortedMovies().map((movie) => <Movie key={movie.id} data={movie} />)
        ) : (
          <p className="Search-empty">Aucun film ne correspond à cette recherche.</p>
        )}
      </div>
    </div>
  );
}

export default Search;
