import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKeys } from "./useKeys";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function HeaderLogo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function HeaderSearch({ searchKey, setSearchKey }) {
  const inputEl = useRef(null);

  useKeys("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setSearchKey("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={searchKey}
      onChange={(e) => setSearchKey(e.target.value)}
      ref={inputEl}
    />
  );
}

function HeaderResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function NavHeader({ children }) {
  return (
    <nav className="nav-bar">
      <HeaderLogo />
      {children}
    </nav>
  );
}

function ListedMovies({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

/* replaced this with CommonMovieList composition
function MovieList({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
} */

function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ movie, onRemoveWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onRemoveWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function SelectedMovieDetails({
  movieId,
  onSelectMovieClose,
  onSelectWatchedMovie,
  watched,
}) {
  const [movieDetails, setMovieDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const ratingCount = useRef(0);

  useEffect(() => {
    if (userRating) ratingCount.current++;
  }, [userRating]);

  useKeys("Escape", onSelectMovieClose);

  const isWatched = watched.map((movie) => movie.imdbID).includes(movieId);
  const watchedMovieRating = watched.find(
    (movie) => movie.imdbID === movieId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Runtime: runtime,
    Genre: genre,
    Director: director,
    Writer: writer,
    Actors: actors,
    Plot: plot,
    Awards: awards,
    Poster: poster,
    imdbRating,
  } = movieDetails;

  useEffect(
    function () {
      document.title = title ? `movie | ${title} ` : "usePopcorn";

      return function () {
        document.title = "usePopcorn"; // Reset title on unmount
      };
    },
    [title]
  );

  function handleWatchedMovie() {
    const watchedMovie = {
      imdbID: movieId,
      Title: title,
      Year: year,
      Poster: poster,
      runtime: Number(runtime.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating, // default user rating
      userRatingCount: ratingCount.current,
    };
    onSelectWatchedMovie(watchedMovie);
    onSelectMovieClose();
  }

  useEffect(
    function () {
      setIsLoading(true);
      //setMovieDetails({});
      async function fetchMovieDetails() {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${movieId}`
        );
        const data = await res.json();
        setMovieDetails(data);
        setIsLoading(false);
      }
      fetchMovieDetails();
    },
    [movieId]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onSelectMovieClose}>
              &larr;
            </button>
            <img src={poster} alt={`${movieDetails} poster`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                <span>{year}</span> &bull; {runtime}
              </p>
              <p>
                <span>🎭</span>
                <span>{genre}</span>
              </p>
              <p>
                <span>👨‍💼</span>
                <span>{director}</span>
              </p>
              <p>
                <span>✍️</span>
                <span>{writer}</span>
              </p>
              <p>
                <span>👥</span>
                <span>{actors}</span>
              </p>
              <p>
                <span>🎦</span>
                <span>{imdbRating}</span>
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handleWatchedMovie}>
                      <span>+</span> Add to watched
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this as {watchedMovieRating} 🌠...</p>
              )}
            </div>
            <p className="details-plot">{plot}</p>
          </section>
        </>
      )}
    </div>
  );
}

/*  replaced this with CommonMovieList composition
function WatchedMovieList() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedMoviesSummary watched={watched} />
          <ul className="list">
            {watched.map((movie) => (
              <WatchedMovie key={movie.imdbID} movie={movie} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
} */

function CommonList({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Error({ msg }) {
  return (
    <p className="error">
      <span>⚠️</span> {msg}
    </p>
  );
}

const KEY = "e5003b9c";

export default function App() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const { movies, isLoading, error } = useMovies(searchKey, KEY); //custom hook
  //const [watched, setWatched] = useState([]);

  const [watched, setWatched] = useLocalStorageState("watchedMovies", []);

  function handleMovieClick(id) {
    setSelectedMovieId((selectedId) => (selectedId === id ? null : id));
  }

  function closeSelectedMovie() {
    setSelectedMovieId(null);
  }

  function handleWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleRemmoveWatchedMovie(movieId) {
    setWatched((watched) =>
      watched.filter((movie) => movie.imdbID !== movieId)
    );
  }

  return (
    <>
      <NavHeader>
        <HeaderSearch searchKey={searchKey} setSearchKey={setSearchKey} />
        <HeaderResult movies={movies} />
      </NavHeader>
      <Main>
        {/*Passing children as props
        <CommonList element={<ListedMovies movies={movies} />} />
        <CommonList
          element={
            <>
              <WatchedMoviesSummary watched={watched} />
              <ul className="list">
                {watched.map((movie) => (
                  <WatchedMovie key={movie.imdbID} movie={movie} />
                ))}
              </ul>
            </>
          }
        />*/}

        <CommonList>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <ListedMovies movies={movies} onSelectMovie={handleMovieClick} />
          )}
          {error && <Error msg={error} />}
        </CommonList>
        <CommonList>
          {selectedMovieId ? (
            <SelectedMovieDetails
              movieId={selectedMovieId}
              onSelectMovieClose={closeSelectedMovie}
              onSelectWatchedMovie={handleWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMoviesSummary watched={watched} />
              <ul className="list">
                {watched.map((movie) => (
                  <WatchedMovie
                    key={movie.imdbID}
                    movie={movie}
                    onRemoveWatched={handleRemmoveWatchedMovie}
                  />
                ))}
              </ul>
            </>
          )}
        </CommonList>
      </Main>
    </>
  );
}
