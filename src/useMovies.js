import { useEffect, useState } from "react";

export function useMovies(query, KEY) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      var controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error(data.Error);
          }
          //console.log(data);
          setMovies(data.Search);
          setIsLoading(false);
        } catch (error) {
          // console.log(error);
          if (error.name !== "AbortError") {
            setError("Failed to fetch movies");
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setIsLoading(false);
        return;
      }

      fetchMovies();

      return function () {
        controller.abort(); // Cleanup function to abort fetch on unmount
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
