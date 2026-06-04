import './Liked.css';
import Movie from '../../components/Movie/Movie';
import { useFetchLikedMovies } from './useFetchLikedMovies';

function Liked() {
  const { likedMovies, likedMoviesLoadingError, isLoading } =
    useFetchLikedMovies();

  return (
    <div className="Liked-container">
      <h1>Mes Films Aimés</h1>
      {isLoading && <p>Chargement de vos films aimés...</p>}
      {likedMoviesLoadingError && (
        <p style={{ color: 'red' }}>{likedMoviesLoadingError}</p>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          gap: '20px',
        }}
      >
        {likedMovies.length > 0
          ? likedMovies.map((movie) => <Movie key={movie.id} data={movie} />)
          : !isLoading && <p>Vous n'avez pas encore aimé de films.</p>}
      </div>
    </div>
  );
}

export default Liked;
