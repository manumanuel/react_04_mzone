import { useEffect, useState } from "react";

export function useLocalStorageState(key, initialState) {
  const [value, setValue] = useState(() => {
    const storedValues = localStorage.getItem(key);
    return storedValues ? JSON.parse(storedValues) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
