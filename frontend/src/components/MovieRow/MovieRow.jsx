import { useRef, useState, useEffect } from 'react';
import Movie from '../Movie/Movie';
import './MovieRow.css';

function MovieRow({ title, movies, large }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
  }, [movies]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 800, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="movie-row">
      <h2 className="movie-row-title">{title}</h2>
      <div className="movie-row-track">
        {canScrollLeft && (
          <button className="movie-row-arrow movie-row-arrow--left" onClick={() => scroll(-1)}>
            &#8249;
          </button>
        )}
        <div className="movie-row-scroll" ref={scrollRef} onScroll={updateArrows}>
          {movies.map((movie) => (
            <Movie key={movie.id} data={movie} large={large} />
          ))}
        </div>
        {canScrollRight && (
          <button className="movie-row-arrow movie-row-arrow--right" onClick={() => scroll(1)}>
            &#8250;
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieRow;
