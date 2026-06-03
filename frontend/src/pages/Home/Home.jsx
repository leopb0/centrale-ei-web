import axios from 'axios';
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './Home.css';
import { useFetchFilms } from './recup_liste_films';
import Movie from '../../components/Movie/Movie';

function Home() {
  const { movies } = useFetchFilms();
  const [Film, setFilm] = useState('');
  const [sorting_criterion, SetSorting_criterion] = useState('default');

  const UpdateSortedMovies = () => {
      SetSorting_criterion(document.getElementById('film-criterion').value);
  }

  const getSortedMovies = () => {
      let sorting_function;
      if (sorting_criterion === 'default') {
        sorting_function = (a, b) => 0;
      }
      else if (sorting_criterion === 'popularity') {
      sorting_function = (a, b) => b.popularity - a.popularity;//needs to be changed
      }
      else if (sorting_criterion === 'release_date') {
        sorting_function = (a, b) => new Date(b.releaseYear) - new Date(a.releaseYear);
      }
      else if (sorting_criterion === 'rating') {
        sorting_function = (a, b) => b.rating - a.rating;
      }
      else if (sorting_criterion === 'alphabetical') {
        sorting_function = (a, b) => a.name.localeCompare(b.name);
      }
      else if (sorting_criterion === 'duration') {
        sorting_function = (a, b) => b.duration - a.duration;
      }
      return [...movies].sort(sorting_function);
  }

  const liste_films = getSortedMovies().map((movie) => <Movie data={movie} />);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Liste des films</p>
        <input
          required
          type="text"
          value={Film}
          onChange={(event) => setFilm(event.target.value)}
        />
        <p>Film rentré : {Film}</p>
        <label for="film-criterion">Critère de tri</label>
        <select id="film-criterion" name="film-criterion" onChange={UpdateSortedMovies}>
          <option value="default">Par défaut</option>
          <option value="popularity">Popularité</option>
          <option value="release_date">Date de sortie</option>
          <option value="rating">Note</option>
          <option value="alphabetical">Alphabétique</option>
          <option value="duration">Durée</option>
        </select>
        <p>Films les plus polulaires :</p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {liste_films}
        </div>
      </header>
    </div>
  );
}

export default Home;
