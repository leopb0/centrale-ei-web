import axios from 'axios';
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './Home.css';
import { useFetchFilms } from './recup_liste_films';
import Movie from '../../components/Movie/Movie';

function Home() {
  const { movies } = useFetchFilms();
  const [Film, setFilm] = useState('');
  const liste_films = movies.map((movie) => <Movie data={movie} />);

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
