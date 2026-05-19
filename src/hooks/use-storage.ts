import { useEffect, useState } from "react";

export function useStorageVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener("hrms:change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("hrms:change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return v;
}
